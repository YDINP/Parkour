import Device from "../../../framework/core/Device";
import Fx from "../../../framework/extension/fxplayer/Fx";
import FxPlayer from "../../../framework/extension/fxplayer/FxPlayer";
import { EaseType } from "../../../framework/extension/qanim/EaseType";
import Switcher from "../../../framework/ui/controller/Switcher";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { pdata } from "../data/PlayerInfo";
import { ResType } from "../game/model/BaseData";
import HeroData from "../game/model/HeroData";
import LevelData from "../game/model/LevelData";
import UIHeroShop from "./UIHeroShop";

let { ccclass, property } = cc._decorator


const starIconPath = {
    A: "Textures/ui/common/quality/a",
    B: "Textures/ui/common/quality/b",
    C: "Textures/ui/common/quality/c",
    D: "Textures/ui/common/quality/d"
}


@ccclass
export default class heroItem extends cc.Component {

    nameLab: cc.Label;
    lvLab: cc.Label
    starSp: cc.Sprite
    headIconSp: cc.Sprite;
    hpLab: cc.Label
    skillDisLab: cc.Label
    switcher: Switcher;
    limitTag: cc.Node;

    @property(cc.Label)
    label_amount: cc.Label = null;

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
        this.hpLab = ccUtil.find("lab_k/hp", this.node, cc.Label);
        this.skillDisLab = ccUtil.find("lab_k/skillDes", this.node, cc.Label);
        this.switcher = ccUtil.find("switcher", this.node, Switcher);
        this.limitTag = this.node.getChildByName("limitTag");


    }

    data: HeroData;
    ui: UIHeroShop;

    set(data: HeroData, ui: UIHeroShop) {

        this.data = data;
        this.ui = ui;

        let lv = pdata.getHeroLevel(data.id)
        let isLimit = data.quality == "A" ? true : false;
        this.node_selectFlag.active = data.id == pdata.selHero
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
        this.lvLab.string = "LV." + pdata.getHeroLevel(data.id);
        this.hpLab.string = data.hp.toString();

        ccUtil.setDisplay(this.starSp, starIconPath[data.quality]);
        ccUtil.setDisplay(this.headIconSp, data.avatar);
        //购买   所需要的资源数量
        this.label_amount.string = data.buyCost.num + "";
        //切换图标
        this.buyResSwitch.index = data.buyCost.type == ResType.Gold ? 1 : 0;
        this.lock_mask.active = lv <= 0;
        let lvdata = data.lvs[(lv - 1) == -1 ? 0 : (lv - 1)];
        this.upLabel.string = lvdata.up_cost.num + ""
        this.skillDisLab.string = cc.js.formatStr(data.lvDesc, lvdata.data)
        // if (lvdata) {
        //     this.skillDisLab.fontSize = 23;
        //     this.skillDisLab.lineHeight = 18;
        //     this.skillDisLab.node.y = -8;
        //     this.upLabel.string = lvdata.up_cost.num + ""
        //     this.skillDisLab.string = cc.js.formatStr(data.lvDesc, lvdata.data)
        // } else {
        //     this.skillDisLab.fontSize = 15;
        //     this.skillDisLab.lineHeight = 15;
        //     this.skillDisLab.node.y = -20;
        //     this.skillDisLab.string = data.desc;
        // }
    }

    clickSelect(e) {
         
        let lv = pdata.getHeroLevel(this.data.id)
        if (lv <= 0) {
            Toast.make("无法选择未解锁的英雄！")
            return
        }
        pdata.selectHero(this.data.id);
        this.ui.render();
    }

    up_hero(e) {
         
        let lv = pdata.getHeroLevel(this.data.id)
        let lvdata = this.data.lvs[lv - 1]
        if (this.data.lvs[lv] == null) {
            // max reached
            Toast.make('已到最高级！')
            this.switcher.index = 2
            return;
        }
        let canBuy = pdata.addRes(lvdata.up_cost, -1);
        if (canBuy) {
            let r = pdata.upHero(this.data.id);
            this.fxPlayer.play();
            cc.tween(this.lvLab.node).to(0.1, { scale: 1.5 }).to(0.1, { scale: 1 }).start()
        } else {
            let type = lvdata.up_cost.type == ResType.Gold ? "银币" : "钻石"
            Toast.make(type + "不足！");
        }
        this.refresh();
    }

    //upLabel
    buy_hero(e) {
         
        let canbuy = pdata.addRes(this.data.buyCost, -1);
        if (canbuy) {
            pdata.upHero(this.data.id);
        } else {
            let type = this.data.buyCost.type == ResType.Gold ? "银币" : "钻石"
            Toast.make(type + "不足！");
        }
        this.refresh();
    }

    refresh() {
        this.set(this.data, this.ui)
    }


}