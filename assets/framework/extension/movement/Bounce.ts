import Signal from "../../../framework/core/Signal";

let { ccclass, property, menu } = cc._decorator

const s_maxBounces: number = 3;
const s_gravity: number = 100;
const s_frictionFactorY: number = 0.1;
const s_frictionFactorX: number = 0.5;
const s_bounceFactor: number = 0.4;
@ccclass
@menu('mimgame/movement/Bounce')
export default class Bounce extends cc.Component {

    private m_bounces: number = 0;

    private m_coinVerticalVelocity: number = 0;

    m_vel: cc.Vec2 = cc.v2(0, 0);

    timeout: number = 0;

    onFinish: Signal = new Signal();
    onBounce: Signal = new Signal();

    once = true;

    bRotate: boolean = false;

    onLoad() {

    }

    start() {

    }

    onEnable() {
        this.once = true;
        this.m_bounces = 0;
        this.m_coinVerticalVelocity = 0;
        this.m_vel.mulSelf(0);
    }

    bounceBaseY: number = 0;

    go(x, y, bounceBaseY) {
        this.m_vel.x = x;
        this.m_vel.y = y;
        this.bounceBaseY = bounceBaseY;
    }

    update(dt) {
        if (this.m_bounces < s_maxBounces) {
            if (this.node.y < this.bounceBaseY) {
                this.m_bounces++;
                //bounce 
                this.m_coinVerticalVelocity = this.m_coinVerticalVelocity * (-s_bounceFactor);
                this.node.y = this.bounceBaseY;
                // damping 
                this.m_vel.x = this.m_vel.x * s_frictionFactorX;
                this.m_vel.y = this.m_vel.y * s_frictionFactorY;
                if (this.bRotate)
                    this.node.angle += 60;
                this.onBounce.fire(this);
            }
            this.node.x += this.m_vel.x;
            this.node.y += this.m_vel.y;

            this.m_coinVerticalVelocity = this.m_coinVerticalVelocity + s_gravity * dt;
            //fall 
            // this.m_coinHeight = this.m_coinHeight - this.m_coinVerticalVelocity;
            this.node.y -= this.m_coinVerticalVelocity;
        } else {
            if (this.once) {
                this.once = false;
                if (this.timeout > 0) {
                    this.scheduleOnce(this.emitFinish, this.timeout)
                } else {
                    this.emitFinish();
                }
            }
        }
    }

    emitFinish() {
        try {
            this.onFinish.fire(this);
        } catch (e) {
            console.error(e);
        }
    }

}