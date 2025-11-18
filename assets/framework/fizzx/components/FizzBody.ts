import Fizz from "../fizz";
import FizzManager from "./FizzManager";
import Shapes, { ShapeType } from "../shapes";
import Signal from "../../core/Signal";

const { ccclass, property, menu } = cc._decorator;

export enum FizzBodyType {
    Static,
    Dynamic,
    Kinematic,
}

let t_K = FizzBodyType.Kinematic;
let t_D = FizzBodyType.Dynamic;
let t_S = FizzBodyType.Static;

export interface FizzCollideInterface {
    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number);
    onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number);
    onFizzCollideStay?(b: FizzBody, nx: number, ny: number, pen: number);
}


@ccclass
@menu("fizzx/FizzBody")
export default class FizzBody extends cc.Component {

    @property({ type: cc.Enum(FizzBodyType) })
    private _bt: FizzBodyType = FizzBodyType.Static;

    @property({ type: cc.Enum(FizzBodyType) })
    public get bodyType(): FizzBodyType {
        return this._bt;
    }


    @property({ type: cc.Enum(ShapeType) })
    shapeType: ShapeType = ShapeType.rect;

    // @property({visible(){return this.bodyType==FizzBodyType.Static},slide:true,range:[0,10],step:1})
    // isTrigger:boolean = false;



    @property({ slide: true, range: [0, 1], step: 0.1 })
    friction: number = 1;

    @property({ slide: true, range: [0, 10], step: 0.1 })
    bounce: number = 0

    @property({ slide: true, range: [0, 50], step: 0.1 })
    damping: number = 0

    @property({ visible() { return this.bodyType == FizzBodyType.Dynamic }, slide: true, range: [0, 10], step: 1 })
    gravity: number = 1

    @property()
    isTrigger: boolean = false;

    @property({ visible() { return !this.isTrigger && this.shapeType == ShapeType.rect } })
    left: boolean = false;
    @property({ visible() { return !this.isTrigger && this.shapeType == ShapeType.rect } })
    right: boolean = false;
    @property({ visible() { return !this.isTrigger && this.shapeType == ShapeType.rect } })
    top: boolean = false;
    @property({ visible() { return !this.isTrigger && this.shapeType == ShapeType.rect } })
    bottom: boolean = false;

    @property({ type: cc.Component.EventHandler, visible() { return this.isTrigger } })
    triggerCallback: cc.Component.EventHandler = new cc.Component.EventHandler();

    @property({ visible() { return this.isTrigger } })
    destroyAfterTrigger: boolean = false;

    /**
     * x 方向的速度
     */
    xv = 0;
    /**
     * 方向的速度 
     */
    yv = 0;
    sx = 0;
    sy = 0;

    x = 0;
    y = 0;
    hw = 0;
    hh = 0;
    _sid_: number = 0;

    get sid() {
        return this._sid_;
    }
    /** 碰撞反应：仅碰撞回调 */
    @property({ tooltip: "是否需要计算碰撞反应" })
    response: boolean = true;

    /**碰撞反应：true 时计算碰撞物体的位置 ，但不计算碰撞后变化的速度,false时全部计算   */
    block: boolean = false;

    private _shape = null;
    public get shape() {
        return this._shape;
    }
    public set shape(value) {
        this._shape = value;
    }


    _t: any;

    //潜在的 附近的body
    partionBodies: any = []

    intersections: { [index: string]: FizzBody } = {}

    mass: number = 1;

    isFalling: boolean = false;
    isLand: boolean = false;

    _bodyAttached = false;

    //扩展 force 
    force: cc.Vec2 = cc.Vec2.ZERO;

    // group 扩展参数
    group: string = "";

    deacc: number = 1;

    /** currently only support static shapes */
    @property
    isUpdateChild: boolean = false;

    rect: any[];

    onLoad() {


    }

    reset() {
        this.remove();
        this.respawn();
    }


    public set bodyType(bodyType: FizzBodyType) {
        if (this.bodyType == bodyType) {
            return;
        }
        // this.remove();
        Fizz.changeBodyType(this, bodyType);
        this._bt = bodyType;
        // this.respawn();
    }

    setShape(w, h, ax = 0.5, ay = 0.5) {
        let oh = this.hh
        let ow = this.hw;
        this.hh = h * 0.5;
        this.hw = w * 0.5
        if (ax == 0.5 && ay == 0.5) {
            Fizz.repartion(this);
        } else {
            this.translate((w - ow * 2) * (0.5 - ax), (h - oh * 2) * (0.5 - ay));
        }
    }

    translate(x, y) {
        Fizz.move(this, x, y);
    }

    onDisable() {
        this.remove();
        this.unschedule(this.onUpdate);
    }

    onEnable() {
        this.respawn()
        this.unschedule(this.onUpdate);
        this.schedule(this.onUpdate, 0.2)
    }
    start() {
        if (this._t == null) {
            let components = this.getComponents(cc.Component)
            this._t = components.find(v => v["onFizzCollideEnter"] != null && v != this);
        }
    }

