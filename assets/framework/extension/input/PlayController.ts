import Device from "../../core/Device";
import Signal from "../../core/Signal";

const { ccclass, property, menu } = cc._decorator;
enum Transition {
    NORMAL,
    SCALE,
};
@ccclass
@menu("mimgame/deprecate/PlayController")
export default class PlayController extends cc.Component {

    isTouching: boolean = false;

    @property
    canHolding: boolean = false;

    holdingSigal: Signal = new Signal();

    pressSignal: Signal = new Signal();

    releaseSignal: Signal = new Signal()

    @property({ type: cc.Enum(Transition) })
    transition: Transition = Transition.NORMAL;


    @property({ visible() { return this.transition == Transition.SCALE } })
    zoomScale: number = 1.2;
    @property({ type: cc.Node, visible() { return this.transition == Transition.SCALE } })
    scaleTarget: cc.Node = null;
    @property({ visible() { return this.transition == Transition.SCALE } })
    zoomSpeedScalar: number = 0.2;

    @property
    vibrate: boolean = false;

    pos: cc.Vec2 = cc.Vec2.ZERO;

    curZoomScale = 1;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onEnd, this);
        cc.game.on(cc.game.EVENT_HIDE, this.pauseGame, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onBegan, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onEnd, this);
    }

    pauseGame() {
        this.onEnd();
    }

    start() {
        if (this.scaleTarget == null) {
            this.scaleTarget = this.node;
        }
    }

    onBegan(e) {
        if (this.vibrate) {
            Device.vibrate();
        }
        this.isTouching = true;
        let p = e.touch.getLocation()
        p = this.node.convertToNodeSpaceAR(p)
        this.pos = p;
        this.pressSignal.fire(p)
        if (this.transition == Transition.SCALE) {
            this.curZoomScale = this.zoomScale;
        }
    }


    onMove(e) {
        let p = e.touch.getLocation()
        p = this.node.convertToNodeSpaceAR(p)
        this.pos = p;
    }

    onEnd() {
        this.isTouching = false;
        this.releaseSignal.fire(this.pos);
        if (this.transition == Transition.SCALE) {
            this.curZoomScale = 1;
        }
    }

    update() {
        if (this.canHolding && this.isTouching) {
            this.holdingSigal.fire(this.pos);
        }
        if (this.transition == Transition.SCALE) {
            this.scaleTarget.scale = cc.misc.lerp(this.scaleTarget.scale, this.curZoomScale, this.zoomSpeedScalar)
        }
    }

}