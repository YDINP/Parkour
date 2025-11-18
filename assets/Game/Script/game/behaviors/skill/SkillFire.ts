import { evt } from "../../../../../framework/core/event";
import Player from "../../Player"

let { ccclass, property } = cc._decorator
@ccclass
export default class FireSkill extends cc.Component {
    player: Player = null;

    onLoad() {
        this.player = this.getComponent(Player)
    }

    onEnable() {
        this.fire();
    }

    async fire() {
        let angle = this.player.controller.dir == 1 ? 0 : 180
        // let angle = 0;
        this.player.controller.attack()
        this.player.gun.fire(angle);

    }

    onDisable() {

    }


}