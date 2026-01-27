import Signal from "../../core/Signal";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/util/JoyStick")
export default class JoyStick extends cc.Component {
    @property(cc.Node)
    outterCircle: cc.Node = null;

    @property(cc.Node)
    innerCircle: cc.Node = null;

    @property({ visible() { return !this.autoRadius } })
    radius: number = 250;

    @property({ visible() { return !this.autoRadius } })
    innerCircleRadius: number = 20;


    real_radius: number = 100;

    // dynamic Joystick
    @property
    dynamicJoystick: boolean = false;

    @property
    autoRadius: boolean = true;

    private _isReleased = true;

    /** Move to finger position */
    @property({ displayName: "Allow Move", tooltip: "Will follow finger when out of range" })
    bmove = false;

    onMove: Signal = new Signal();

    onLoad() {
        if (this.autoRadius) {
            this.radius = this.outterCircle.width / 2;
            this.innerCircleRadius = this.innerCircle.width / 2;
        }
        this.real_radius = this.outterCircle.width / 2;
        this.innerCircle.setPosition(cc.Vec3.ZERO);
        this.node.active = false;
    }

    set target(v) {
        v.on(cc.Node.EventType.TOUCH_START, this.touchStart, this)
        v.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this)
        v.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this)
        v.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this)
    }

    start() {
        // this.releaseStick();
    }

    releaseStick() {
        // let move = cc.moveTo(0.5, cc.Vec2.ZERO);
        // let action = move.easing(cc.easeExponentialOut());
        // this.innerCircle.runAction(action);
        this.innerCircle.setPosition(cc.Vec3.ZERO);
        this._isReleased = true;

        if (this.dynamicJoystick) {
            this.scheduleOnce(this.delayClose, 0.1)
        }
    }

    delayClose() {
        this.node.active = false;
    }


    _axis: cc.Vec2 = cc.v2();
    _power: number = 0;

    get power() {
        return this._power;
    }

    get axis() {
        if (this._isReleased) return cc.Vec2.ZERO;
        let vec = this.innerCircle.getPosition();
        let len = vec.mag();
        if (len == 0) return cc.Vec2.ZERO;
        var power = len / this.radius;
        vec.multiplyScalar(1 / len);
        // this._axis.set(vec.x * power, vec.y * power);
        this._axis = cc.Vec2.multiplyScalar(this._axis, vec, power);
        this._power = power;
        return this._axis;
    }

    _tmp_moveOffset: cc.Vec2 = cc.v2();


    move(p: cc.Vec2) {
        let worldP = p.clone();
        let vec = p.subtract(this._startPos);
        let mag = vec.mag();
        let offset = mag - this.radius;
        if (offset > 0) {
            vec.normalizeSelf();
            if (this.bmove) {
                cc.Vec2.copy(this._tmp_moveOffset, vec);
                offset = mag - this.real_radius;
                if (offset > 0) {
                    this._tmp_moveOffset.multiplyScalar(offset)
                    let v = this.innerCircle.getPosition();
                    this._startPos.x = worldP.x - v.x
                    this._startPos.y = worldP.y - v.y;
                    let pos = this.node.parent.convertToNodeSpaceAR(cc.v3(this._startPos.x, this._startPos.y, 0));
                    this.node.position = pos;
                }
            }
            vec.multiplyScalar(this.radius)
        }
        this.innerCircle.setPosition(vec.x, vec.y);
    }
    _startPos: cc.Vec2 = cc.Vec2.ZERO;
    touch_id: number = null;
    touchStart(e) {
        if (this.touch_id != null && e.getID() != this.touch_id) return;
        // let p = e.getUILocation();
        let p = e.getLocation();
        this._startPos = p;
        this._isReleased = false;
        this.unschedule(this.delayClose);
        this.node.active = true;
        if (this.dynamicJoystick) {
            // converto screen position
            // let pos = this.node.getParent().getComponent(UITransformComponent).convertToNodeSpaceAR(v3(p.x, p.y, 0));
            let pos = this.node.getParent().convertToNodeSpaceAR(p)
            this.node.setPosition(pos);
            // this.node.opacity = 0;
            // this.node.runAction(cc.fadeIn(0.5));
        }
    }

    touchMove(e) {
        if (this.touch_id != null && e.getID() != this.touch_id) return;
        // let p = e.getUILocation();
        let p = e.getLocation();
        let p0 = e.getPreviousLocation();
        let dx = p.x - p0.x;
        let dy = p.y - p0.y;
        this.onMove.fire(dx, dy)
        this.move(p);
    }

    touchEnd(p: cc.Vec2) {
        this.releaseStick();
        this.touch_id = null;
    }

    touchCancel(e) {
        this.releaseStick();
        this.touch_id = null;
    }

}