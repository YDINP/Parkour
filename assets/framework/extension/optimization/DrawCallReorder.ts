const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/util/DrawCallReorderMark")
export default class DrawCallReorderMark extends cc.Component {
    @property
    orderId: number = 0;

    onLoad() {

    }
    start() {

    }
}