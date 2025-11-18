import FizzBody from "../../../../framework/fizzx/components/FizzBody";
import Signal from "../../../core/Signal";
import BodyBase from "./BodyBase";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("fizzx/ObjJumper")
export default class ObjJumper extends BodyBase {

    @property
    jumpInterval = 2;

    @property(cc.Vec2)
    jumpForce: cc.Vec2 = cc.v2(100, 500);

    @property
    turnOnCollision: boolean = false;

    dir: number = 1;

    lastJumpTime = 0;
    timeElapsed = 0;
    canJump = false;

    isLand = false;

    onLandSignal = new Signal();

    onJumpSignal = new Signal();

    @property
    active: boolean = false;

    onLoad() {
    }

    onDestroy() {
        this.onLandSignal.clear()
        this.onJumpSignal.clear();
    }

    start() {
        this.dir = this.node.scaleX;
    }

    onFalloff() {
        this.node.destroy()
    }

    onUpdate(dt) {
        if (!this.active) {
            return;
        }
        this.timeElapsed += dt;
        this.node.scaleX = this.dir;
        if (this.body.isLand) {
            if (this.canJump) {
                this.body.yv = this.jumpForce.y;
                this.body.xv = this.jumpForce.x * this.dir;
                this.lastJumpTime = this.timeElapsed
                this.onJump();
            }
            if (!this.isLand) {
                this.isLand = true;
                this.onLand();
            }
        } else {
            this.isLand = false;
        }
        if (this.timeElapsed - this.lastJumpTime > this.jumpInterval) {
            this.canJump = true;
        } else {
            this.canJump = false
        }
    }

    onLand() {
        this.onLandSignal.fire()
    }

    onJump() {
        this.onJumpSignal.fire();
    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        // this.body
        if (this.turnOnCollision && nx == -this.dir) {
            this.dir = nx;
        }
    }

}
