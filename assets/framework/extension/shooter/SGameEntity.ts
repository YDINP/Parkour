import ShootManager from "./ShootManager";
import MoveEngine from "../movement/MoveEngine";

import FSM, { State } from "../../core/FSM";
import Signal from "../../core/Signal";

const { ccclass, property, requireComponent, menu } = cc._decorator;


export enum EntityState {
    Default,
    Run,
    Dead,
    Disapear,
    Remove,
}

enum VisibleState {
    Invalid,
    Check,
    Visible,
    Invisible
}

enum EntityEvent {
    Dead,  // Entity died
    Remove,// Auto remove
    Appear, // First appeared on screen
    Active, // Activated
    Disapear, // Disappeared from screen
    Hurt, //
    HpChanged,
}


// enum ActiveEvent {
//     None,
//     PlayerDistance,
//     Visible,
//     CameraDistance,// invalid 
//     Start,
// }

enum DeletePolicy {
    RemoveNode,
    Destroy,
}

enum DeadDeletePolicy {
    DontDelete,
    Delete,
    DelayDelete,
}

enum RotationDirection {
    Clockwise = -1,
    CounterClockwise = 1,
}

@ccclass
@menu("mimgame/shooter/GameEntity")
export default class GameEntity extends cc.Component {

    public uid: number = 0;

    /** Max HP value  */
    @property({ displayName: "Max HP" })
    private mHp: number = 10;

    @property({ displayName: "Damage" })
    damage: number = 10;

    @property({ displayName: "Delete When Invisible" })
    invisibleDelete: boolean = false;

    @property({ displayName: "delay", tooltip: "Delay before deleting when invisible", visible() { return this.invisibleDelete } })
    invisibleDeleteDelay: number = 0;

    @property({ type: cc.Enum(DeletePolicy), displayName: "Delete Policy" })
    deletePolicy: DeletePolicy = DeletePolicy.RemoveNode;


    @property({ displayName: "Death Delete Policy", type: cc.Enum(DeadDeletePolicy) })
    deadDeletePolicy: DeadDeletePolicy = DeadDeletePolicy.Delete;

    @property({ displayName: "delay", visible() { return this.deadDeletePolicy == DeadDeletePolicy.DelayDelete } })
    deadDeleteDelay: number = 0;

    @property({ displayName: "Visibility Check Interval" })
    checkOOSInterval: number = 0.1;

    @property({ displayName: "Enable Rotation" })
    enableRotation: boolean = false;

    @property({ displayName: "Rotation Speed (deg/s)", visible() { return this.enableRotation } })
    rotationSpeed: number = 180;

    @property({ type: cc.Enum(RotationDirection), displayName: "Rotation Direction", visible() { return this.enableRotation } })
    rotationDirection: RotationDirection = RotationDirection.Clockwise;

    /** Move engine */
    moveEngine: MoveEngine
    __fsm: FSM


    // sprit: cc.Sprite;
    fsm_visible: FSM
    has_shown: boolean = false;
    ps: cc.ParticleSystem[] = []
    static Event: typeof EntityEvent = EntityEvent
    static States: typeof EntityState = EntityState

    /** Current value  */
    private _hp: number = 0;

    signals: Signal[] = []

    sm: ShootManager = null;


    onLoad() {
        this.moveEngine = this.getComponent(MoveEngine)
        this.ps = this.getComponentsInChildren(cc.ParticleSystem)

        this.onInitFSM();

        this.fsm_visible = this.addComponent(FSM);
        this.fsm_visible.init(this);
        this.fsm_visible.addStates(VisibleState);
        this.fsm_visible.enterState(VisibleState.Check);
    }

    start() {
        this.sm = ShootManager.instance

    }

    onInitFSM() {
        let fsm = this.addComponent(FSM)
        fsm.init(this);
        fsm.addStates(EntityState);
        fsm.enterState(EntityState.Default);
        this.__fsm = fsm;
    }




    get isActive() {
        if (this.__fsm == null) {
            return console.warn("Have you foggot to call super.start or super.onLoad in inherit class which derived from GameEntity!")
        }
        return this.__fsm.isInState(EntityState.Run);
    }

    set isActive(v) {
        if (v) {
            this.run()
        } else {
            this.stopRun();
        }

    }

    onEnable() {
        this._hp = this.mHp;
        this.suicide = false;
        this.node.angle = 0;
        // 풀에서 재사용 시 FSM 상태를 강제로 Default로 리셋한 후 Run으로 전환
        if (this.__fsm && this.__fsm.isInState(EntityState.Run)) {
            this.__fsm.changeState(EntityState.Default);
        }
        this.run();
    }

    onDisable() {
        this.clear();
    }


    set hp(hp: number) {
        let old = this._hp;
        if (hp > this.maxHp) return;
        if (old != hp) {
            this._hp = hp;
            this.emitEvents(EntityEvent.HpChanged, hp, old);
            this.onHpChanged(this._hp, old)
        }
    }

    set maxHp(hp) {
        this.mHp = hp
    }

    get maxHp() {
        return this.mHp
    }

    get hp() {
        return this._hp;
    }

    respawn(bupdate?) {
        if (bupdate) {
            this.hp = this.maxHp
        } else {
            this._hp = this.maxHp;
        }
        // Reactivate
        this.isActive = true;
    }

    isDead() {
        return this._hp <= 0;
    }

