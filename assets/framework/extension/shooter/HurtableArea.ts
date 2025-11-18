import GameEntity from "./SGameEntity";

let { ccclass, property, menu } = cc._decorator
@ccclass
@menu("mimgame/shooter/HurtableArea")
export default class HurtableArea extends cc.Component {

    @property
    absoluteKill: boolean = true;

    @property({ visible() { return !this.absoluteKill } })
    damage: number = 10;



    onLoad() {

    }

    start() {

    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        let ge = other.getComponent(GameEntity);
        if (ge && ge.isActive) {
            if (this.absoluteKill) {
                ge.decreaseHp(ge.hp, this.name);
            } else {
                ge.decreaseHp(this.damage, this.name);
            }
        }
    }


}