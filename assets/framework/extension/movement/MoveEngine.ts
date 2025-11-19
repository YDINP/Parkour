import MoveBase from "./SMoveBase";

const { ccclass, property, menu } = cc._decorator;

export enum Behavior {
    Simple, // just move with velocity
    FixedPosition, // move to target once 
    Seek,   //seek to target
    Arrive,//arrive to target
    Wander, // wander 
    Bezeir, //move with bezier path :Todo
    Path,//move with custom path; :Todo:
}

enum ActivateType {
    Load,
    FirstShow,
    Delay
}
const WANDER_CIRCLE_DIST = 0;
const WANDER_CIRCLE_RADIUS = 1;
const WANDER_ANGLE_CHANGE = 1;
@ccclass
@menu('mimgame/movement/MoveEngine')
export default class MoveEngine extends MoveBase {

    static Behavior: typeof Behavior = Behavior;

    @property({ type: cc.Enum(Behavior) })
    moveType: Behavior = Behavior.Simple;

    @property
    maxSpeed: number = 15;
    @property
    forceWeight: number = 0.1;

    acc: cc.Vec2 = cc.Vec2.ZERO
    gravity: cc.Vec2 = new cc.Vec2(0, 0);
    //---------------------------------------path relative-------------------------------------
    @property({ type: [cc.Vec2], visible: function () { return this.moveType == Behavior.Path } })
    path: cc.Vec2[] = []
    _runningPath: cc.Vec2[] = [];
    @property({ visible: function () { return this.moveType == Behavior.Path } })
    pathRadius: number = 10;
    @property({ visible: function () { return this.moveType == Behavior.Path } })
    isPathLoop: boolean = true;
    // @property
    // resetPathWhenFinish = false;
    _currentPathIndex: number = 0;
    //------------------------------------------------------------------------------

    wanderAngle: number = 0;


    onLoad() {
    }

    start() {
        if (this.rotateByVelocity) {
            this.node.angle = -(this.angleOffset + this.velocity.signAngle(cc.Vec2.RIGHT) * cc.macro.DEG);
        }
        this.setPath(this.path, this.isPathLoop, true);
    }

    setPath(path: cc.Vec2[], isLoop: boolean = false, isRelativePath: boolean = true) {
        this.isPathLoop = isLoop;
        this._runningPath.splice(0, this._runningPath.length);
        for (var i = 0; i < path.length; i++) {
            let pos = path[i].clone();
            if (isRelativePath) {
                pos.addSelf(this.node.position)
            }
            this._runningPath.push(pos);
        }
        if (this.isPathLoop) {
            if (this._runningPath.length > 0) {
                let pathWayPoint = this._runningPath[0]
                this._runningPath.push(pathWayPoint);
            }
        }
        this._currentPathIndex = 0;
    }

    resetPath() {
        this.setPath(this.path, this.isPathLoop, true);
    }

    reset() {
        this.target = null;
        this.velocity = cc.Vec2.ZERO;
        this.resetPath();
    }

    // onBeforeUpdate(callback, target, duration = -1) {
    //     this.addCommand(callback, target, duration)
    // }

    changeBeheavior(behavior: Behavior, target: cc.Node = null) {
        this.moveType = behavior;
        if (target)
            this.target = target;
    }


    applyForce(v2Orx: cc.Vec2 | number, y?: number) {
        let x = v2Orx;
        if (v2Orx instanceof cc.Vec2) {
            x = v2Orx.x;
            y = v2Orx.y;
        }
        //@ts-ignore
        this.acc.x += x;
        this.acc.y += y;
    }


    getNormalPoint(point, a, b): cc.Vec2 {
        let ab = b.sub(a);
        let ap = point.sub(a);
        // ab.normalizeSelf()
        // let ap_ab = ab.mul(ap.dot(ab))
        let ap_ab = ap.project(ab)
        return a.add(ap_ab);
    }


    static ReachPathEndThreshold = 400; //20 x 20
    static PathPredictLength = 25;


    drawPath(context) {
        // context.clear();
        context.moveTo(this._runningPath[0].x, this._runningPath[0].y);
        for (var i = 0; i < this._runningPath.length - 1; i++) {
            let a = this._runningPath[i];
            let b = this._runningPath[i + 1]
            context.lineTo(b.x, b.y);
        }
        // Game.instance.graphics.ellipse(target.x,target.y ,4,4)
        context.stroke();
    }

