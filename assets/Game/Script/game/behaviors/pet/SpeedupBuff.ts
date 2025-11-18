import { pdata } from "../../../data/PlayerInfo"
import { root } from "../../Game"

let { ccclass, property } = cc._decorator
@ccclass
export default class SpeedupBuff extends cc.Component {

    onLoad() {

    }

    onEnable() {
        let d = root.pet.data.lvs[pdata.selPetLevel - 1].data
        root.player.xMove = 1 + d / 100;
    }

    onDisable() {

    }

}