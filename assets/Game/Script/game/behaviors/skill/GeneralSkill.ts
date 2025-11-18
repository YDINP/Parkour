import { evt } from "../../../../../framework/core/event";
import FxPlayer from "../../../../../framework/extension/fxplayer/FxPlayer";
import ccUtil from "../../../../../framework/utils/ccUtil";
import WeaponData from "../../model/WeaponData";
import Player from "../../Player"

let { ccclass, property } = cc._decorator
@ccclass
export default class GeneralSkill extends cc.Component {
    player: Player = null;

    fxPlayer: FxPlayer = null;

    isReleased = false;

    weaponData: WeaponData;

    onLoad() {
        this.player = this.getComponent(Player)
        this.fxPlayer = this.getOrAddComponent(FxPlayer);
        this.resetSkillFx();
    }

    resetSkillFx() {
        let weaponData = ccUtil.get(WeaponData, this.player.data.weapon)
        this.weaponData = weaponData;
        if (weaponData.castFx != "") {
            this.fxPlayer.clear();
            this.fxPlayer.prefabPath = weaponData.castFx;
            this.fxPlayer.preload();
        }
    }

    onNotify(name, data) {
        if (name == 'ResetHero') {
            this.resetSkillFx()
        }
    }

    onEnable() {
        // this.fire();
        //cast skill instantly
        this.onStep();
    }


    async attack() {
        // let buffData = this.player.buffSystem.getBuff("skill")
        this.isReleased = true;
        let count = this.player.data.skill.param[1] || 1
        let interval = this.player.data.skill.param[2] || 0.1;
        for (let i = 0; i < count; i++) {
            this.player.gun.fire();
            await evt.sleepSafe(this, interval)
        }

    }

    onStep() {
        // let angle = this.player.controller.dir == 1 ? 0 : 180
        if (this.player.isSlide || this.player.stronger) {
            //滑动状态不触发攻击
            return;
        }
        this.fxPlayer.play(this.weaponData.castFxOffset);
        this.player.controller.attack()
        this.isReleased = false;
        // fix case when buff at this moment is active , 0.2s later will be diabled. so the bullet will not be fired .
        this.scheduleOnce(this.attack, 0.2)
    }

    onDisable() {
        if (!this.isReleased) {
            this.attack();
        }
    }


}