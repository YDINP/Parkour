import FizzBody, { FizzCollideInterface, FizzBodyType } from "../../../../framework/fizzx/components/FizzBody";
import Shapes from "../../../../framework/fizzx/shapes";
import Fizz from "../../../../framework/fizzx/fizz";
import BodyBase from "./BodyBase";

const { ccclass, property, menu } = cc._decorator;


enum Dir {
    auto = 0,
    right = 1,
    left = -1
}

@ccclass
@menu("fizzx/ObjWalker")
export default class ObjWalker extends BodyBase {

    static Dir = Dir

    @property({ type: cc.Enum(Dir) })
    dir: number = Dir.auto

    @property
    speed: number = 100;

    @property
    isFly: boolean = false;

    @property({ visible() { return !this.isFly } })
    turnOnCliff: boolean = false

    @property({ visible() { return this.isFly } })
    initVelocityY: number = 100;

    @property({ visible() { return this.isFly } })
    flyupForce: number = 100;

    baseY: number = 0;

    onLoad() {

    }

    start() {
        this.baseY = this.node.y;
        if (this.dir == Dir.auto) {
            this.dir = this.node.scaleX;
        }
        if (this.isFly) {
            this.body.yv += this.initVelocityY;
        }
    }

    onFalloff() {
        this.node.destroy()
    }

    onUpdate(dt) {
        this.body.xv = this.speed * this.dir;
        this.node.scaleX = this.dir;
        //------------------------------------------------------------------------------//
        if (this.isFly) {
            dt = 0.016;
            let dist = this.baseY - this.node.y
            this.body.applyForce(cc.v2(0, (Math.sign(dist) * this.flyupForce - this.body.yv) * dt));
        }
        //------------------------------------------------------------------------------//
        if (this.turnOnCliff) {
            let road = this.body.intersections[0]
            if (road) {
                let bounds = Shapes.bounds(road);
                if (this.dir == -1 && this.body.x < bounds[0] - bounds[2]) {
                    this.dir *= -1
                } else if (this.dir == 1 && this.body.x > bounds[0] + bounds[2]) {
                    this.dir *= -1
                }
            }
        }
    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        // this.body
        if (nx == -this.dir) {
            this.dir = nx;
        }
        // walker 不能在dyanamic 类型上走
        if (ny == 1) {
            let r = this.body.intersections[0]
            if (r && r.bodyType == FizzBodyType.Dynamic) {
                this.body.intersections.splice(0);
            }
        }
    }


    // onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number) {
    // }


}