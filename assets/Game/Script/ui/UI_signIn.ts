import { evt } from "../../../framework/core/event";
import FxPlayer from "../../../framework/extension/fxplayer/FxPlayer";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { pdata } from "../data/PlayerInfo";
import skinData from "../game/model/skinData";
import InventoryUI from "../view/TopMostInventoryUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UI_signIn extends mvcView {

    @property(cc.Layout)
    private lay_signIn: cc.Layout = null;

    @property(cc.Layout)
    private lay_signIn1: cc.Layout = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let skin1 = [];
        let skin2 = []
        for (let i = 0; i < csv.skin.values.length; i++) {
            if (i < 4) {
                skin1.push(csv.skin.values[i]);
            }
            else {
                skin2.push(csv.skin.values[i]);
            }
        }
        this.register(this.lay_signIn, _ => skin1, this.signIn.bind(this));
        this.register(this.lay_signIn1, _ => skin2, this.signIn.bind(this));
    }

    onEnable() {
        super.onEnable();
        // 언어 변경 이벤트 리스너 등록
        cc.director.on('localization:languageChanged', this.onLanguageChanged, this);
    }

    onDisable() {
        super.onDisable();
        // 언어 변경 이벤트 리스너 해제
        cc.director.off('localization:languageChanged', this.onLanguageChanged, this);
    }

    private onLanguageChanged() {
        // 언어 변경 시 전체 리스트 갱신 (register() 패턴 사용하므로 render() 호출)
        this.render();
    }

    onShow() {
        this.render();
    }

    start() {

    }

    private signIn(node: cc.Node, data: csv.skin_Row, idx: number) {
        let lab_date = ccUtil.find("lab_date", node, cc.Label);
        let img_prize = ccUtil.find("img_prize", node, cc.Sprite);
        let lab_name = ccUtil.find("lab_name", node, cc.Label);
        let lab_num = ccUtil.find("lab_num", node, cc.Label);
        let btn_isSignIn = ccUtil.find("btn_signIn", node, cc.Button);
        let img_isSignIn = ccUtil.find("btn_signIn/img_isSignIn", node, cc.Sprite);
        let img_check = ccUtil.find("img_check", node, cc.Sprite);
        let highlight_bg = cc.find("ui_pet_list_light_01", node); // 핑크 하이라이트 배경 (cc.Node)
        this.register(lab_date, _ => LocalizationManager.getText(`@skin.${data.id}.date`));
        // this.register(lab_date, _ => data.date);
        ccUtil.setDisplay(img_prize, data.path);
        this.register(lab_name, _ => LocalizationManager.getText(`@skin.${data.id}.name`));
        // this.register(lab_name, _ => data.name);
        this.register(lab_num, _ => "X" + data.number);
        btn_isSignIn.clickEvents[0].customEventData = data.id + "";

        // 현재 출석 가능한 날인지 확인: 오늘 날짜이고 아직 출석 안 함
        const isCurrentDay = pdata.signIn.date == data.id;
        const canSignIn = isCurrentDay && !pdata.signIn.isSignIn;

        // 이미 출석한 날인지 확인
        const isCompletedDay = data.id < pdata.signIn.date || (isCurrentDay && pdata.signIn.isSignIn);

        // 기본 색상 복원
        const titleColor = new cc.Color(141, 88, 45, 255); // 타이틀 원래 색상 (갈색)
        img_prize.node.color = cc.Color.WHITE;
        lab_num.node.color = cc.Color.WHITE;

        if (canSignIn) {
            // 현재 출석 가능한 날: 버튼 활성화, 핑크 하이라이트 표시, 타이틀 WHITE
            btn_isSignIn.node.active = true;
            ccUtil.setButtonEnabled(btn_isSignIn, true);
            lab_date.node.color = cc.Color.WHITE;
            lab_date.node.opacity = 255;
            img_prize.node.opacity = 255;
            lab_num.node.opacity = 255;
            img_check.node.active = false;
            if (highlight_bg) highlight_bg.active = true;
        } else if (isCompletedDay) {
            // 이미 출석 완료한 날: 반투명 처리, 타이틀 회색
            btn_isSignIn.node.active = false;
            ccUtil.setButtonEnabled(btn_isSignIn, false);
            lab_date.node.color = new cc.Color(156, 156, 156, 255);
            lab_date.node.opacity = 150;
            img_prize.node.opacity = 150;
            lab_num.node.opacity = 150;
            img_check.node.active = true;
            if (highlight_bg) highlight_bg.active = false;
        } else {
            // 미래 날짜: 비활성화, 타이틀 갈색
            btn_isSignIn.node.active = false;
            ccUtil.setButtonEnabled(btn_isSignIn, false);
            lab_date.node.color = titleColor;
            lab_date.node.opacity = 255;
            img_prize.node.opacity = 255;
            lab_num.node.opacity = 255;
            img_check.node.active = false;
            if (highlight_bg) highlight_bg.active = false;
        }
    }

    private click_signIn(e, customEventData) {

        let num = Number(customEventData);
        let data = ccUtil.get(skinData, num);

        // 버튼 비활성화 및 UI 업데이트 먼저 처리
        ccUtil.setButtonEnabled(e.target, false);
        let img_isSignIn = ccUtil.find("btn_signIn/img_isSignIn", e.target.parent, cc.Sprite);
        ccUtil.setDisplay(img_isSignIn, "Textures/ui/signIn/title_signIn_1");

        // FxPlayer 체크마크 이펙트 재생
        e.target.parent.getComponent(FxPlayer).play();

        // 획득 연출 시작 위치 설정 (보상 아이템 이미지에서 시작)
        if (InventoryUI.instance) {
            let img_prize = cc.find("img_prize", e.target.parent);
            InventoryUI.instance.setTarget(img_prize || e.target.parent);
        }

        // 보상 지급 (InventoryUI가 이벤트를 받아 flyToInventory 연출 자동 실행)
        pdata[data.type] += data.num;
        pdata.signIn = { date: num, isSignIn: true };
        pdata.signInTime = Date.now();
        pdata.save();

        // 전체 UI 갱신 (핑크 배경, 버튼 상태 등 올바르게 업데이트)
        this.render();

        Toast.make(LocalizationManager.getText("@signInSuccess"));
    }

    private click_closes() {
        vm.hide(this);
    }

    onHidden() {
        pdata.sendToServer("gold,energy,diamond");
    }
    // update (dt) {}
}
