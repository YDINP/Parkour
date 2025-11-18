import DrawCallReorderMark from "./DrawCallReorder";
import { evt } from "../../core/event";
import ccUtil from "../../utils/ccUtil";

const { ccclass, property, menu } = cc._decorator;
export enum DCIndex {
    index0,
    index1,
    index2,
    index3,
    index4,
    index5,
    index6,
    index7,
    index8,
    index9,
}

let optimizers = {}

@ccclass
@menu("mimgame/util/DrawCallOptimizer")
export default class DrawCallOptimizer extends cc.Component {
    @property([cc.Node])
    tobeOptimizeNodes: cc.Node[] = []

    @property(cc.Node)
    newLayer: cc.Node = null;

    @property({ type: cc.Enum(DCIndex) })
    orderId: DCIndex = DCIndex.index0;

    onLoad() {
        this.newLayer = this.newLayer || this.node;
        evt.on("DC.optimize", this.optimize, this)
        evt.on("DC.optimizeAll", this.optimizeAll, this)
        optimizers[this.orderId] = this;
    }

    static getOptimizer(orderId): DrawCallOptimizer {
        return optimizers[orderId]
    }

    onDestroy() {
        delete optimizers[this.orderId]
        evt.off(this);
    }

    start() {
        this.tobeOptimizeNodes.forEach(v => ccUtil.changeParent(v, this.newLayer));
        this.optimizeAll();
    }

    optimize(reorders: DrawCallReorderMark[]) {
        reorders.forEach(v => {
            if (v.orderId == this.orderId)
                ccUtil.changeParent(v.node, this.newLayer);
        })
    }

    optimizeAll() {
        let reorders = cc.director.getScene().getComponentsInChildren(DrawCallReorderMark)
        this.optimize(reorders)
    }

    optimizeTarget(node: cc.Node) {
        ccUtil.changeParent(node, this.newLayer);
    }

}