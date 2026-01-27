import Signal from "../../core/Signal";
import BuffSystem from "./BuffSystem";

enum EventType {
    Start,
    End,
    Update
}

export default abstract class Buff {
    static EventType: typeof EventType = EventType;
    duration: number = 10;
    finished: boolean = true;


    timeLeft: number = 0;

    //buff 名称 
    name: string = "";

    //注册时的数据 
    cls_data: any;

    //激活时的数据 
    data: any;

    /** 可叠加 */
    canAdd: boolean = false;

    /** 最多可叠加 多长时间 */
    maxDuration: number = 0;

    //buff 刷新 间隔
    interval: number = 1;

    signals: Map<number, Signal> = new Map()

    system: BuffSystem = null;

    constructor() {
        this.signals.set(EventType.Start, new Signal())
        this.signals.set(EventType.End, new Signal())
        this.signals.set(EventType.Update, new Signal())
    }

    node: cc.Node;


    get isEnabled() {
        return this.timeLeft > 0;
    }

    onEnabled() { }
    onDisabled() { }
    step() { }
    onTimeLeftChanged() { }
    onRecovery() { }
    onReset() { }
    save() { }
    load(offlineSec) { }
    onPause() { }
    onResume() { }
    onDestroy() { }
    onNotify(name, data) { }


    on(type: EventType, callback, target) {
        this.signals.get(type).add(callback, target)
    }

    off(type: EventType, callback, target) {
        this.signals.get(type).remove(callback, target)
    }

    private _emit(type: EventType, ...ps) {
        this.signals.get(type).fire(...ps);
    }

    beganTimeSec: number = 0;

    /**增加buff 生命周期  */
    addLife(life) {
        // if (this.duration + life < this.maxDuration) {
        this.duration += life;
        this.timeLeft += life;
        // }
    }

    recovery() {
        if (this.timeLeft <= 0) return;
        this.duration = this.timeLeft;
        this.finished = false;
        this.beganTimeSec = Date.now() / 1000;
        this.onRecovery();
        this.onTimeLeftChanged();
        if (CC_DEBUG)
            console.warn("[BuffSystem]버프 복구:" + "[" + this.name + "]", this.duration);
    }

    /**重置 buff 生命 周期  */
    resetLife() {
        this.beganTimeSec = Date.now() / 1000;
        this.finished = false;
        this.timeLeft = this.duration;
        this.onReset();
    }

    enable(duration, data = null) {
        this.duration = parseInt(duration) || this.duration;
        this.data = data;
        this.resetLife()
        this.onEnabled();
        this.onTimeLeftChanged()
        this._emit(EventType.Start, this)
        if (CC_DEBUG)
            console.warn("[BuffSystem]버프 활성화:" + "[" + this.name + "]", this.duration);
    }

    disable() {
        this.finished = true;
        this.timeLeft = 0
        try {
            this.onDisabled();
            this.onTimeLeftChanged()
        } catch (e) {
            console.warn(e)
        }
        this._emit(EventType.End, this);
        if (CC_DEBUG)
            console.warn("[BuffSystem]버프 비활성화:" + "[" + this.name + "]");
    }

    destroy() {
        this.signals.clear();
        this.onDestroy();
    }

    notify(name, data) {
        this.onNotify(name, data);
    }

    private _paused: boolean = false;

    pause() {
        this._paused = true;
        this.onPause();
    }

    resume() {
        this._paused = false;
        this.onResume();
    }


    doStep() {
        if (this._paused) return;
        if (this.finished) return;
        if (this.timeLeft > 0) {
            // this.timeLeft = this.duration - (now - this.beganTimeSec);
            this.timeLeft--;
            this.step()
            this._emit(EventType.Update, this)
            this.onTimeLeftChanged()
        }
    }


}