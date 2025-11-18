import BulletBase from "./BulletBase";
import GameEntity, { EntityState } from "./SGameEntity";

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@menu("mimgame/shooter/BulletWithEntity")
@requireComponent(GameEntity)
export default class SBulletWithEntity extends BulletBase {

    @property
    speed: number = 5;

    @property([cc.Sprite])
    tails: cc.Sprite[] = []

    @property
    def_opacity: number = 155;

    entity: GameEntity = null;

    set damage(v) {
        this.entity.damage = v;
    }

    onLoad() {
        this.entity = this.getComponent(GameEntity);
        this.entity.on(GameEntity.Event.Dead, this.onDead, this)
        if (this.tails.length == 0) {
            this.tails = this.getComponentsInChildren(cc.Sprite);
            this.tails = this.tails.filter(v => v.node != this.node)
        }
    }

    onDestroy() {
        this.entity.off(GameEntity.Event.Dead, this.onDead, this)
    }

    onEnable() {
        this.tails.forEach(v => {
            v.node.width = 0
            v.node.opacity = this.def_opacity;
        })
    }

    onDead() {
        this.tails.forEach(v => {
            v.node.runAction(cc.fadeOut(0.2));
        })
    }

    onCollisionEnter(other: cc.Collider, self) {

        let entity = other.getComponent(GameEntity)
        if (entity == null) {
            entity = other.getComponentInParent(GameEntity);
        }
        if (entity.isActive && this.entity.isActive) {
            entity.decreaseHp(this.entity.damage);
            this.entity.decreaseHp(entity.damage)
            this.onHitEntity(entity, other)
        }
    }

    onHitEntity(entity: GameEntity, collider: cc.Collider) {

    }

    fire(v) {
        if (this.entity.moveEngine) {
            this.entity.moveEngine.velocity = v
        }
        this.entity.run()
    }


    update(dt) {
        this.tails.forEach(v => {
            v.node.width += this.speed;
        })
    }
}
