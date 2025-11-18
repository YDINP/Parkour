import Signal from "../../../../../framework/core/Signal";
import ccUtil from "../../../../../framework/utils/ccUtil";

let { ccclass, property } = cc._decorator

let lx: number = 0;
let ly: number = 0;
let rx: number = 0;
let ry: number = 0;

@ccclass
export default class RemoveIfOOS extends cc.Component {
    onLoad() {
        if (lx == 0 || rx == 0) {
            let w = cc.winSize.width;
            let h = cc.winSize.height;
            lx = -w / 2;
            rx = w / 2;
            ly = -h / 2;
            ry = h / 2;
        }
    }

    start() {
        // this.schedule(this.onUpdate, 0.2)
    }

    update(dt) {
        //node.parent.parent= main tiledmap
        // ! 注意层级关系
        let x = this.node.x + this.node.parent.parent.x + this.node.width / 2;
        if (x < lx) {
            this.node.destroy();
        }
    }
}