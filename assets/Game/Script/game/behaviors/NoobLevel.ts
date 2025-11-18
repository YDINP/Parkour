import { evt } from "../../../../framework/core/event";
import NumTrigger from "../../../../framework/extension/utils/NumTrigger";
import FizzManager from "../../../../framework/fizzx/components/FizzManager";
import { root } from "../Game"
import { guider } from "../Guide";

let { ccclass, property } = cc._decorator
@ccclass
export default class NoobLevel extends cc.Component {

    trigger: NumTrigger = new NumTrigger;

    onLoad() {
        let next = this.next.bind(this)
        this.trigger.add(1560, 0, next)
        this.trigger.add(3190, 0, next)
        this.trigger.add(4864, 0, next)
        this.trigger.add(6020, 0, next)
        this.trigger.add(7232, 0, next)
        this.trigger.add(8580, 0, next)
        guider.guide_op();


        let node = new cc.Node()
        node.setContentSize(cc.winSize);
        node.addComponent(cc.BlockInputEvents);
        node.parent = this.node;
    }

    next() {
        evt.emit("NoobLevel.next")
    }

    update() {
        this.trigger.update(root.player.node.x)
    }

}