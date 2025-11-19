import gUtil from "../../../../framework/core/gUtil";
import BlinkRed from "./BlinkRed";

export default class Effect {

    static blinkRed(node: cc.Node, duration: number, times) {
        let blink = gUtil.getOrAddComponent(node, BlinkRed);
        blink.duration = duration;
        blink.times = times;
        blink.enabled = true;
    }
}