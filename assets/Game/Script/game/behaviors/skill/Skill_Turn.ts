import { pdata } from "../../../data/PlayerInfo"
import Player from "../../Player"

let { ccclass, property } = cc._decorator
@ccclass
export default class Skill_Turn extends cc.Component {
    player: Player

    onLoad() {
        this.player = this.getComponent(Player)
    }

    hero: string;

    onEnable() {
        let val = this.player.data.passiveSkill.param[0]
        this.hero = this.player.data.prefabPath
        this.player.setSkeleton("heros/turn/" + val);
    }

    onDisable() {
        this.player.setSkeleton(this.hero);
    }

}