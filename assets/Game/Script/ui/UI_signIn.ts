import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import FxPlayer from "../../../framework/extension/fxplayer/FxPlayer";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { pdata } from "../data/PlayerInfo";
import skinData from "../game/model/skinData";

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
        this.register(lab_date, _ => LocalizationManager.getText(`@skin.${data.id}.date`));
        // this.register(lab_date, _ => data.date);
        ccUtil.setDisplay(img_prize, data.path);
        this.register(lab_name, _ => LocalizationManager.getText(`@skin.${data.id}.name`));
        // this.register(lab_name, _ => data.name);
        this.register(lab_num, _ => "X" + data.number); 
        btn_isSignIn.clickEvents[0].customEventData = data.id + "";
        if (pdata.signIn.date == data.id) {
            let pr = !pdata.signIn.isSignIn;
            // ccUtil.setDisplay(btn_isSignIn, pr);
            btn_isSignIn.node.active = pr;
            ccUtil.setButtonEnabled(btn_isSignIn, pr);
            lab_date.node.color = pr ? cc.Color.WHITE : new cc.Color(156,156,156,255);
            // btn_isSignIn.interactable = !pdata.signIn.isSignIn;
            // let pr = !pdata.signIn.isSignIn ? "Textures/ui/signIn/title_signIn_2" : "Textures/ui/signIn/title_signIn_1"
        }
        else {
            let pr = data.id > pdata.signIn.date;
            // ccUtil.setDisplay(btn_isSignIn, pr);
            ccUtil.setButtonEnabled(btn_isSignIn, false);
            lab_date.node.color = pr ? new cc.Color(141,88,45,255): new cc.Color(141,88,45,255);
            // let pr = data.id > pdata.signIn.date ? "Textures/ui/signIn/title_signIn_2" : "Textures/ui/signIn/title_signIn_1"
            //btn_isSignIn.interactable = false;
        }
    }

    private click_signIn(e, customEventData) {
         
        let num = Number(customEventData);
        let data = ccUtil.get(skinData, num);
        pdata[data.type] += data.num;
        pdata.signIn = { date: num, isSignIn: true };
        pdata.signInTime = Date.now();
        pdata.save();
        e.target.parent.getComponent(FxPlayer).play();
        let img_isSignIn = ccUtil.find("btn_signIn/img_isSignIn", e.target.parent, cc.Sprite);
        ccUtil.setDisplay(img_isSignIn, "Textures/ui/signIn/title_signIn_1");
        ccUtil.setButtonEnabled(e.target, false)
        Toast.make(LocalizationManager.getText("@signInSuccess"));
        // Toast.make("签到成功")
    }

    private click_closes() {
         
        vm.hide(this);
    }

    onHidden() {
        pdata.sendToServer("gold,energy,diamond");
    }
    // update (dt) {}
}
