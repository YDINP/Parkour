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
        console.log("onHpChanged 호출! hp:", n, "isDead:", this.isDead);
        if (this.isDead) return;
        if (n <= 0) {
            console.log("========== HP 0! 사망 처리 시작 ==========");
            root.player.handleDead();
            this.showReason()
            // 물리 엔진은 계속 작동시켜서 아래로 떨어지게 함
            // pause() 대신 필요한 것만 중지
            root.player.buffSystem.pause();
            if (root.pet) root.pet.buffSystem.pause();
            
            this.isDead = true;
            console.log("isDead를 true로 설정했습니다.");
            this.scheduleOnce(this.onDead, 1.5);
        }
    }

    _fallTimer = 0;
    
    update(dt) {
        // 사망 후 강제로 아래로 떨어뜨리기 (물리 시스템 제외)
        if (this.isDead) {
            this._fallTimer += dt;
            // 중력 적용 (물리 엔진 없이 직접 계산)
            this.body.yv -= 1000 * dt; // 중력 가속
            
            // Player 노드 위치를 새로 설정
            // let player = this.node;
            let currentPos = this.node.position;
            let newY = currentPos.y + this.body.yv * dt;
            this.node.position = cc.v3(currentPos.x, newY, 0);
            
            // 0.1초마다 로그 출력 (너무 많은 로그 방지)
            if (this._fallTimer > 0.1) {
                console.log("Falling... yv:", this.body.yv.toFixed(2), "newY:", newY.toFixed(2), "currentPos.y:", currentPos.y.toFixed(2));
                this._fallTimer = 0;
            }
        }
        
        //掉落悬崖
        if (!this.isDead && this.body.y + this.body.hh < -100) {
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