    //--------------------------------------interface----------------------------------------//
    onHpChanged(hp, prev) { }
    onDead() { }
    onDelete() { }
    onActive(state) { }
    canHurt(reason) { return true; }
    //------------------------------------------------------------------------------//

    decreaseHp(hp, reason?) {
        if (this.hp == 0) return;
        if (!this.canHurt(reason)) return;
        this.hp -= hp;
        this.emitEvents(EntityEvent.Hurt, this.hp, hp);
        if (this.hp <= 0) {
            this.hp = 0;
            if (this.__fsm.isInState(EntityState.Dead)) {
                return
            }
            this.__fsm.changeState(EntityState.Dead);
        }
    }


    run() {

        this.__fsm.changeState(EntityState.Run);
    }

    stopRun() {
        this.__fsm.changeState(EntityState.Default);
    }
    //------------------------------------------------------------------------------//

    check_update() {
        if (this.sm.canSee(this.node)) {
            this.fsm_visible.changeState(VisibleState.Visible)
        } else {
            this.fsm_visible.changeState(VisibleState.Invisible)
        }
    }

    enter_CheckState(state: State) { state.setInterval(this.checkOOSInterval, this.check_update, this) }


    enter_VisibleState(state) {
        if (this.has_shown == false) {
            this.emitEvents(EntityEvent.Appear, this);
        }
        this.has_shown = true;
        state.setInterval(this.checkOOSInterval, this.visible_update, this)
    }

    visible_update() {
        if (!this.sm.canSee(this.node)) {
            this.fsm_visible.changeState(VisibleState.Invisible)
        }
    }

    invisible_update() {
        if (this.sm.canSee(this.node)) {
            this.fsm_visible.changeState(VisibleState.Visible)
        }
    }

    enter_InvisibleState(state, dt: number) {
        state.setInterval(this.checkOOSInterval, this.invisible_update, this)
    }

    update_InvisibleState(state, dt: number) {
        if (this.has_shown) {
            if (this.invisibleDelete) {
                if (this.fsm_visible.timeElapsed > this.invisibleDeleteDelay) {
                    this.__fsm.changeState(EntityState.Disapear);
                    return;
                }
            }
        }

    }

    //------------------------------------------------------------------------------//

    enter_RunState(state) {
        this.onActive(state);
        this.emitEvents(EntityEvent.Active, this);
        this.ps.forEach(p => p.resetSystem())
    }

    update_RunState(state, dt) {
        if (this.moveEngine) {
            this.moveEngine.step(dt);
        }

        if (this.enableRotation) {
            this.node.angle += this.rotationSpeed * this.rotationDirection * dt;
        }
    }

    enter_DeadState(state) {
        // if (this.sprit)
        //     this.sprit.enabled = false;
        this.ps.forEach(p => p.stopSystem())
        this.clear();
        this.emitDeadEvents();
        if (this.deadDeletePolicy != DeadDeletePolicy.DontDelete) {
            this.__fsm.changeState(EntityState.Default);
        }
    }

    update_DeadState() {
        if (this.deadDeletePolicy == DeadDeletePolicy.DelayDelete) {
            if (this.__fsm.timeElapsed > this.deadDeleteDelay) {
                this.__fsm.changeState(EntityState.Default)
            }
        } else if (this.deadDeletePolicy == DeadDeletePolicy.Delete) {
            this.__fsm.changeState(EntityState.Default)
        }
    }

    exit_DeadState(state) {
        // Delete
        this.doDelete()
    }

    clear() {
        this.has_shown = false;
        if (this.fsm_visible)
            this.fsm_visible.changeState(VisibleState.Check)
        if (this.moveEngine)
            this.moveEngine.reset();
    }

    doDelete() {
        if (this.deadDeletePolicy == DeadDeletePolicy.DontDelete) {
            this.onDelete();
        } else {
            if (this.deletePolicy == DeletePolicy.RemoveNode) {
                this.node.removeFromParent();
            } else {
                this.node.destroy();
            }
            this.onDelete();
        }

    }


    onDestroy() {
        this.signals.forEach(v => v.clear());
    }


    enter_DisapearState(state) {
        // console.log("remove  "+this.name)
        this.clear();
        this.doDelete()
    }


    emitDeadEvents() {
        this.onDead();
        this.emitEvents(EntityEvent.Dead, this)
    }

    on(evt: EntityEvent | string, callback: Function, target: any) {
        let signal = this.getEventSignal(evt)
        signal.add(callback, target);
    }

    off(evt: EntityEvent | string, c: Function, t: any) {
        let signal = this.getEventSignal(evt)
        signal.remove(c, t);
    }

    getEventSignal(evt) {
        let signal = this.signals[evt]
        if (signal == null) {
            signal = new Signal();
            this.signals[evt] = signal;
        }
        return signal;
    }

    emitEvents(evt: EntityEvent | string, ...ps) {
        let signal = this.getEventSignal(evt)
        signal.fire(...ps);
    }

    suicide: boolean = false;

    kill() {
        this._hp = 0;
        this.suicide = true;
        this.__fsm.changeState(EntityState.Dead)
    }


    /** Default collision handler */
    onCollisionEnter(other: cc.Collider, self) {
        if (!this.isActive) return;
        let entity = other.getComponent(GameEntity)
        if (entity == null) {
            entity = other.getComponentInParent(GameEntity);
        }
        if (entity) {
            if (entity.isActive) {
                entity.decreaseHp(this.damage, this)
                this.decreaseHp(entity.damage, entity)
                // this.onHitEntity(entity, other)
            }
        }
    }

}
