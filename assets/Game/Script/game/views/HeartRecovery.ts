import { evt } from "../../../../framework/core/event";
import Buff from "../../../../framework/extension/buffs/Buff";
import BuffSystem from "../../../../framework/extension/buffs/BuffSystem";
import GenericBuff, { GenericBuffConfig } from "../../../../framework/extension/buffs/GenericBuff";
import gameUtil from "../../../../framework/utils/gameUtil";
import { pdata } from "../../data/PlayerInfo";
import InventoryUI from "../../view/TopMostInventoryUI";
// 恢复时间 5分
const recovery_time = 300;
const recovery_max = 5;
export class HeartRecoveryBuff extends Buff {
    onEnabled() {
        evt.on("pdata.energy", this.onEnergyChanged, this)
    }

    onDisabled() {
        evt.off("pdata.energy", this.onEnergyChanged, this)

    }

    onEnergyChanged(nv, v) {
        if (v == recovery_max && nv < recovery_max) {
            pdata.energyRecoveryT = this.system.time;
            pdata.save("energyRecoveryT")
        }
    }

    onTimeLeftChanged() {
        let time_elappsed = this.system.time - pdata.energyRecoveryT
        if (time_elappsed >= recovery_time) {
            let count = Math.floor(time_elappsed / recovery_time);
            let calc_count = pdata.energy + count
            //最多 recovyer_max 点
            if (calc_count > recovery_max) {
                pdata.energy = recovery_max;
            } else {
                pdata.energy = calc_count
            }
            pdata.energyRecoveryT = this.system.time
            pdata.save("energyRecoveryT", "energy")
        }
    }

}
BuffSystem.register("heartRecovery", HeartRecoveryBuff)

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeartRecovery extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    target: cc.Node = null;
    onLoad() {
        let buf = BuffSystem.main.getBuff("heartRecovery")
        buf.on(Buff.EventType.Update, this.onUpdate, this)
        this.onUpdate(buf);
    }

    onDestroy() {
        let buf = BuffSystem.main.getBuff("heartRecovery")
        buf.off(Buff.EventType.Update, this.onUpdate, this)
    }

    onUpdate(buff: Buff) {
        let timeleft = recovery_time - (buff.system.time - pdata.energyRecoveryT)
        if (timeleft <= 0) {
            if (InventoryUI.instance)
                InventoryUI.instance.setTarget(this.label.node)
        }
        if (pdata.energy < recovery_max) {
            this.target.active = true;
            this.label.node.active = true;
            this.label.string = gameUtil.formatSeconds(timeleft);
        } else {
            this.target.active = false;
            this.label.node.active = false;
        }
    }

}