import { evt } from "../../../framework/core/event";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { pdata } from "../data/PlayerInfo";
import skinData from "../game/model/skinData";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UI_signIn extends mvcView {

    @property(cc.Layout)
    private lay_signIn: cc.Layout = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.register(this.lay_signIn, _ => csv.skin.values, this.signIn.bind(this));
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
        // 언어 변경 시 전체 리스트 갱신
        this.render();
    }

    onShow() {
        this.render();
    }

    start() {

    }

    private signIn(node: cc.Node, data: csv.skin_Row, idx: number) {
        node.name = "signIn_" + data.id;
        let lab_date = ccUtil.find("button_main_hero_bg_01/lab_date", node, cc.Label);
        let img_prize = ccUtil.find("img_prize", node, cc.Sprite);
        let lab_name = ccUtil.find("lab_name", node, cc.Label);
        let lab_num = ccUtil.find("lab_num", node, cc.Label);
        let btn_isSignIn = ccUtil.find("btn_signIn", node, cc.Button);
        let img_isSignIn = ccUtil.find("btn_signIn/img_isSignIn", node, cc.Sprite);
        // 언어 변경 시 실시간 반영을 위해 로컬라이징 키 사용
        this.register(lab_date, _ => LocalizationManager.getText(`@skin.${data.id}.date`));
        ccUtil.setDisplay(img_prize, data.path);
        this.register(lab_name, _ => LocalizationManager.getText(`@skin.${data.id}.name`));
        this.register(lab_num, _ => "X" + data.number);
        if (pdata.signIn.date == data.id) {
            btn_isSignIn.interactable = !pdata.signIn.isSignIn;
            let pr = !pdata.signIn.isSignIn ? "Textures/ui/default/title_signIn_2" : "Textures/ui/default/title_signIn_1"
            ccUtil.setDisplay(img_isSignIn, pr);
        }
        else {
            let pr = data.id > pdata.signIn.date ? "Textures/ui/default/title_signIn_2" : "Textures/ui/default/title_signIn_1"
            btn_isSignIn.interactable = false;
            ccUtil.setDisplay(img_isSignIn, pr);
        }
    }

    private click_signIn(e) {
         
        let num = Number(e.target.parent.name.split("_")[1]);
        let data = ccUtil.get(skinData, num);
        pdata[data.type] += data.num;
        pdata.signIn = { date: 1, isSignIn: true };
        // evt.emit("Effect.FlyObj", data.type, data.num);
        pdata.save();
        this.render();
        Toast.make(LocalizationManager.getText("@signInSuccess"));
        // Toast.make("签到成功")
    }

    private click_closes() {
        vm.hide(this);
    }

    // update (dt) {}
}
