import ccUtil from "../../../../framework/utils/ccUtil";

let { ccclass, property } = cc._decorator
@ccclass
export default class Follow extends cc.Component {

    private _target: cc.Node = null;
    private originTarget: cc.Node

    private _offset: cc.Vec2 = cc.v2();
    private originOffset: cc.Vec2

    public get offset(): cc.Vec2 {
        return this._offset;
    }
    public set offset(value: cc.Vec2) {
        this._offset = value;
        if (!this.originOffset) {
            this.originOffset = value;
        }
    }

    onLoad() {

    }

    start() {
    }

    public get target(): cc.Node {
        return this._target;
    }

    /**if target == null , its node will follow the world ,offset still working ,but anchor to the world*/
    public set target(value: cc.Node) {
        this._target = value;
        if (value != null)
            this.node.setPosition(value.getPosition());
        if (!this.originTarget) {
            this.originTarget = value;
        }
    }

    reset() {
        this.offset = this.originOffset || cc.v2();
        this._target = this.originTarget;
    }

    lateUpdate() {
        if (this.target == null) {
            let wp = ccUtil.getWorldPosition(this.node)
            let x = cc.misc.lerp(wp.x, this.offset.x, 0.1);
            let y = cc.misc.lerp(wp.y, this.offset.y, 0.1);
            ccUtil.setWorldPositon(this.node, cc.v2(x, y));
            return;
        }
        let pos = this.target.getPosition();
        let offset = this.offset;
        let nx = pos.x + offset.x
        let ny = pos.y + offset.y

        let x = cc.misc.lerp(this.node.x, nx, 0.1);
        let y = cc.misc.lerp(this.node.y, ny, 0.1);
        this.node.setPosition(x, y)

    }

}