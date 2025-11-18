import GameEntity from "../../../../framework/extension/shooter/SGameEntity";
import SBulletWithFizzBody from "../../../../framework/fizzx/components/extension/BulletWithFizzbody";
import FizzBody from "../../../../framework/fizzx/components/FizzBody";
import FizzManager from "../../../../framework/fizzx/components/FizzManager";
import Game from "../Game";
import WeaponData from "../model/WeaponData";

let { ccclass, property } = cc._decorator
@ccclass
export default class BladeBullet extends SBulletWithFizzBody {


    animation: cc.Animation;

    onLoad() {
        this.animation = this.getComponent(cc.Animation);
        super.onLoad();
    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        // super.onFizzCollideEnter(b, nx, ny, pen);
        if (b.node) {
            let entity = b.getComponent(GameEntity)
            if (entity == null) {
                entity = b.getComponentInParent(GameEntity);
            }
            if (entity.isActive && this.entity.isActive) {
                this.hitBody = b;
                entity.decreaseHp(this.entity.damage);
                let weaponData = this.weapon.data as WeaponData
                let pos = FizzManager.getHitPoint(this.body, b, nx, ny)
                Game.instance.play_efx(weaponData.hit, pos, Math.atan2(ny, nx) * cc.macro.DEG)
            }
        }

    }

    onEnable() {
        //出现后
        this.node.opacity = 255;
        this.animation.play();
        super.onEnable();
        this.schedule(this.remove, 0.5)
        cc.tween(this.node).to(0.5, { opacity: 0 }).start()
    }

    remove() {
        this.entity.kill();
    }

    update() {
        this.body.xv *= 0.999;//0.95;
        // this.node.opacity *= 0.9;
    }

}