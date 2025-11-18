import DCUI from "./DCUI";
import PandoraPoint from "./controller/PandoraPoint";


const { ccclass, property, requireComponent, menu } = cc._decorator;

@ccclass
@menu("mimgame/UI/DCPandoraPoint")
@requireComponent(PandoraPoint)
export default class DCPandoraPoint extends DCUI {

    point: PandoraPoint;
    onLoad() {
        this.point = this.getComponent(PandoraPoint);
    }

    onValueChanged(v) {
        this.point.setNumber(v);
    }

}
