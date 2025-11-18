import Switcher from "./Switcher";
import Signal from "../../core/Signal";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/Controller/AutoSwitch")
export default class AutoSwitch extends cc.Component {
    switcher: Switcher = null
    @property
    interval: number = 1;
    onFinish: Signal = new Signal();
    @property
    loop: boolean = false

    isPlaying: boolean = false;

    onLoad() {
        this.switcher = this.getComponent(Switcher);
        this.isPlaying = false;
    }
    c: number = 0

    play(interval = 0) {
        this.isPlaying = true;
        this.interval = interval || this.interval;
        this.c = 0;
        this.switch()
        this.stop();
        this.schedule(this.switch, this.interval);
        return this.onFinish.wait();
    }

    stop() {
        this.unschedule(this.switch);
    }

    switch() {
        this.switcher.switch();
        this.c++;
        if (this.loop) return;
        if (this.c >= this.switcher._childrenCount) {
            this.unschedule(this.switch);
            this.isPlaying = false;
            this.onFinish.fire();
        }
    }
}