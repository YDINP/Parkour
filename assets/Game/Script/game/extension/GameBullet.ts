import FxHelpher from "../../../../framework/extension/fxplayer/FxHelpher";
import SBulletWithFizzBody from "../../../../framework/fizzx/components/extension/BulletWithFizzbody";
import FizzBody from "../../../../framework/fizzx/components/FizzBody";
import FizzManager from "../../../../framework/fizzx/components/FizzManager";
import ccUtil from "../../../../framework/utils/ccUtil";
import Game from "../Game";
import WeaponData from "../model/WeaponData";

let { ccclass, property } = cc._decorator
@ccclass
export default class GameBullet extends SBulletWithFizzBody {


    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        let weaponData = this.weapon.data as WeaponData
        if (weaponData.canLand) {
            if (b.node == null) return
        }
        super.onFizzCollideEnter(b, nx, ny, pen);
        let pos = FizzManager.getHitPoint(this.body, b, nx, ny)
        // Game.instance.play_efx(weaponData.hit, pos, Math.atan2(ny, nx) * cc.macro.DEG)
        FxHelpher.play("map", weaponData.hit, pos)
    }


    remove() {
        this.entity.kill();
    }

    fire(v) {
        let weaponData = this.weapon.data as WeaponData
        if (weaponData.startOffsetY) {
            this.node.y += weaponData.startOffsetY;
        }
        super.fire(v);
        this.unschedule(this.remove);
        this.scheduleOnce(this.remove, weaponData.removeAfter);
    }

    onDisable() {
        this.unschedule(this.remove);
    }


    // update() {
    //     let weaponData = this.weapon.data as WeaponData
    //     //防止摩擦力或者maxSpeed被 限制速度 
    //     // if (weaponData.canLand)
    //     //     this.body.xv = weaponData.speed;
    // }


}