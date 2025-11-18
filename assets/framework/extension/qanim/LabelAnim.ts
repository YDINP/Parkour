import { EaseType } from "./EaseType";
import UIBaseAnim from "./UIBaseAnim";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("基础动画/LabelAnim")
export default class LabelAnim extends UIBaseAnim {
    duration: number = 1;
    from: number = 0;
    to: number = 0;
    label: cc.Label = null

    templateStr: string = "%s"
    onLoad() {
        this.label = this.getComponent(cc.Label)
    }

    start() {

    }

    play(duration: number = 0, from: number = 0, to: number = 0) {
        this.from = from
        this.to = to
        this.duration = duration || this.duration;

        this.pasr.a = this.duration;
        this.pasr.reset();
        return this.onFinish.wait();

    }

    onTick(t) {
        let v = cc.misc.lerp(this.from, this.to, t);
        this.label.string = cc.js.formatStr(this.templateStr, v.toFixed());
    }


}