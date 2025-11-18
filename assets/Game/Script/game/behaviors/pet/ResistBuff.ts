import { pdata } from "../../../data/PlayerInfo";
import { root } from "../../Game";
import Pet from "../../objects/Pet";
import Player from "../../Player";

let { ccclass, property } = cc._decorator
@ccclass
export default class ResistBuff extends cc.Component {

    pet: Pet

    onLoad() {
        this.pet = this.getComponent(Pet)
    }

    curAddVal: number = 0;

    onEnable() {
        let val = this.pet.data.lvs[pdata.selPetLevel - 1].data;
        this.curAddVal = val / 100;
        root.player.damageReduce += this.curAddVal;
    }

    onDisable() {
        root.player.damageReduce -= this.curAddVal;
    }

}