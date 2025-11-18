import { pdata } from "../../../data/PlayerInfo"
import Player from "../../Player"

let { ccclass, property } = cc._decorator
@ccclass
export default class DmgReduce extends cc.Component {

    player: Player

    onLoad() {
        this.player = this.getComponent(Player)
    }

    curAddVal: number = 0;

    onEnable() {
        let val = this.player.data.lvs[pdata.selHeroLevel - 1].data;
        this.curAddVal = val / 100;
        this.player.damageReduce += this.curAddVal;

    }

    onDisable() {
        this.player.damageReduce -= this.curAddVal;
    }

}