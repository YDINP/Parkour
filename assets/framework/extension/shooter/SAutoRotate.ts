import GameEntity from "./SGameEntity";
import ccUtil from "../../utils/ccUtil";

const { ccclass, property, menu } = cc._decorator;

enum State {
    Idle,
    Rotate,
}


@ccclass
@menu("mimgame/shooter/AutoRotate")
export default class SAutoRotate extends cc.Component {

    // seekPlayer:boolean = true;
    // seekNearest:boolean = true;

    @property(GameEntity)
    target: GameEntity = null;

    // rotateRange:number = 10;

    @property
    maxTurnRate: number = 0.02; //  360 s  

    static inaccuracyScalar = 3;

    // private targetAngle: number = 0;

    heading: cc.Vec2 = cc.v2(1, 0);

    isRotating: boolean = false;

    /**可以旋转到后背 */
    canRotateBack: boolean = false;


    onLoad() {
        if (this.node.scaleX < 0) {
            this.heading = cc.v2(-1, 0);
        }
    }

    isBackRotate(toTarget: cc.Vec2) {
        if (!this.canRotateBack) {
            if (this.node.scaleX < 0) {
                if (toTarget.x > 0) {
                    return true;
                }
            } else {
                if (toTarget.x < 0) {
                    return true;
                }
            }
        }
        return false;
    }

    rotate() {
        if (!cc.isValid(this.target)) {
            this.rotateToVec()
            return 0
        }
        if (this.target) {
            if (this.target.isDead()) {
                this.rotateToVec()
                return 0;
            }
        }
        let box = ccUtil.getWorldBoundingBox(this.node);
        let targetpos = ccUtil.getWorldPosition(this.target.node);
        let toTarget = targetpos.sub(box.center);
        if (this.isBackRotate(toTarget)) {
            this.rotateToVec()
            return;
        }
        toTarget.normalizeSelf();
        return this.rotateToVec(toTarget);
    }

    signVec2(v1, v2) {
        if (v1.y * v2.x > v1.x * v2.y) {
            return -1
        }
        else {
            return 1;
        }
    }

    rotateToVec(toTarget: cc.Vec2 = null) {
        if (toTarget == null) {
            if (this.node.scaleX < 0) {
                toTarget = cc.v2(-1, 0)
            } else {
                toTarget = cc.Vec2.RIGHT;
            }
        }
        // let toTarget = cc.v2(1,0);
        let sign = this.signVec2(this.heading, toTarget);
        let angle = Math.acos(this.heading.dot(toTarget))
        if (angle < 0.0001) {
            return 0
        };
        if (isNaN(angle)) {
            angle = 0;
        }
        if (angle > this.maxTurnRate) {
            angle = this.maxTurnRate;
        }
        this.heading.rotateSelf(sign * angle);
        let a = this.heading.signAngle(cc.Vec2.RIGHT)
        this.node.angle = cc.macro.DEG * a;
        if (this.node.scaleX < 0) {
            this.node.angle += 180;
        }
        return 1;
    }


    update(dt) {
        this.isRotating = !!this.rotate()
    }


}