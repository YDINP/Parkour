import MoveEngine from "../movement/MoveEngine";
import ShootManager from "./ShootManager";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(MoveEngine)
export default class STargetPlayer extends cc.Component {

    @property
    alwaysPointTarget: boolean = false;

    @property
    rotationOffset: number = 0;

    moveEntity: MoveEngine;

    @property
    duration: number = 4;

    lastVel: cc.Vec2 = cc.Vec2.ZERO;

    target: cc.Node;

    start() {

    }

    onLoad() {
        this.moveEntity = this.getComponent(MoveEngine);
    }
    onEnable() {
        this.lastVel = cc.Vec2.ZERO;
        this.moveEntity.target = this.target;
        this.scheduleOnce(this.disableTarget, this.duration);
    }
    onDisable() {
        this.unschedule(this.disableTarget);
    }

    disableTarget() {
        this.moveEntity.target = null;
        let rot = cc.misc.degreesToRadians(this.rotationOffset - this.node.angle)
        this.lastVel = cc.v2(Math.cos(rot), Math.sin(rot));
        // this.node.angle = this.angleOffset +  this.moveEntity.velocity.signAngle(cc.Vec2.RIGHT) * cc.macro.DEG;
    }

    update() {
        let toTarget = this.target.position.sub(this.node.position);
        // if(toTarget.magSqr() < 200 * 200)
        // {
        //     this.moveEntity.target = this.target;
        // }
        if (this.moveEntity.target == null) {
            this.moveEntity.applyForce(this.lastVel)
            return;
        }
        if (this.alwaysPointTarget) {
            this.node.angle = this.rotationOffset + toTarget.signAngle(cc.Vec2.RIGHT) * cc.macro.DEG;
        }
    }



    // update (dt) {}
}
