import Device from "../../../framework/core/Device";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import LoadingScene from "../common/LoadingScene";
import { root } from "../game/Game"

let { ccclass, property } = cc._decorator
@ccclass
export default class UIPause extends mvcView {

    onLoad() {
        this.onClick("btn_continue", this.click_continue)
        this.onClick("btn_home", this.click_home)
    }

    onShow() {
        root.pause();
    }

    onHidden() {
        root.resume();
    }

    click_continue() {
         
        root.resume();
        vm.hide(this);
    }

    click_home() {
         
        Loading.show(0.5);
        this.scheduleOnce(() => {
            LoadingScene.goto("Home")
        }, 0.5)
    }
}