    setTarget(t: FizzCollideInterface) {
        this._t = t;
    }

    get isStanding() {
        return this.isLand && !this.isFalling && this.yv < 1.0 && this.yv >= 0
    }

    onCollide(body: FizzBody, nx, ny, pen) {
        if (!this._bodyAttached) {
            return;
        }
        let r = true;
        if (body._sid_ != null) {
            if (this.intersections[body._sid_] == null) {
                this.intersections[body._sid_] = body;
                r = this.onFizzCollideEnter(body, nx, ny, pen);
            } else {
                r = this.onFizzCollideStay(body, nx, ny, pen);
            }
            r = r == null ? true : r;
        }
        return r;
    }

    syncRotation() {
        this.node.angle = Math.atan2(this.yv, this.xv) * cc.macro.DEG
    }

    setVelocity(x: number | cc.Vec2, y?: number) {
        if (x instanceof cc.Vec2) {
            y = x.y;
            x = x.x;
        }
        this.xv = x
        this.yv = y
    }


    applyForce(f: cc.Vec2) {
        this.force.addSelf(f);
    }

    applyImpulse(x, y) {
        this.xv += x
        this.yv += y
    }

    getDisplacement() {
        return cc.v2(this.sx || 0, this.sy || 0)
    }

    get velocity() {
        return cc.v2(this.xv || 0, this.yv || 0)
    }

    getVelocity() {
        return cc.v2(this.xv || 0, this.yv || 0)
    }

    getPosition() {
        return cc.v2(this.x, this.y)
    }

    // sets the position of a shape
    setPosition(x, y) {
        Fizz.move(this, x - this.x, y - this.y)
        this.node.x = x;
        this.node.y = y;
    }

    syncPosition() {
        let p = this.node.getPosition();
        Fizz.move(this, p.x - this.x, p.y - this.y)
    }


    respawn() {
        if (!this._bodyAttached && FizzManager.instance) {
            let center = FizzManager.instance.getCenter(this.node);
            let hw = this.node.width / 2 * this.node.scale;
            let hh = this.node.height / 2 * this.node.scale;
            if (this.shapeType == ShapeType.line) {
                Fizz.addShapeType(this, this.bodyType, this.shapeType, center.x - hw, center.y, center.x + hw, center.y)
            } else {
                Fizz.addShapeType(this, this.bodyType, this.shapeType, center.x, center.y, hw, hh)
            }
            if (this.bodyType == FizzBodyType.Dynamic)
                Fizz.setMass(this, 1)
            this._bodyAttached = true;
        }
    }

    /**
     * 临时删除，后面可以使用respawn 恢复
     */
    remove() {
        this.force = cc.Vec2.ZERO;
        this.isFalling = false;
        this.isLand = false;
        this.intersections = {}
        Fizz.removeShape(this);
        this._bodyAttached = false;
    }


    onDestroy() {
        Fizz.removeShape(this);
    }

    onFizzCollideEnter(b: FizzBody, nx, ny, pen) {
        if (this.isTrigger) {
            this.triggerCallback.emit([this.triggerCallback.customEventData])
        }
        if (this._t)
            return this._t.onFizzCollideEnter(b, nx, ny, pen);
        if (this.destroyAfterTrigger) {
            this.destroy();
        }
    }

    onFizzCollideStay(b: FizzBody, nx, ny, pen) {
        if (this._t && this._t.onFizzCollideStay)
            return this._t.onFizzCollideStay(b, nx, ny, pen);
    }

    onFizzCollideExit(b: FizzBody) {
        if (this._t && this._t.onFizzCollideExit)
            return this._t.onFizzCollideExit(b);
    }

    sync() {
        this.node.x = this.x;
        this.node.y = this.y;
    }

    get bounds() {
        return Shapes.bounds(this);
    }

    onUpdate() {
        for (let k in this.intersections) {
            let v = this.intersections[k]
            if (cc.isValid(v)) {
                let b = Shapes.fasttest(this, v)
                //todo：当 b==true && shape==line 时，使用精确的碰撞  （判断误差会比较大。）
                if (!b) {
                    this.onFizzCollideExit(v);
                    delete this.intersections[v._sid_]
                }
            } else {
                delete this.intersections[v._sid_]
            }
        }
    }

    lateUpdate(dt) {
        if (this._bt == t_S) {
            if (this.isUpdateChild) {
                let wp = FizzManager.instance.getCenter(this.node);
                //sync from real world poisition 
                Fizz.move(this, wp.x - this.x, wp.y - this.y)
            }
            return;
        }

        this.node.x = this.x;
        this.node.y = this.y;
        this.xv += this.force.x;
        this.yv += this.force.y;
        if (this._bt == t_K) {
            this.xv *= this.deacc;
            this.yv *= this.deacc;
        }
        this.force.set(cc.Vec2.ZERO);
    }

