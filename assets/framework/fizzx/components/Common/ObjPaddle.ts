import FizzBody, { FizzCollideInterface } from "../../../../framework/fizzx/components/FizzBody";
import BodyBase from "./BodyBase";


const { ccclass, property, requireComponent, menu } = cc._decorator;

@ccclass
@requireComponent(FizzBody)
@menu("fizzx/ObjPaddle")
export default class ObjPaddle extends BodyBase {

    @property
    noTarget: boolean = false;

    @property(cc.Vec2)
    offset: cc.Vec2 = cc.v2(0, 50);

    @property
    maxSpeed: number = 100;

    @property
    pingPong: boolean = false;

    @property
    changeDirWhenCollide: boolean = false;

    @property({ visible() { return this.changeDirWhenCollide } })
    excludeGroups: string = "";

    p1: cc.Vec2;
    p2: cc.Vec2;

    onLoad() {
    }

    start() {
        //disable gravity 
        this.body.gravity = 0;

        this.p1 = this.node.getPosition();
        this.p2 = this.node.getPosition().add(this.offset);
        let v = this.offset.normalize();
        v.mulSelf(this.maxSpeed)
        this.body.setVelocity(v.x, v.y);
    }

    onFizzCollideEnter(b: FizzBody, nx, ny, pen) {
        if (this.changeDirWhenCollide) {
            if (b.node && this.excludeGroups.includes(b.node.group)) return;
            this.body.xv = nx
            this.body.yv = ny
        }
    }

    //抵达指定点的力计算
    arrive() {
        let toP2 = this.p2.sub(this.node.getPosition());
        if (!this.pingPong) {
            if (toP2.magSqr() < 1600 && this.body.getVelocity().magSqr() < 100) {
                this.body.setVelocity(0, 0);
                return cc.Vec2.ZERO
            }
        }
        let toP1 = this.p1.sub(this.node.getPosition());
        let v = this.body.getVelocity();
        let toTarget = toP1
        let d = toP1.mag();
        //--------------------------------------判断当前目标p1,p2----------------------------------------//
        if (toP1.dot(toP2) > 0) {
            let d2 = toP2.mag();
            if (d2 > d) {
                toTarget = toP2;
                d = d2;
            }
        } else {
            if (toP1.dot(v) < 0) {
                //在向p2移动
                toTarget = toP2
                d = toP2.mag();
            }
        }
        toTarget.normalizeSelf();
        if (d < 50) {
            let m = g.map(d, 0, 50, 10, this.maxSpeed);
            toTarget.mulSelf(m);
        } else {
            toTarget.mulSelf(this.maxSpeed);
        }
        toTarget.subSelf(v);
        return toTarget;
    }

    noTargetMove() {
        let v = this.body.velocity
        v.normalizeSelf()
        v.mulSelf(this.maxSpeed);
        return v;
    }

    onUpdate(dt) {
        if (this.noTarget) {
            let v = this.noTargetMove()
            this.body.setVelocity(v.x, v.y);
        } else {
            this.body.applyForce(this.arrive().mulSelf(dt))
        }
    }

}