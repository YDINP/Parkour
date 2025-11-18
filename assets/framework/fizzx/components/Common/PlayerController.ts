import Player from "../../../../Game/Script/game/Player";
import FSM from "../../../core/FSM";
import Signal from "../../../core/Signal";
import FizzBody from "../FizzBody";

const { ccclass, property } = cc._decorator;
export enum PlayerState {
    Land,
    Run,
    Idle,
    Jump,
    Fall,
    Dead,
}

// player_walk
// player_jump
// player_fall
// player_dead
// player_idle 
// player-hurt


@ccclass
export default class PlayerController extends cc.Component {
    body: FizzBody;

    @property(cc.Node)
    displayNode: cc.Node = null;

    // @property(cc.Animation)
    animation: cc.Animation = null;

    @property
    speed: number = 80;

    @property
    maxSpeed: number = 200;

    @property
    maxSpeedOnIce: number = 400;

    @property
    jumpInstantForce: number = 640

    @property
    jumpHoldForce: number = 32

    //落地动画时间
    landDuration: number = 0;

    fsm: FSM;

    is_hurting: boolean = false;

    private _baseScale: cc.Vec2 = cc.Vec2.ONE;

    private _dir: number = 1;
    public get dir(): number {
        return this._dir;
    }
    public set dir(value: number) {
        if (this._dir != value) {
            this._dir = value;
            this.displayNode.scaleX = value * Math.abs(this._baseScale.x);
            this.displayNode.scaleY = this._baseScale.y;
            this.onDirChanged.fire();
        }
    }

    private can_move: boolean = true;

    lastLandBody: FizzBody = null;

    is_movable: boolean = true;
    onJump: Signal = new Signal();
    onAnimation: Signal = new Signal();
    onDirChanged: Signal = new Signal();

    //可几连跳 how many times can player jump in the air
    jumpMax: number = 2;
    //当前第几跳 // current jump count in the air 
    private _jumpCount: number = 0;
    public get jumpCount(): number {
        return this._jumpCount;
    }
    public set jumpCount(value: number) {
        this._jumpCount = value;
    }


    onLoad() {
        this.body = this.getComponent(FizzBody);
        this.fsm = this.addComponent(FSM)
        this.fsm.init(this);
        this.fsm.addStates(PlayerState);
        this.fsm.enterState(PlayerState.Land);
        // this.fsm._log = true;
        this.displayNode = this.displayNode || this.node;

    }
    start() {
        // this.animation = Player.instance.getAnimComp();
        this._baseScale = cc.v2(this.displayNode.scaleX, this.displayNode.scaleY);
        if (this.animation)
            this.animation.on("finished", this.onAnimationFinish, this);
    }

    setAnim(anim: cc.Animation) {
        this.animation = anim;
    }

    is(state) {
        return this.fsm.isInState(state);
    }

    setMovable(b) {
        this.is_movable = b;
    }

    //??????? 


    move(velxmult) {
        if (this.can_move && this.is_movable) {
            if (!this.is_on_ice) {
                // this.body.x += 2 * dir;
                this.body.xv += this.speed * velxmult;
                this.body.xv = cc.misc.clampf(this.body.xv, -this.maxSpeed, this.maxSpeed);
            } else {
                //???????ice ?????????,????????????????
                if (this.is_on_normal) {
                    this.body.xv += this.speed * velxmult;
                    this.body.xv = cc.misc.clampf(this.body.xv, -this.maxSpeed, this.maxSpeed);
                } else {
                    this.body.xv += this.speed * 0.2 * velxmult;
                    this.body.xv = cc.misc.clampf(this.body.xv, -this.maxSpeedOnIce, this.maxSpeedOnIce);
                }
            }
            this.dir = Math.sign(velxmult)
        }
    }

    play_anim(name) {
        this.animation && this.animation.play(name)
        this.onAnimation.fire(name);
    }

    onAnimationFinish() {
        let state = this.animation.getAnimationState("player_throw")
        if (state) {
            if (this.is(PlayerState.Jump)) {
                this.play_anim("player_jump")
            } else if (this.is(PlayerState.Fall)) {
                this.play_anim("player_fall")
            } else {
                this.checkStandState();
            }
        }
        if (this.is(PlayerState.Dead)) {
            this.play_anim("player_dead")
        }
    }


    checkStandState() {
        if (this.is(PlayerState.Dead)) {
            this.animation && this.animation.play("player_dead")
        } else if (this.is_hurting && this.animation.getAnimationState("player_hurt").isPlaying) {

        } else {
            if (Math.abs(this.body.xv) < 2) {
                this.play_anim("player_idle")
                return PlayerState.Idle;
            } else {
                this.play_anim("player_walk")
                return PlayerState.Run;
            }
        }
    }

