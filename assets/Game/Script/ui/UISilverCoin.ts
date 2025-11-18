import Device from "../../../framework/core/Device";
import mvcView from "../../../framework/ui/mvcView";
import { IView } from "../../../framework/ui/View";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UISilverCoin extends mvcView implements IView {

    @property(cc.Layout)
    content: cc.Layout = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.register(this.content, _ => csv.SilverCoin.values);
    }

    onShow() {
        this.render();
    }

    start() {
    }

    click_closes() {
         
        vm.hide(this);
    }

    // update (dt) {}
}
