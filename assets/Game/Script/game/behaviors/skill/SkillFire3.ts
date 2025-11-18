import { evt } from "../../../../../framework/core/event";
import Player from "../../Player";

let { ccclass, property } = cc._decorator
@ccclass
export default class SkillPig extends cc.Component {

    player: Player = null;

    onLoad() {
        this.player = this.getComponent(Player)
    }

    onEnable() {
        this.fire();
    }

    async fire() {
        let angle = this.player.controller.dir == 1 ? 0 : 180
        this.player.controller.attack()
        for (let i = 0; i < 10; i++) {
            this.player.gun.fire(angle);
            await evt.sleepSafe(this, 0.3);
        }
    }

}