import { EaseType } from "./EaseType";
import UIBaseAnim from "./UIBaseAnim";
import { lerpVec3 } from "./Extension";
let { ccclass, property, menu } = cc._decorator
@ccclass("ScaleAnim")
@menu("基础动画/ScaleAnim")
export default class ScaleAnim extends UIBaseAnim {

    @property(cc.Vec3)
    from: cc.Vec3 = cc.v3();

    @property(cc.Vec3)
    to: cc.Vec3 = cc.v3();


    tmp_scale: cc.Vec3 = cc.v3();

    onTick(t: any) {
        this.node.scale = lerpVec3(this.tmp_scale, this.from, this.to, t);
    }

    start() {
        this.pasr.reset();
    }

    play() {
        return super.play();
    }

    onEnable() {
        if (this.pasr)
            this.pasr.reset()
    }

    onDisable() {

    }

}