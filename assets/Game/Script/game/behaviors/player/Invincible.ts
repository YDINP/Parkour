import Buff from "../../../../../framework/extension/buffs/Buff";
import { root } from "../../Game";

let { ccclass, property } = cc._decorator
@ccclass
export default class Invincible extends cc.Component {

    onLoad() {

    }
    oldOpacity: number = 255
    blink: any;

    onEnable() {
        let buff = root.player.buffSystem.getBuff("invincible")
        if (buff && buff.data == false) {
            //传递false时 不闪烁
            return;
        }
        this.oldOpacity = this.node.opacity;
        this.blink = cc.blink(1.0, 10)
        this.node.runAction(this.blink)
    }

    onDisable() {
        this.node.stopAction(this.blink)
        this.node.opacity = 255
    }
}