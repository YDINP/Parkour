import Device from "../../../framework/core/Device";
import Fx from "../../../framework/extension/fxplayer/Fx";
import FxPlayer from "../../../framework/extension/fxplayer/FxPlayer";
import { EaseType } from "../../../framework/extension/qanim/EaseType";
import Switcher from "../../../framework/ui/controller/Switcher";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { pdata } from "../data/PlayerInfo";
import { ResType } from "../game/model/BaseData";
import LevelData from "../game/model/LevelData";
import PetData from "../game/model/PetData";
import UIPet from "./UIPet";
import { TextConfirmInfo } from "./UITextConfirm";

let { ccclass, property } = cc._decorator


const starIconPath = {
    A: "Textures/kakao/06friends/ui_img_friends_tier_a",
    B: "Textures/kakao/06friends/ui_img_friends_tier_b",
    C: "Textures/kakao/06friends/ui_img_friends_tier_c",
    D: "Textures/kakao/06friends/ui_img_friends_tier_D"
}


@ccclass
export default class petItem extends cc.Component {

    nameLab: cc.Label;
    lvLab: cc.Label
    starSp: cc.Sprite
    headIconSp: cc.Sprite;
    skillDisLab: cc.Label
    switcher: Switcher;
    limitTag: cc.Node;

    @property(Switcher)
    buyResSwitch: Switcher = null;

    @property(cc.Node)
    lock_mask: cc.Node = null;

    @property(cc.Node)
    node_selectFlag: cc.Node = null;

    @property(FxPlayer)
    fxPlayer: FxPlayer = null;

    @property(cc.Label)
    upLabel: cc.Label = null;

    onLoad() {
        this.nameLab = ccUtil.find("nameLab", this.node, cc.Label);
        this.lvLab = ccUtil.find("heroLv", this.node, cc.Label);
        this.starSp = ccUtil.find("starLv", this.node, cc.Sprite);
        this.headIconSp = ccUtil.find("headIcon", this.node, cc.Sprite);
        this.skillDisLab = ccUtil.find("lab_k/skillDes", this.node, cc.Label);
        this.switcher = ccUtil.find("switcher", this.node, Switcher);
        this.limitTag = this.node.getChildByName("limitTag");


    }

    data: PetData;
    ui: UIPet;

    set(data: PetData, ui: UIPet) {
        this.data = data;
        this.ui = ui;

        let lv = pdata.getPetLevel(data.id)
        let isLimit = data.quality == "A" ? true : false;
        this.node_selectFlag.active = data.id == pdata.selPet
        if (this.node_selectFlag.active) {
            // 播放选择动画 
            this.node_selectFlag.opacity = 0;
            cc.tween(this.node_selectFlag).to(0.2, { opacity: 255 }).start()
            this.node_selectFlag.scale = 1.3;
            cc.tween(this.node_selectFlag).to(0.2, { scale: 1 }, { easing: EaseType[EaseType.backOut] }).start()
        }

        let nextLv = data.lvs[lv]
        if (!nextLv) {
            // max level 
            this.switcher.index = 2;
        } else {
            this.switcher.index = lv == 0 ? 0 : 1;
        }

        this.nameLab.string = data.name;
        this.limitTag.active = isLimit;
        this.lvLab.string = "LV." + lv;

        ccUtil.setDisplay(this.starSp, starIconPath[data.quality]);
        ccUtil.setDisplay(this.headIconSp, data.avatar);
        // //购买   所需要的资源数量
        // this.label_amount.string = data.buyCost.num + "";
        // //切换图标
        // this.buyResSwitch.index = data.buyCost.type == ResType.Gold ? 1 : 0;
        this.lock_mask.active = lv <= 0;
        let lvdata = data.lvs[lv - 1]
        if (lvdata) {
            this.upLabel.string = lvdata.up_cost.num + ""
            this.skillDisLab.string = cc.js.formatStr(data.lvDesc, lvdata.data)
        }


    }

    clickSelect(e) {
         
        let lv = pdata.getPetLevel(this.data.id)
        if (lv <= 0) {
            Toast.make(LocalizationManager.getText("@text.cannot_select_unlocked_pet"));
            // Toast.make("无法选择未解锁的宠物！")
            return
        }
        pdata.selectPet(this.data.id);
        this.ui.render();
    }

    up_pet(e) {

        let lv = pdata.getPetLevel(this.data.id)
        let lvdata = this.data.lvs[lv - 1]
        if (this.data.lvs[lv] == null) {
            // max reached
            Toast.make(LocalizationManager.getText("@text.max_level_reached"));
            // Toast.make('已到最高级！')
            this.switcher.index = 2
            return;
        }

        // 다이아 소모 시 확인 팝업
        if (lvdata.up_cost.type == ResType.Diamond) {
            vm.show("UITextConfirm", {
                title: LocalizationManager.getText("@text.confirm"),
                content: LocalizationManager.getText("@currency.dia") + " " + lvdata.up_cost.num + LocalizationManager.getText("@text.confirm_use"),
                confirmTxt: LocalizationManager.getText("@text.confirm"),
                isShowCancel: true,
                cancelIsDaley: false,
                confirmCall: () => {
                    this.executeUpPet(lvdata);
                },
                cancelCall: () => {}
            } as TextConfirmInfo);
            return;
        }

        this.executeUpPet(lvdata);
    }

    private executeUpPet(lvdata) {
        let canBuy = pdata.addRes(lvdata.up_cost, -1);
        if (canBuy) {
            let r = pdata.upPet(this.data.id);
            this.fxPlayer.play();
            cc.tween(this.lvLab.node).to(0.1, { scale: 1.5 }).to(0.1, { scale: 1 }).start()
        } else {
            let type = lvdata.up_cost.type == ResType.Gold ? LocalizationManager.getText("@currency.silver") : LocalizationManager.getText("@currency.dia");
            // let type = lvdata.up_cost.type == ResType.Gold ? "银币" : "钻石";
            Toast.make(type + LocalizationManager.getText("@text.not_enough_resource") + "！");
        }
        this.refresh();
    }


    refresh() {
        this.set(this.data, this.ui)
    }


}