import { EaseType } from "./EaseType";
import { PasrTimer } from "../utils/PasrTimer";
import { lerpVec2 } from "./Extension";
let { ccclass, property, menu } = cc._decorator

enum ActionType {
    Scale,
    Angle,
    Opacity
}


@ccclass("BreathAnim")
@menu("基础动画/BreathAnim")
export default class BreathAnim extends cc.Component {
    pasrTimer: PasrTimer = null
    @property
    duration: number = 1.0;

    @property({ visible() { return this.actionType == ActionType.Scale } })
    minScale: cc.Vec2 = cc.v2(0.8, 0.8);
    @property({ visible() { return this.actionType == ActionType.Scale } })
    maxScale: cc.Vec2 = cc.v2(1, 1);

    @property({ visible() { return this.actionType == ActionType.Angle } })
    maxAngle: number = 45;

    @property({ visible() { return this.actionType == ActionType.Angle } })
    minAngle: number = -45;

    @property({ visible() { return this.actionType == ActionType.Opacity } })
    maxOpacity: number = 250;

    @property({ visible() { return this.actionType == ActionType.Opacity } })
    minOpacity: number = 200;


    @property
    rest: number = 0;


    @property({ type: cc.Enum(EaseType) })
    easeType: EaseType = EaseType.linear;

    @property({ type: cc.Enum(ActionType) })
    actionType: ActionType = ActionType.Scale;

    start() {
        this.pasrTimer = new PasrTimer(this.rest, this.duration / 2, 0, this.duration / 2)
        this.pasrTimer.reset();
    }

    tmp_scale: cc.Vec2 = cc.v2();

    update(dt) {
        var t = this.pasrTimer.Tick(dt);
        t = cc.easing[EaseType[this.easeType]](t)
        if (this.actionType == ActionType.Scale) {
            this.node.scale = lerpVec2(this.tmp_scale, this.maxScale, this.minScale, t);
        } else if (this.actionType == ActionType.Angle) {
            this.node.angle = cc.misc.lerp(this.maxAngle, this.minAngle, t);
        } else if (this.actionType == ActionType.Opacity) {
            this.node.opacity = cc.misc.lerp(this.maxOpacity, this.minOpacity, t);
        }
        if (this.pasrTimer.isFinished()) {
            this.pasrTimer.reset();
        }
    }

}