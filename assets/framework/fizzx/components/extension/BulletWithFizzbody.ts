import BulletBase from "../../../extension/shooter/BulletBase";
import GameEntity from "../../../extension/shooter/SGameEntity";
import ShootManager from "../../../extension/shooter/ShootManager";
import FizzBody, { FizzCollideInterface } from "../FizzBody";

const { ccclass, property, menu, requireComponent } = cc._decorator;

@ccclass
@menu("game/SBulletWithFizzBody")
@requireComponent(FizzBody)
export default class SBulletWithFizzBody extends BulletBase implements FizzCollideInterface {

    entity: GameEntity = null;

    body: FizzBody = null;

    sprite: cc.Sprite = null

    set damage(v) {
        this.entity.damage = v;
    }

    onLoad() {
        this.body = this.getComponent(FizzBody)
        this.entity = this.getComponent(GameEntity);
        this.entity.on(GameEntity.Event.Dead, this.onDead, this)


        this.sprite = this.getComponentInChildren(cc.Sprite)
        if (this.sprite == null) {
            this.sprite = this.getComponent(cc.Sprite)
        }
    }

    onDestroy() {
    }

    onEnable() {
        if (this.sprite)
            this.sprite.enabled = true;
        this.hitBody = null;
    }

    onDead() {
        this.body.setVelocity(0, 0);
        if (this.sprite)
            this.sprite.enabled = false
    }

    hitBody: FizzBody = null

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        if (b.node == null) {
            this.entity.decreaseHp(this.entity.hp);
            this.hitBody = b;
            return;
        }
        let entity = b.getComponent(GameEntity)
        if (entity == null) {
            entity = b.getComponentInParent(GameEntity);
        }
        if (entity == null) return;
        if (entity.isActive && this.entity.isActive) {
            this.hitBody = b;
            entity.decreaseHp(this.entity.damage);
            this.entity.decreaseHp(entity.damage)
        } else {
            this.entity.decreaseHp(this.entity.hp);
        }
    }

    onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number) {

    }

    onFizzCollideStay?(b: FizzBody, nx: number, ny: number, pen: number) {

    }


    fire(v) {
        this.body.syncPosition();
        this.body.setVelocity(v);
        this.entity.run()
    }



    update(dt) {
    }
}
