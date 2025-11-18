import FizzBody, { FizzCollideInterface } from "../../../../framework/fizzx/components/FizzBody";
import FSM from "../../../core/FSM";
import { Shake } from "../../../extension/action/ShakeAction";
import BodyBase from "./BodyBase";


const { ccclass, property, menu } = cc._decorator;

enum BreakState {
    Normal,
    Breaking,
    Breaked,
}

@ccclass
@menu("fizzx/ObjBreaker")
export default class ObjBreaker extends BodyBase {

    fsm: FSM;

    @property
    breakAfterSec: number = 1;

    @property
    activeGroups: string = ""

    onLoad() {
        this.fsm = this.addComponent(FSM)
        this.fsm.init(this);
        this.fsm.addStates(BreakState);
        this.fsm.enterState(BreakState.Normal);

        this.body.left = true
        this.body.right = true;
    }

    start() {

    }


    enter_BreakingState(state) {
        this.node.runAction(Shake.create(this.breakAfterSec, 2, 0))
    }

    update_BreakingState(state, dt: number) {
        if (this.fsm.timeElapsed > this.breakAfterSec) {
            this.fsm.changeState(BreakState.Breaked);
        }
    }

    enter_BreakedState(state) {
        this.body.destroy();
        this.destroy();
        let move = cc.moveBy(0.5, cc.v2(0, -100)).easing(cc.easeSineIn())
        this.node.runAction(cc.sequence(move, cc.callFunc(this.node.destroy, this.node)))
    }



    onFizzCollideEnter(body: FizzBody, nx, ny, pen) {
        if (this.fsm.isInState(BreakState.Breaking) || this.fsm.isInState(BreakState.Breaked)) {
            return;
        }
        if (this.activeGroups.includes(body.node.group)) {
            this.fsm.changeState(BreakState.Breaking);
        }
    }
}