    stop(acc = 0) {
        this.deacc = cc.misc.clamp01(acc);
        this.force.set(cc.Vec2.ZERO);
    }

    lookAt(target: cc.Vec2, c = 0.1) {
        let angle = this.node.angle
        let toTarget = target.sub(this.node.getPosition());
        let targetAngle = Math.atan2(toTarget.y, toTarget.x) * cc.macro.DEG
        let toAngle = targetAngle - angle;
        this.node.angle += toAngle * c;
    }
    seek(target: cc.Vec2, maxSpeed = 100) {
        let toTarget = target.sub(this.node.getPosition());
        toTarget.normalizeSelf();
        toTarget.mulSelf(maxSpeed);
        toTarget.subSelf(this.velocity);
        return toTarget;
    }

    map(val, s1, s2, e1, e2) {
        let newVal = (e2 - e1) * val / (s2 - s1) + e1;
        return Math.max(e1, Math.min(newVal, e2));
    }

    arrive(target: cc.Vec2, maxSpeed = 100, deacc_dist = 50) {
        let toTarget = target.sub(this.node.getPosition());
        let d = toTarget.mag();
        toTarget.divSelf(d);
        // toTarget.normalizeSelf();
        //--------------------------------------快达到目标点时减速----------------------------------------//
        if (d < deacc_dist) {
            let m = this.map(d, 0, deacc_dist, 0, maxSpeed);
            toTarget.mulSelf(m);
        } else {
            toTarget.mulSelf(maxSpeed);
        }
        //--------------------------------------需要用的力 = 到目标点期待的速度 - 当前速度----------------------------------------//
        toTarget.subSelf(this.velocity);
        return toTarget;
    }


    //--------------------------------------follow path----------------------------------------//
    private getNormalPoint(point, a, b): cc.Vec2 {
        let ab = b.sub(a);
        let ap = point.subSelf(a);
        // ab.normalizeSelf()
        // let ap_ab = ab.mul(ap.dot(ab))
        let ap_ab = ap.project(ab)
        return a.add(ap_ab);
    }


    static ReachPathEndThreshold = 400; //20 x 20
    static PathPredictLength = 25;

    _runningPath: cc.Vec2[] = []
    isPathLoop: boolean = false;
    _currentPathIndex: number = 0;

    pathSigal: Signal = new Signal();


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


    isPathFinished() {
        return this._currentPathIndex != 0 && this._currentPathIndex == this._runningPath.length;
    }
    followPath(path: cc.Vec2[], stopAtEnd = false, maxSpeed = 100, pathRadius: number = 20, distDeacc: number = 100) {
        this._runningPath = path;
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
            if (stopAtEnd) {
                let f = this.arrive(path[this._currentPathIndex], maxSpeed, distDeacc);
                if (f.fuzzyEquals(cc.Vec2.ZERO, 1)) {
                    this._currentPathIndex = this._currentPathIndex + 1
                    this.pathSigal.fire(path, this._currentPathIndex)
                }
                return f;
            }
            return cc.Vec2.ZERO;
        } else if (this._currentPathIndex == path.length) {
            return this.arrive(path[path.length - 1], maxSpeed, distDeacc);
        }
        // this.drawPath(Game.instance.graphics);
        let predict = this.velocity.clone();
        predict.normalizeSelf();
        predict.mulSelf(FizzBody.PathPredictLength);
        predict.addSelf(this.node.getPosition());//predictLocation
        let target: cc.Vec2;
        // for (var i = 0 ;i < 2; i++)
        // {
        let a = path[this._currentPathIndex];
        let b = path[this._currentPathIndex + 1]

        let normalpoint = this.getNormalPoint(predict, a, b);
        let distsq = normalpoint.sub(b).magSqr();
        if (distsq < FizzBody.ReachPathEndThreshold) {
            this._currentPathIndex += 1;
            this.pathSigal.fire(path, this._currentPathIndex)
            if (this.isPathLoop && this._currentPathIndex >= path.length - 1) {
                this._currentPathIndex = 0;
            }
        }
        if (distsq > pathRadius * pathRadius) {
            target = (normalpoint).addSelf(b.sub(a).normalizeSelf().mulSelf(FizzBody.PathPredictLength + 10))
            return this.seek(target, maxSpeed);
        }
        return cc.Vec2.ZERO;
    }


    setPath(path: cc.Vec2[], isLoop: boolean = false, isRelativePath: boolean = true) {
        this.isPathLoop = isLoop;
        this._runningPath.splice(0);
        for (var i = 0; i < path.length; i++) {
            let pos = path[i].clone();
            if (isRelativePath) {
                pos.addSelf(this.node.getPosition())
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
        this._currentPathIndex = 0;
    }
    //------------------------------------------------------------------------------//


}