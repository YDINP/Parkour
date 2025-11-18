import { evt } from "../../../../../framework/core/event"
import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher"
import FxLayer from "../../../../../framework/extension/fxplayer/FxLayer"
import ccUtil from "../../../../../framework/utils/ccUtil"
import { root } from "../../Game"
import Pet from "../../objects/Pet"

let { ccclass, property } = cc._decorator
@ccclass
export default class MakeItemBuff extends cc.Component {
    pet: Pet

    onLoad() {
        this.pet = this.node.getComponent(Pet)
    }

    start() {

    }

    itemId: string;

    //间隔22s制造一个10分的魔法果
    onEnable() {
        // fly to center  
        this.itemId = this.pet.data.skill.param2
        this.cast()
    }


    cast() {
        this.pet.follower.target = null;
        this.pet.follower.offset = cc.v2(cc.winSize.width * 3 / 4, cc.winSize.height / 2);
        this.schedule(this.make, 0.3)
    }

    make() {
        FxHelpher.play("map", "pet_skill", this.pet.body.getPosition());
        root.makeItem("gold", this.itemId, this.pet.body.x, this.pet.body.y)
    }

    onDisable() {
        this.pet.follower.reset();
    }




}