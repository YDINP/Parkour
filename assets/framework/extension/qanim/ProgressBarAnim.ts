import UIBaseAnim from "./UIBaseAnim";
import { lerpf } from "./Extension";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("基础动画/ProgressBarAnim")
export default class ProgressBarAnim extends UIBaseAnim {

    bar: cc.ProgressBar = null
    @property
    from: number = 0;
    @property
    to: number = 1;
    onLoad() {
        this.bar = this.getComponent(cc.ProgressBar);
    }
    start() { }


    onTick(t: any) {
        if (!this.bar) return;
        this.bar.progress = lerpf(this.from, this.to, t);
    }

    play(duration, from, to) {
        this.pasr.a = duration;
        this.from = from;
        this.to = to;
        return super.play();
    }

}