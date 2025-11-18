import { EaseType } from "../extension/qanim/EaseType";

export default class actionUtil {


    static jellyJump(node, from = 0.9, scale = 1.0, duration = 0.8) {
        node.scale = from;
        let act = cc.scaleTo(duration, scale, scale).easing(cc.easeElasticOut(0.3));
        node.runAction(act)
    }

    static openUI(node: cc.Node): Promise<any> {
        let dur = 0.2
        node.opacity = 0;
        return new Promise(resolve => {
            cc.tween(node).to(0.01, { scale: 0.8 }).to(dur, { opacity: 255, scale: 1 }, { easing: "backOut" }).call(() => {
                resolve();
            }).start()
        })
    }

    static closeUI(node: cc.Node, callback: Function, target) {
        let dur = 0.25
        cc.tween(node).to(dur, { opacity: 0, scale: 0.8 }, { easing: "backIn" }).call(callback.bind(target)).start();
    }


    static moveToCenter(node: cc.Node) {
        if (node.parent) {
            let rect = node.parent.getBoundingBox()
            node.setPosition(rect.width / 2, rect.height / 2)
        }
    }

    /** move and form as a circle ,then bezier move to target */
    static flyNode(resNode, parentNode, targetpos, degree, len, flybeziercp = cc.v2(0, 1), endCallback = null, speed1 = 600, speed2 = 700) {
        let tar = cc.Vec2.RIGHT.rotate(cc.macro.RAD * degree)
        tar.mulSelf(len)
        let dur = len / speed1;
        let move = cc.moveBy(dur, tar).easing(cc.easeSineOut())
        let seq = cc.sequence(move, cc.callFunc(_ => {
            let wpos = resNode.getBoundingBoxToWorld().center;
            let mag = targetpos.sub(wpos).mag();
            let d2 = mag / speed2;
            actionUtil.moveBezier2(resNode, wpos, targetpos, flybeziercp, (node) => {
                node.destroy()
                endCallback && endCallback();
            }, d2)
        }))
        resNode.parent = parentNode;
        resNode.runAction(seq)
    }


    static moveBezier2(node, from, to, cp = cc.Vec2.RIGHT, callback: Function = null, dur = 1, delay = 0) {
        let bezier = []
        let x = from.x, y = from.y
        let ex = to.x, ey = to.y;
        bezier[0] = cc.v2(x, y)
        bezier[1] = cc.v2(x + (ex - x) * cp.x, y + (ey - y) * cp.y);
        bezier[2] = cc.v2(ex, ey)
        node.runAction(cc.sequence(cc.delayTime(delay), cc.bezierTo(dur, bezier).easing(cc.easeSineInOut()), cc.fadeOut(0.3), cc.callFunc(callback && callback.bind(node))))
    }

    static moveBezier(prefab, from, to, callback = null, dur = 1, delay = 0): cc.Node {
        let sprite = cc.instantiate(prefab)
        sprite.opacity = 255;
        sprite.setPosition(from)
        this.moveBezier2(sprite, from, to, cc.Vec2.RIGHT, callback, dur, delay);
        return sprite;
    }

}