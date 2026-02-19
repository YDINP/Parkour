import { evt } from "../../../../framework/core/event";
import Buff from "../../../../framework/extension/buffs/Buff";
import BuffSystem from "../../../../framework/extension/buffs/BuffSystem";
import GenericBuff, { GenericBuffConfig } from "../../../../framework/extension/buffs/GenericBuff";
import gameUtil from "../../../../framework/utils/gameUtil";
import { pdata } from "../../data/PlayerInfo";
// import InventoryUI from "../../view/TopMostInventoryUI"; // 에너지 충전 연출 제거로 미사용
// 恢复时间 5分
const recovery_time = 300;
const recovery_max = 5;
// 오프라인 충전 최대 허용 경과 시간 (30일)
const MAX_OFFLINE_SEC = 30 * 24 * 60 * 60;

/** BuffSystem.main.time을 안전하게 반환. 초기화 전이면 Date.now() fallback */
function getSafeTime(): number {
    if (BuffSystem.main && BuffSystem.main.time > 0) {
        return BuffSystem.main.time;
    }
    return Math.floor(Date.now() / 1000);
}

export class HeartRecoveryBuff extends Buff {
    onEnabled() {
        evt.off("pdata.energy", this.onEnergyChanged, this);
        evt.on("pdata.energy", this.onEnergyChanged, this);
    }

    onDisabled() {
        evt.off("pdata.energy", this.onEnergyChanged, this);
    }

    onEnergyChanged(nv, v) {
        // [B1-1] 에너지가 만땅 미만으로 감소하고 타이머가 없는 경우 즉시 기록
        // 기존: v == recovery_max && nv < recovery_max (만땅→소비 케이스만 커버)
        // 개선: 만땅에서 소비되거나 타이머가 0/-1인 경우 모두 기록
        if (nv < recovery_max && (v >= recovery_max || pdata.energyRecoveryT <= 0)) {
            pdata.energyRecoveryT = getSafeTime();
            pdata.save("energyRecoveryT");
        }
    }

    onTimeLeftChanged() {
        // [방어4] energyRecoveryT가 NaN/undefined/0 이하인 경우 스킵
        if (!pdata.energyRecoveryT || isNaN(+pdata.energyRecoveryT) || pdata.energyRecoveryT <= 0) {
            return;
        }

        const now = getSafeTime();
        let time_elappsed = now - pdata.energyRecoveryT;

        // [방어1] elapsed < 0: 서버 시간 역행 또는 저장 값 비정상 → 현재 시간으로 리셋
        if (time_elappsed < 0) {
            pdata.energyRecoveryT = now;
            pdata.save("energyRecoveryT");
            return;
        }

        // [방어2] elapsed가 30일 초과 → cap
        const cappedElapsed = Math.min(time_elappsed, MAX_OFFLINE_SEC);

        if (cappedElapsed >= recovery_time) {
            let count = Math.floor(cappedElapsed / recovery_time);
            // [방어5] 에너지 최대값 초과 방지
            pdata.energy = Math.min(pdata.energy + count, recovery_max);
            pdata.energyRecoveryT = now;
            pdata.save("energyRecoveryT", "energy");
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
        const now = getSafeTime();
        const elapsed = now - pdata.energyRecoveryT;
        // elapsed < 0 (시간 역행) 또는 energyRecoveryT <= 0 인 경우 timeleft를 recovery_time으로 표시
        const safeElapsed = (pdata.energyRecoveryT > 0 && elapsed >= 0) ? elapsed : 0;
        const timeleft = recovery_time - safeElapsed;

        if (pdata.energy < recovery_max) {
            this.target.active = true;
            this.label.node.active = true;
            this.label.string = gameUtil.formatSeconds(Math.max(timeleft, 0));
        } else {
            this.target.active = false;
            this.label.node.active = false;
        }
    }

}