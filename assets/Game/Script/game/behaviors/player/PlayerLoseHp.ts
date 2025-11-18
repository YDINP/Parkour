import { pdata, PlayerActionType } from "../../../data/PlayerInfo"

let { ccclass, property } = cc._decorator
@ccclass
export default class PlayerLoseBuff extends cc.Component {

    start() {
    }

    onEnable() {

    }

    onStep() {
        if (pdata.hp <= 0) return;
        pdata.lastAction = PlayerActionType.consume_hp;
        pdata.hp -= pdata.hpLose
    }

}