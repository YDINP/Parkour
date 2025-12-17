import BuffSystem from "../../../../../framework/extension/buffs/BuffSystem";
import { pdata, PlayerActionType } from "../../../data/PlayerInfo"
import { root } from "../../Game"
import PlayerDeadDetector from "./logic/PlayerDeadDetector";

let { ccclass, property } = cc._decorator
@ccclass
export default class ReviveBuff extends cc.Component {

    onLoad() {

    }

    onEnable() {
        console.log("========== 부활 시작 ==========");
        
        //重新开始计算 掉下去
        let deadDetector = root.player.getComponent(PlayerDeadDetector)
        deadDetector.reset();
        pdata.lastAction = PlayerActionType.revive;
        
        //正常生命值의 1/2로 부활
        pdata.hp = pdata.maxHp_normal / 2;
        
        // FizzBody와 Controller 다시 활성화
        root.player.body.enabled = true;
        root.player.body.respawn(); // 물리 시스템에 다시 등록
        root.player.controller.enabled = true;
        root.player.controller.setMovable(true);
        
        //从天而降
        root.player.body.yv = 0;
        root.player.body.setPosition(root.player.body.x, cc.winSize.height + 100)
        root.player.skeleton.play("Run")
        
        //恢复姿势
        root.player.setNormalSize();
        root.invisibleRectsEnabled = true;
        
        //复活무敌 5초
        this.getComponent(BuffSystem).restartBuff("invincible", 5)
        
        console.log("부활 완료! body.enabled:", root.player.body.enabled, "controller.enabled:", root.player.controller.enabled);
    }

    onDisable() {
        root.invisibleRectsEnabled = false;
    }

}