    //------------------------------------------------------------------------------//
    enter_LandState() {
        this.lastLandBody = this.body.intersections[0]
        this.play_anim("player_land")
        this.jumpCount = 0;
    }

    update_LandState() {
        if (this.fsm.timeElapsed > this.landDuration) {
            let state = this.checkStandState();
            if (state) {
                this.fsm.changeState(state)
            }
        }
    }

    enter_IdleState() {

    }
    exit_IdleState() { }
    update_IdleState() {
        if (this.is_hurting && this.animation && this.animation.getAnimationState("player_hurt").isPlaying == true)
            return;
        if (Math.abs(this.body.xv) > 2) {
            this.play_anim("player_walk")
            this.fsm.changeState(PlayerState.Run)
        } else {
            if (this.body.yv < 0) {
                this.fsm.changeState(PlayerState.Fall)
            }
            if (this.animation) {
                let state = this.animation.getAnimationState("player_walk")
                if (state.isPlaying) {
                    this.play_anim("player_idle")
                }
            }
        }
    }

    enter_RunState() {
    }
    exit_RunState() { }
    update_RunState() {
        if (Math.abs(this.body.xv) < 2) {
            this.play_anim("player_idle")
            this.fsm.changeState(PlayerState.Idle)
        }
        else if (this.body.yv < 0) {
            this.fsm.changeState(PlayerState.Fall)
        }
    }

    enter_JumpState() {
        this.lastLandBody = this.body.intersections[0]
        if (this.is_hurting)
            return;

    }
    exit_JumpState() {

    }

    update_JumpState() {
        if (this.body.yv <= 0) {
            this.fsm.changeState(PlayerState.Fall)
        }
    }


    enter_FallState() {
        if (this.is_hurting)
            return;
        this.play_anim("player_fall")
    }
    exit_FallState() {

    }

    update_FallState() {
        if (this.body.isStanding) {
            this.fsm.changeState(PlayerState.Land);
        }
    }

    enter_DeadState(state) {
        this.animation.stop();
        this.animation.play("player_dead")
        this.is_movable = false;
    }
    exit_DeadState(state) {

    }
    update_DeadState(state, dt: number) { }


    //------------------------------------------------------------------------------//

    dead() {
        this.fsm.changeState(PlayerState.Dead);
    }

    attack() {
        this.play_anim("player_attack")
    }


    jump() {
        if (!this.can_move || !this.is_movable) return;
        this.onJump.fire();
        if (this.jumpCount >= this.jumpMax) {
            return;
        }
        if (this.is(PlayerState.Land) || this.is(PlayerState.Dead)) {
            return;
        }
        this.body.yv = this.jumpInstantForce;
        this.jumpCount++;
        this.play_anim("player_jump")
        // this.holdJumpTime = 0
        this.fsm.changeState(PlayerState.Jump)

    }

    holdJump(dt?) {
        // if (this.holdJumpTime > 1.8333) {
        //     return;
        // }
        if (!this.can_move || !this.is_movable) return;
        if (this.fsm.isInState(PlayerState.Jump)) {
            // if (this.fsm.timeElapsed > 0.05) {
            this.body.yv += this.jumpHoldForce;
            // this.holdJumpTime += dt;
            // }
        }
    }

    get is_on_normal() {
        for (let k in this.body.intersections) {
            let v = this.body.intersections[k]
            if (v.friction > 0.5 && !v.isTrigger) {
                return true;
            }
        }
        return false;
        // let land = this.body.intersections.find(v => v.friction > 0.5)
        // if (land) return true;
        // return false;
    }

    get is_on_ice() {
        for (let k in this.body.intersections) {
            let v = this.body.intersections[k]
            if (v.friction <= 0.5 && !v.isTrigger) {
                return true;
            }
        }
        // let land = this.body.intersections.find(v => v.friction <= 0.5)
        // if (land) {
        //     return true;
        // }
        if (this.lastLandBody && this.lastLandBody.friction <= 0.5) {
            return true;
        }
        return false;
    }

    disableMoveForSec(dur) {
        this.can_move = false;
        this.scheduleOnce(this.releaseMove, dur);
    }

    releaseMove() {
        this.can_move = true;
        this.checkStandState();
    }

    hurt(nx) {
        if (this.is_hurting != false) {
            return false;
        }
        this.body.xv = 100 * nx;
        this.body.yv = 300;
        this.play_anim("player_hurt")
        this.is_hurting = true;
        this.node.runAction(cc.blink(1, 12));
        this.scheduleOnce(this.hurtEnd, 1);
        this.disableMoveForSec(0.3);
        return true;
    }

    hurtEnd() {
        this.is_hurting = false;
        this.node.opacity = 255;
        this.checkStandState();
    }

}