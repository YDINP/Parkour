import Device from "../../../../framework/core/Device";
import FizzBody from "../../../../framework/fizzx/components/FizzBody";
import { pdata } from "../../data/PlayerInfo";
import { root } from "../Game";

let { ccclass, property } = cc._decorator
@ccclass
export default class EndTrigger extends cc.Component {

    onLoad() {

    }

    start() {


    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        if (pdata.hp <= 0) return;
        pdata.endGame(true);
        this.scheduleOnce(this.winGame, 1);
    }

    winGame() {
        root.pause();
        console.log("游戏胜利")
        vm.show("UIEndPage")
    }


}