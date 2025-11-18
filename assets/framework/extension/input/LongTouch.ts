import Signal from "../../core/Signal";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/deprecate/LongTouch")
export default class LongTouch extends cc.Component {
    public pressedTime = 0;
    public isPressing = false;

    @property
    public targetTime = 1;

    onLongTouch: Signal = new Signal();

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
    }

    start() { }

    onTouchBegan(e) {
        this.pressedTime = 0;
        this.isPressing = true;
        e.stopPropagation();
    }

    update(dt) {
        if (this.isPressing) {
            this.pressedTime += dt;
            if (this.pressedTime >= this.targetTime) {
                this.onLongTouch.fire();
                this.pressedTime = 0;
            }
        }
    }

    onTouchEnded() {
        this.isPressing = false;
    }

    waitForPress(duration) {
        this.targetTime = duration;
        return this.onLongTouch.wait();
    }

}