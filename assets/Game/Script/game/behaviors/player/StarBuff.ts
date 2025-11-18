import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import { root } from "../../Game"
import Item from "../../objects/Item";

let { ccclass, property } = cc._decorator
@ccclass
export default class StarBuff extends cc.Component {

    onLoad() {
        this.schedule(this.tagUpdate, 0.03);
    }

    idx: number = 0

    onEnable() {
        this.idx = root.itemLayer.startIndex + 1
        this.tagUpdate();
    }



    tagUpdate() {
        let node = root.itemLayer.get(this.idx)
        if (!node || !node.isValid) {
            if (this.idx < root.itemLayer.endIndex) {
                this.idx++;
            }
            return;
        }
        let item = node.getComponent(Item)
        if (item && item.data.isBean) {
            //所有豆子变星星
            FxHelpher.play("map", "star_turn", node.getPosition())
            item.changeItem("item_004")
        }
        this.idx++;
    }


    onDisable() {

    }

}