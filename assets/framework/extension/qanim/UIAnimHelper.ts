import ScaleAnim from "./ScaleAnim";
import { EaseType } from "./EaseType";
import { evt } from "../../core/event";

export enum UIAnimType {
    Position,
    Fade,
    ScaleIn,
    ScaleOut,
}

export default class UIAnimHelper {
    public static play(node: cc.Node, type: UIAnimType, duration: number, delay: number) {
        if (type == UIAnimType.ScaleIn) {
            node.scale = 0;
            var comp = node.getComponent(ScaleAnim)
            if (comp == null) {
                comp = node.addComponent(ScaleAnim);
            }
            comp.pasr.p = delay;
            comp.pasr.a = duration;
            comp.pasr.s = 0;
            comp.from = cc.Vec3.ZERO;
            comp.to = cc.Vec3.ONE;
            comp.enabled = true
            return comp;
        }
        else if (type == UIAnimType.ScaleOut) {
            node.scale = 1;
            var comp = node.getComponent(ScaleAnim)
            if (comp == null) {
                comp = node.addComponent(ScaleAnim);
            }
            comp.pasr.p = delay;
            comp.pasr.a = duration;
            comp.pasr.s = 0;
            comp.pasr.r = 0;
            comp.from = cc.Vec3.ONE;
            comp.to = cc.Vec3.ZERO;
            comp.enabled = true
            return comp;
        }
    }

    public static fadeIn(node: cc.Node) {
        node.children.forEach((v, i) => {
            UIAnimHelper.play(v, UIAnimType.ScaleIn, 0.2, i * 0.06).easeType = EaseType.backOut
        })
    }

    public static fadeOut(node: cc.Node) {
        let len = node.children.length;
        node.children.forEach((v, i) => {
            UIAnimHelper.play(v, UIAnimType.ScaleOut, 0.2, (len - i) * 0.06).easeType = EaseType.backIn
        })
        return evt.sleep(len * 0.06 + 0.2)
    }
}