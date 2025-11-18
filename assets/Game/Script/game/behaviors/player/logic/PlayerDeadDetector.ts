import { evt } from "../../../../../../framework/core/event"
import FxHelpher from "../../../../../../framework/extension/fxplayer/FxHelpher"
import FizzBody from "../../../../../../framework/fizzx/components/FizzBody"
import FizzManager from "../../../../../../framework/fizzx/components/FizzManager"
import Fizz from "../../../../../../framework/fizzx/fizz"
import { Toast } from "../../../../../../framework/ui/ToastManager"
import { ParkourType, pdata, PlayerActionType } from "../../../../data/PlayerInfo"
import { root } from "../../../Game"
import BuyPropsData from "../../../model/BuyPropsData"

let { ccclass, property } = cc._decorator
@ccclass
export default class PlayerDeadDetector extends cc.Component {

    body: FizzBody = null

    onLoad() {
        this.body = this.getComponent(FizzBody)
        evt.on("pdata.hp", this.onHpChanged, this)
    }


    isDead = false;

    start() {

    }

    reset() {
        this.isDead = false;
    }

    onHpChanged(n) {
        if (this.isDead) return;
        if (n <= 0) {
            root.player.handleDead();
            this.showReason()
            if (pdata.lastAction == PlayerActionType.fall_off) {
                //立即停止
                FizzManager.instance.enabled = false;
            }
            this.isDead = true;
            this.scheduleOnce(this.onDead, 1.5);
            root.pause();
        }
    }

    update() {
        //掉落悬崖
        if (this.body.y + this.body.hh < -100) {
            pdata.lastAction = PlayerActionType.fall_off
            pdata.hp = 0;
        }
    }

    showReason() {
        console.log("-----------------", PlayerActionType[pdata.lastAction]);
        switch (pdata.lastAction) {
            case PlayerActionType.consume_hp:
                // Toast.make("体力不足!!!")
                FxHelpher.play("screen", 'ui/fail_tip_exhausted')
                break;
            case PlayerActionType.get_hit:
                // Toast.make("你被撞倒了");
                FxHelpher.play("screen", 'ui/fail_tip_exhausted')
                break;
            case PlayerActionType.fall_off:
                FxHelpher.play("screen", 'ui/fail_tip_fall')
                // Toast.make("掉落悬崖")
                break;
        }
    }

    onDead() {
        if (pdata.isGameEnd) return;
        pdata.endGame();
        if (pdata.reviveCount == 1) {
            if (!pdata.isGameWin && pdata.gameMode == ParkourType.Normal) {
                //普通败
                vm.show("UIFail")
            } else {
                //普通 胜，无尽胜/败
                vm.show("UIEndPage")
            }
        } else {
            vm.show("UIRevive")
        }
    }
}