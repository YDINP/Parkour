import { EaseType } from "./EaseType";
import { PasrTimer } from "../utils/PasrTimer";
import Signal from "../../core/Signal";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class UIBaseAnim extends cc.Component {
    pasr: PasrTimer = new PasrTimer(0, 0, 0, 0);
    @property({ type: cc.Enum(EaseType) })
    easeType: EaseType = EaseType.linear;

    onFinish: Signal = new Signal();


    onFinished() {
        this.enabled = false;
    }

    onLoad() {
        this.onFinish.add(this.onFinished, this);
    }

    onDestroy() {
        this.onFinish.remove(this.onFinished, this);
    }

    start() {

    }

    play() {
        this.enabled = true;
        this.pasr.reset();
        return this.onFinish.wait();
    }

    update(dt) {
        if (!this.pasr.isFinished()) {
            let t = this.pasr.Tick(dt)
            if (this.pasr.isFinished()) {
                this.onFinish.fire();
                return;
            }
            let f = cc.easing[EaseType[this.easeType]]
            t = f(t)
            this.onTick(t);
        }
    }

    abstract onTick(t)

}