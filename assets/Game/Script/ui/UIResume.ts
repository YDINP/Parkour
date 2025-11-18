import { EaseType } from "../../../framework/extension/qanim/EaseType";
import ccUtil from "../../../framework/utils/ccUtil";

let { ccclass, property } = cc._decorator
@ccclass
export default class UIResume extends cc.Component {
    label: cc.Label = null;

    startNum: number = 3;

    onHideCallBack: Function;

    onLoad() {
        this.label = ccUtil.find("countdown", this.node, cc.Label)
    }

    onShow(n) {
        this.onHideCallBack = n;
        this.startNum = 3;
        this.unschedule(this.countdown);
        this.schedule(this.countdown, 1)
        this.countdown();
    }

    countdown() {
        this.label.string = (this.startNum--).toString();
        this.label.node.opacity = 0;
        this.label.node.scale = 2;
        cc.tween(this.label.node).to(0.3, { opacity: 255 }, { easing: EaseType[EaseType.backOut] }).start()
        cc.tween(this.label.node).to(0.3, { scale: 1 }, { easing: EaseType[EaseType.backOut] }).start()
        if (this.startNum < 0) {
            vm.hide(this)
        }
    }

    onHidden() {
        this.onHideCallBack && this.onHideCallBack();
        this.onHideCallBack = null;
    }

}