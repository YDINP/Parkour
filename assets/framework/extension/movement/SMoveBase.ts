import ccUtil from "../../utils/ccUtil";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MoveBase extends cc.Component {
    @property
    moveOnLoad: boolean = true;
    @property
    velocity: cc.Vec2 = cc.Vec2.RIGHT;
    @property({ type: cc.Node, displayName: "target" })
    tar: cc.Node = null


    @property
    rotateByVelocity: boolean = false;

    @property
    rotationOffset: number = 0;


    // _updateCallback: Function;
    // _callbackTarget: any;
    // _cmdUpdateDur: number = 0;
    // _updateTimer: number = 0;

    _paused: boolean = false;

    tarPos: cc.Vec2 = cc.Vec2.ZERO;

    onTargetChanged(t) {

    }


    set target(k: cc.Vec2 | cc.Node) {
        if (k instanceof cc.Vec3 || k instanceof cc.Vec2) {
            this.tarPos = k;
        } else {
            this.tar = k;
        }
        this.onTargetChanged(k)
    }

    get targetPosition() {
        return this.tarPos;
    }

    get target() {
        return this.tar;
    }

    reset() {
    }

    _step(dt?) {

    }

    onBeforeUpdate(callback, target, duration = -1) {

    }

    onDisable() {
        // this.removeCommand()
    }

    // addCommand(callback, target, duration = -1) {
    //     this._updateTimer = 0;
    //     this._updateCallback = callback,
    //         this._callbackTarget = target;
    //     this._cmdUpdateDur = duration;
    // }

    // removeCommand(callback?, t?) {
    //     this._updateCallback = null;
    // }

    update(dt) {
        // if (this._updateCallback) {
        //     this._updateCallback.call(this._callbackTarget, this)
        //     if (this._cmdUpdateDur != -1) {
        //         this._updateTimer = this._updateTimer + dt;
        //         if (this._updateTimer >= this._cmdUpdateDur) {
        //             this.removeCommand();
        //         }
        //     }
        // }
    }

    isInDistance(targetpos: cc.Vec2, radiusSq) {
        // let c = this.node.getBoundingBoxToWorld().center
        let c = ccUtil.getWorldPosition(this.node)
        let v = targetpos.sub(c);
        if (v.magSqr() < radiusSq) {
            return true;
        }
        return false;
    }

    isStatic(variance = 1) {
        return this.velocity.fuzzyEquals(cc.Vec2.ZERO, variance);
    }

    step(dt) {
        if (this.moveOnLoad || this._paused) {
            return;
        }
        this._step(dt);
    }

    pause() {
        this._paused = true;
    }

    resume() {
        this._paused = false;
    }


    lateUpdate() {
        if (this.moveOnLoad && !this._paused) {
            this._step()
        }
    }

}