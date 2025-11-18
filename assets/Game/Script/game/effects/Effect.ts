import BlinkRed from "./BlinkRed";

export default class Effect {

    static blinkRed(node: cc.Node, duration: number, times) {
        let blink = node.getOrAddComponent(BlinkRed)
        blink.duration = duration;
        blink.times = times;
        blink.enabled = true;
    }
}