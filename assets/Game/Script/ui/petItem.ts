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
    // 동적 로컬라이징 라벨
    selectedLabel: cc.Label;  // select/heidi/New Label
    maxLevelLabel: cc.Label;  // switcher/maxlabel/New Label

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
        // 동적 로컬라이징 라벨 참조
        this.selectedLabel = ccUtil.find("select/heidi/New Label", this.node, cc.Label);
        this.maxLevelLabel = ccUtil.find("switcher/maxlabel/New Label", this.node, cc.Label);
    }

    data: PetData;
    ui: UIPet;

    set(data: PetData, ui: UIPet) {
        this.data = data;
        this.ui = ui;

        let lv = pdata.getPetLevel(data.id)
        // 한정 펫 표시 제거 (quality A 기준이 아닌 별도 관리 필요시 수정)
        let isLimit = false;

        // 상태가 변경될 때만 애니메이션 재생 (깜빡임 방지)
        const wasSelected = this.node_selectFlag.active || false;
        const isSelected = data.id == pdata.selPet;

        this.node_selectFlag.active = isSelected;
        // 선택 상태가 false → true로 변경될 때만 애니메이션 재생
        if (isSelected && !wasSelected) {
            this.node_selectFlag.opacity = 0;
            cc.tween(this.node_selectFlag).to(0.2, { opacity: 255 }).start()
            this.node_selectFlag.scale = 1.3;
            cc.tween(this.node_selectFlag).to(0.2, { scale: 1 }, { easing: EaseType[EaseType.backOut] }).start()
        } else if (isSelected) {
            // 이미 선택된 상태면 애니메이션 없이 바로 표시
            this.node_selectFlag.opacity = 255;
            this.node_selectFlag.scale = 1;
        }

        let nextLv = data.lvs[lv]
        if (!nextLv) {
            // max level 
            this.switcher.index = 2;
        } else {
            this.switcher.index = lv == 0 ? 0 : 1;
        }

        // 언어 변경 시 실시간 반영을 위해 캐시된 data.name 대신 직접 로컬라이징 호출
        this.nameLab.string = LocalizationManager.getText(`@pet.${data.id}.name`);
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
            // 언어 변경 시 실시간 반영을 위해 캐시된 data.lvDesc 대신 직접 로컬라이징 호출
            const lvDesc = LocalizationManager.getText(`@pet.${data.id}.lvdesc`);
            this.skillDisLab.string = cc.js.formatStr(lvDesc, lvdata.data)
        }

        // 동적 로컬라이징 라벨 업데이트
        this.updateStaticLabels();
    }

    /**
     * 정적 로컬라이징 라벨 업데이트 (select/heidi, switcher/maxlabel)
     */
    private updateStaticLabels() {
        if (this.selectedLabel) {
            this.selectedLabel.string = LocalizationManager.getText("@heroShop.item.selected");
        }
        if (this.maxLevelLabel) {
            this.maxLevelLabel.string = LocalizationManager.getText("@maxLevel");
        }
    }

    clickSelect(e) {
        let lv = pdata.getPetLevel(this.data.id);
        if (lv <= 0) {
            Toast.make(LocalizationManager.getText("@text.cannot_select_unlocked_pet"));
            return;
        }

        // 이미 선택된 펫이면 아무것도 하지 않음
        if (this.data.id == pdata.selPet) {
            return;
        }

        // 이전 선택 펫의 selectFlag 비활성화
        this.ui.updateSelectionOnly(pdata.selPet, false);

        // 새 펫 선택
        pdata.selectPet(this.data.id);

        // 현재 아이템의 selectFlag 활성화 (애니메이션 포함)
        this.setSelected(true);
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
            // 레벨업 후 필요한 UI만 빠르게 업데이트 (전체 refresh 대신)
            this.refreshLevelOnly();
        } else {
            let type = lvdata.up_cost.type == ResType.Gold ? LocalizationManager.getText("@currency.silver") : LocalizationManager.getText("@currency.dia");
            // let type = lvdata.up_cost.type == ResType.Gold ? "银币" : "钻石";
            Toast.make(type + LocalizationManager.getText("@text.not_enough_resource") + "！");
        }
    }


    refresh() {
        this.set(this.data, this.ui)
    }

    /**
     * 레벨업 후 필요한 UI만 빠르게 업데이트 (이미지 재로드 없음)
     * - 레벨 라벨, 업그레이드 비용, 스킬 설명, switcher 상태만 갱신
     */
    refreshLevelOnly() {
        const lv = pdata.getPetLevel(this.data.id);

        // 레벨 라벨 업데이트
        this.lvLab.string = "LV." + lv;

        // switcher 상태 업데이트 (최대 레벨 체크)
        const nextLv = this.data.lvs[lv];
        if (!nextLv) {
            this.switcher.index = 2; // max level
        } else {
            this.switcher.index = lv == 0 ? 0 : 1;
        }

        // 업그레이드 비용 및 스킬 설명 업데이트
        const lvdata = this.data.lvs[lv - 1];
        if (lvdata) {
            this.upLabel.string = lvdata.up_cost.num + "";
            const lvDesc = LocalizationManager.getText(`@pet.${this.data.id}.lvdesc`);
            this.skillDisLab.string = cc.js.formatStr(lvDesc, lvdata.data);
        }

        // 정적 로컬라이징 라벨 업데이트
        this.updateStaticLabels();
    }

    /**
     * 선택 상태 업데이트 (이미지 재로딩 없이 selectFlag만 변경)
     */
    setSelected(selected: boolean) {
        this.node_selectFlag.active = selected;
        if (selected) {
            this.node_selectFlag.opacity = 0;
            this.node_selectFlag.scale = 1.3;
            cc.tween(this.node_selectFlag).to(0.2, { opacity: 255 }).start();
            cc.tween(this.node_selectFlag).to(0.2, { scale: 1 }, { easing: EaseType[EaseType.backOut] }).start();
        }
    }

    /**
     * 언어 변경 시 텍스트만 업데이트 (스파인/이미지 재로드 없음)
     * Kapi 프로젝트의 _refreshLocalizedTexts 패턴 적용
     */
    updateLabelsOnly() {
        if (!this.data) return;

        // 이름 라벨
        this.nameLab.string = LocalizationManager.getText(`@pet.${this.data.id}.name`);

        // 스킬 설명 라벨
        const lv = pdata.getPetLevel(this.data.id);
        const lvdata = this.data.lvs[lv - 1];
        if (lvdata) {
            const lvDesc = LocalizationManager.getText(`@pet.${this.data.id}.lvdesc`);
            this.skillDisLab.string = cc.js.formatStr(lvDesc, lvdata.data);
        }

        // 정적 로컬라이징 라벨 업데이트
        this.updateStaticLabels();
    }

}