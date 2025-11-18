import GameEntity, { EntityState } from "./SGameEntity";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/shooter/Explode")
export default class SExplode extends GameEntity {

    @property
    speed: number = 5;

    @property
    damage: number = 200;

    onLoad() {
        super.onLoad();
    }

    start() {
        super.start();
        // ShootManager.instance.allBullets.push(this);
    }

    onDead() {

    }

    onCollisionEnter(other: cc.Collider, self) {
        let entity = other.getComponent(GameEntity)
        if (entity == null) {
            entity = other.getComponentInParent(GameEntity);
        }
        if (entity.isActive && this.isActive) {
            // this.damage = Math.round( Math.pow(PlayerInfo.g_lv, 3)/3 +200 );
            entity.decreaseHp(this.damage);
            //this.decreaseHp(entity.damage)
            this.onHitEntity(entity, other)
        }
    }

    onHitEntity(entity: GameEntity, collider: cc.Collider) {

    }


    // update (dt) {}
}
