import BodyBase from "../../../../framework/fizzx/components/Common/BodyBase";
import ccUtil from "../../../../framework/utils/ccUtil";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("fizzx/ObjHakw")
export default class ObjHakw extends BodyBase {

    @property(cc.Node)
    target: cc.Node = null;

    paths: cc.Vec2[] = []

    @property
    maxSpeed: number = 250;

    is_attacking: boolean = false;

    onDestroy() {
        this.node.destroyAllChildren();
    }

    onLoad() {
        this.body.pathSigal.on(this.wayPointChanged, this);
    }

    start() {
        let w = Math.abs(this.target.position.x)
        this.paths = [];
        this.paths.push(this.node.getPosition());
        let tar = ccUtil.getRelatePosition(this.target, this.node)
        this.paths.push(tar)
        this.paths.push(cc.v2(this.node.x + Math.sign((tar.x - this.node.x)) * w * 2, this.node.y))
    }

    wayPointChanged(path: cc.Vec2[], index) {
        if (path.length == index) {
            // finished
            this.body.setVelocity(0, 0);
            this.node.scaleX *= -1;
            this.paths.reverse();
            this.is_attacking = false;
            this.body.resetPath();
        }
    }

    onUpdate() {
        if (this.is_attacking) {
            let f = this.body.followPath(this.paths, true, this.maxSpeed)
            this.body.applyForce(f);
        }
    }

    attack() {
        this.is_attacking = true;
    }
}