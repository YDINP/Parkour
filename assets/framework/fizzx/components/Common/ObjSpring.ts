import FizzBody, { FizzCollideInterface } from "../../../../framework/fizzx/components/FizzBody";
import Device from "../../../core/Device";
import BodyBase from "./BodyBase";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("fizzx/ObjSpring")
export default class ObjSpring extends BodyBase {

    bounce: number = 0;

    @property
    left_bounce: boolean = false;

    @property
    right_bounce: boolean = false;

    @property
    top_bounce: boolean = false;

    @property(cc.Component.EventHandler)
    bounce_callback: cc.Component.EventHandler = new cc.Component.EventHandler();

    @property({ type: cc.AudioClip })
    audio: cc.AudioClip = null;

    onLoad() {
        this.bounce = this.body.bounce;
    }

    start() { }

    onFizzCollideEnter(b: FizzBody, nx, ny, pen) {
        if (!this.left_bounce && nx == 1) {
            this.body.bounce = 0;
        }
        else if (!this.right_bounce && nx == -1) {
            this.body.bounce = 0;
        }
        else if (!this.top_bounce && ny < 0) {
            this.body.bounce = 0;
        } else if (b.yv < 0) {
            this.body.bounce = this.bounce;
            this.bounce_callback.emit([this.bounce_callback.customEventData])
            if (this.audio)
                Device.playEffect(this.audio, false);
        }
    }

}