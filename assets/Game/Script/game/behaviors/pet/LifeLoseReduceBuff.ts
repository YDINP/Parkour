import { pdata, PlayerActionType } from "../../../data/PlayerInfo"

let { ccclass, property } = cc._decorator
@ccclass
export default class LifeLoseReduceBuff extends cc.Component {

    onLoad() {

    }

    onEnable() {
        pdata.hpLose = (1 - pdata.selPetData.lvs[pdata.selPetLevel - 1].data / 100)
    }

    onDisable() {

        pdata.hpLose = 1;
    }


}