import Device from "../../../framework/core/Device";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import LoadingScene from "../common/LoadingScene";
import { pdata } from "../data/PlayerInfo";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";

let { ccclass, property } = cc._decorator
@ccclass
export default class UIFail extends mvcView {

    anim: cc.Animation = null;

    onLoad() {
        this.onClick("btn_continue", this.click_continue)
        this.onClick("btn_home", this.click_home)
        this.anim = this.getComponentInChildren(cc.Animation)
    }

    onShow() {
        this.anim.play();
    }

    click_continue() {
         
        Loading.show(0.5);
        if (pdata.energy <= 0) {
            // Toast 제거 - 팝업이 이미 충분한 정보 제공
            vm.show("UIRedHeartShop", () => {
                pdata.energy--;
                pdata.save("energy");
                vm.hide("UIRedHeartShop");
                this.scheduleOnce(() => {
                    Loading.show(0.5);
                    LoadingScene.goto("Main", { type: "restart" })
                }, 0.5)
            })
            return
        }
        pdata.energy--;
        pdata.save("energy");
        this.scheduleOnce(() => {
            Loading.show(0.5);
            LoadingScene.goto("Main", { type: "restart" })
        }, 0.5)
    }


    click_home() {
         
        Loading.show(0.5);
        LoadingScene.goto("Home", { type: "fail", level: pdata.playinglv })
    }

    onHidden() {
        pdata.sendToServer("energy");
    }
}