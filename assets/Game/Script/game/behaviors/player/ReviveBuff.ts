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
        //重新开始计算 掉下去
        let deadDetector = root.player.getComponent(PlayerDeadDetector)
        deadDetector.reset();
        pdata.lastAction = PlayerActionType.revive;
        //正常生命值的1/2复活
        pdata.hp = pdata.maxHp_normal / 2;
        //从天而降
        root.player.body.yv = 0;
        root.player.body.setPosition(root.player.body.x, cc.winSize.height + 100)
        root.player.skeleton.play("run")
        //恢复姿势
        root.player.setNormalSize();
        root.invisibleRectsEnabled = true;
        //复活无敌5s  
        this.getComponent(BuffSystem).restartBuff("invincible", 5)
    }

    onDisable() {
        root.invisibleRectsEnabled = false;
    }

}