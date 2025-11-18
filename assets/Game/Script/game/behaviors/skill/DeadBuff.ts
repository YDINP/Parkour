import Player from "../../Player";

export default class DeadBuff extends cc.Component {

    player: Player

    onLoad() {
        this.player = this.getComponent(Player)
    }

    hero: string;

    onEnable() {
        // let val = this.player.data.passiveSkill.param
        // this.hero = this.player.data.prefabPath
        // this.player.setSkeleton("heros/turn/" + val);
        this.player.skeleton.setArmature("dead")
        //rush 
        this.player.skeleton.play("rush", 0)
    }

    onDisable() {

    }
}