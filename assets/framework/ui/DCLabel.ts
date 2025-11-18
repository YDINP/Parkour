import DCUI from "./DCUI";

const { ccclass, property, requireComponent, menu } = cc._decorator;


@ccclass
@menu("mimgame/UI/DCLable")
@requireComponent(cc.Label)
export default class DCLabel extends DCUI {

    label: cc.Label;
    @property
    str: string = "%s";

    @property
    hasAnim: boolean = true;

    @property({ visible() { return this.hasAnim } })
    dur: number = 0.1;

    @property({ visible() { return this.hasAnim } })
    scale: number = 1.2;

    @property({ displayName: "单位格式化" })
    formatUnit: boolean = true;

    onLoad() {
        this.label = this.getComponent(cc.Label);
    }

    onValueChanged(v) {
        if (v == null) {
            console.log("[DCLabel] warn!", "not found field " + this.dataBind)
            v = "0"
        }
        if (this.formatUnit) {
            this.label.string = cc.js.formatStr(this.str, v.toUnitString());
        } else {
            this.label.string = cc.js.formatStr(this.str, v);
        }
        if (this.hasAnim) {
            this.node.stopActionByTag(1000);
            let scale = cc.scaleTo(this.dur, this.scale).easing(cc.easeSineInOut())
            let scale2 = cc.scaleTo(this.dur, 1, 1);
            let seq = cc.sequence(scale, scale2)
            seq.setTag(1000);
            this.node.runAction(seq)
        }
    }

    // update (dt) {}
}