    followPath(path: cc.Vec2[], pathRadius: number) {
        if (this._currentPathIndex == path.length - 1) {
            // let distsq = this.node.position.sub(this._runningPath[this._currentPathIndex]).magSqr();
            // if(distsq < MoveEntity.ReachPathEndThreshold)
            // {
            // console.log("resetpath wehne finei");
            // if (this.resetPathWhenFinish)
            // {
            //     this.resetPath();
            // }
            // }
            return cc.Vec2.ZERO;
        }
        // this.drawPath(Game.instance.graphics);
        let predict = this.velocity.clone();
        predict.normalizeSelf();
        predict.mulSelf(MoveEngine.PathPredictLength);
        predict.addSelf(this.node.position);//predictLocation
        let target: cc.Vec2;
        // for (var i = 0 ;i < 2; i++)
        // {
        let a = path[this._currentPathIndex];
        let b = path[this._currentPathIndex + 1]

        let normalpoint = this.getNormalPoint(predict, a, b);
        let distsq = normalpoint.sub(b).magSqr();
        if (distsq < MoveEngine.ReachPathEndThreshold) {
            this._currentPathIndex += 1;
            if (this.isPathLoop && this._currentPathIndex >= path.length - 1) {
                this._currentPathIndex = 0;
            }
        }
        target = (normalpoint).addSelf(b.sub(a).normalizeSelf().mulSelf(MoveEngine.PathPredictLength + 10))

        if (distsq > pathRadius * pathRadius) {
            return this.seek(target);
        }
        return cc.Vec2.ZERO;
    }

    _tmp_vec2: cc.Vec2 = cc.v2()

    seek(position): cc.Vec2 {
        let v = this._tmp_vec2;
        // cc.Vec2.set(v, position.x, position.y)
        v.x = position.x;
        v.y = position.y;
        v.subSelf(this.node.position);
        v.normalizeSelf();
        v.mulSelf(this.maxSpeed);
        v.subSelf(this.velocity);
        // this.limitVec2(v,this.maxSpeed);
        return v;
    }

    arrive(position): cc.Vec2 {
        let v = position.clone();
        v.subSelf(this.node.position);
        let d = v.mag();
        v.normalizeSelf();
        if (d < 100) {
            let m = this.map(d, 0, 100, 0, this.maxSpeed);
            v.mulSelf(m);
        } else {
            v.mulSelf(this.maxSpeed);
        }
        v.subSelf(this.velocity);
        //limit maxforce 
        return v;
    }

    wander() {
        let center = this.node.position;
        let size = this.node.parent.getContentSize();
        if (center.x < -size.width / 2 || center.y < -size.height / 2 || center.x > size.width / 2 || center.y > size.height / 2) {
            return this.seek(cc.v2(0, 0));
        }
        let circleCenter: cc.Vec2 = this.velocity.clone();
        circleCenter.normalize();
        circleCenter.mulSelf(WANDER_CIRCLE_DIST)
        let displacement: cc.Vec2 = cc.v2(-1, 0);
        displacement.mulSelf(WANDER_CIRCLE_RADIUS);
        displacement.rotateSelf(this.wanderAngle);
        this.wanderAngle += gUtil.randomFloat(-WANDER_ANGLE_CHANGE, WANDER_ANGLE_CHANGE)
        return circleCenter.add(displacement);
    }

    private _applyForces() {
        let f = cc.Vec2.ZERO
        let pos = this.tarPos;
        //@ts-ignore
        if (this.target && this.target.activeInHierarchy) {
            //@ts-ignore
            pos = this.target.position
        }
        if (this.moveType == Behavior.Seek) {
            f.addSelf(this.seek(pos))
        } else if (this.moveType == Behavior.Arrive) {
            f.addSelf(this.arrive(pos));
        }
        if (this.moveType == Behavior.Path && this._runningPath.length > 0) {
            f.addSelf(this.followPath(this._runningPath, this.pathRadius));
        } else if (this.moveType == Behavior.Wander) {
            f.addSelf(this.wander());
        }
        this.applyForce(this.gravity.x, this.gravity.y);
        this.applyForce(f.x, f.y);
    }

    private limitVec2(vec: cc.Vec2, max) {
        let vec_length_sq = vec.magSqr();
        if (vec_length_sq > max * max) {
            vec.mulSelf(max / Math.sqrt(vec_length_sq)); //normal and mult
        }
        return vec_length_sq;
    }

    private map(val, s1, s2, e1, e2) {
        let newVal = (e2 - e1) * val / (s2 - s1) + e1;
        return Math.max(e1, Math.min(newVal, e2));
    }

    _step(dt?) {

        this._applyForces();
        let v = this.acc.mul(this.forceWeight)
        this.velocity.addSelf(v)
        this.limitVec2(this.velocity, this.maxSpeed);
        // let speed = this.velocity.mag();
        // this.velocity.normalizeSelf();
        // this.velocity.mulSelf(Math.min(this.maxSpeed,speed));
        // this.velocity.mulSelf(0.98);

        this.node.setPosition(this.node.position.add(this.velocity));
        this.acc.set(cc.Vec2.ZERO);
        if (this.rotateByVelocity) {
            if (this.moveType != Behavior.Simple)
                this.node.angle = -(this.angleOffset + this.velocity.signAngle(cc.Vec2.RIGHT) * cc.macro.DEG);
        }
    }


}
