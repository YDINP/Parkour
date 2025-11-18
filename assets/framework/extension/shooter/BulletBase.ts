import SFireAgent from "./SFireAgent"

export default class BulletBase extends cc.Component {
    set damage(v) { }
    weapon?: SFireAgent
    fire(vel: cc.Vec2) { };
}
