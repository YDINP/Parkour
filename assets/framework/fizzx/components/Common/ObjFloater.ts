import FizzBody, { FizzCollideInterface } from "../../../../framework/fizzx/components/FizzBody";
import Fizz from "../../../../framework/fizzx/fizz";
import BodyBase from "./BodyBase";

const { ccclass, property, menu } = cc._decorator;


@ccclass
@menu("fizzx/ObjFloater")
export default class ObjFloater extends BodyBase {

    baseY: number = 0;

    isOn = false;
    whoOn: any = null;
    lastOnTime = 0;

    onLoad() {
    }
    start() {
        this.baseY = this.node.y;
    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        if (b.yv < 0) {
            this.whoOn = b;
            this.isOn = true;
        }
    }

    onFizzCollideExit(b: FizzBody, nx: number, ny: number, pen: number) {
        this.isOn = false;
        this.lastOnTime = Date.now();
    }

    onFizzCollideStay(b: FizzBody, nx: number, ny: number, pen: number) {
        // this.body.yv = 
        // Fizz.changePosition(d, d.xv * dt, d.yv * dt)\
        // F = ma;
    }

    onUpdate(dt) {
        if (this.isOn == false) {
            if (this.whoOn && Date.now() - this.lastOnTime > 200) {
                this.whoOn = null;
            }
        }
        let fStandForceY = 0;
        if (this.whoOn) {
            // gravity force  
            fStandForceY = this.whoOn.mass * Fizz.getGravity().y;
            this.body.yv += fStandForceY * dt * 0.32;
        }

        let dist = this.baseY - this.node.y
        let d = Math.min(16 * 3, Math.abs(dist))
        // buyance force 恢复力
        this.body.yv += d * Math.sign(dist) * 30 * dt;
        // drag force 
        let drag = -0.002 * this.body.yv * this.body.yv * Math.sign(this.body.yv);
        this.body.yv += drag
    }

}