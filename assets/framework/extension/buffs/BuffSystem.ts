import Device from "../../core/Device";
import BuffBase from "./Buff";

import Buff from "./Buff";
import EmptyBuff from "./EmptyBuff";
const { ccclass, property } = cc._decorator;
/**
 * TODO:
// BuffManager.register(OutputSpeedupBuff, ()=>PlayerInfo.buff_outputSpeed = this.timeLeft);
 */


@ccclass
export default class BuffSystem extends cc.Component {
    private buffs: { [index: string]: BuffBase } = {}

    private static buff_cls = {}
    private static buff_cls_data = {}
    private static all_buffSystems: BuffSystem[] = []

    isPaused: boolean = false;

    private static _main: BuffSystem = null;
    public static get main(): BuffSystem {
        return BuffSystem._main;
    }
    public static set main(value: BuffSystem) {
        BuffSystem._main = value;
    }


    private _time: number = 0;

    private static _isServerTime: boolean = false;
    //当前系统时间 以秒为单位
    public get time(): number {
        return Math.floor(this._time);
    }
    //当前系统时间 以秒为单位
    static set time(t: number) {
        t = Math.floor(t);
        BuffSystem.all_buffSystems.forEach(v => v._time = t)
        this._isServerTime = true;
    }

    static get time() {
        return Math.floor(BuffSystem.main._time);
    }

    onLoad() {
        if (!BuffSystem.main) {
            BuffSystem.main = this;
        }
        BuffSystem.all_buffSystems.push(this)
        this._time = Date.now() / 1000;

    }

    onDestroy() {
        BuffSystem.all_buffSystems.splice(BuffSystem.all_buffSystems.indexOf(this))
    }




    protected onEnable() {
        this.schedule(this.step, 1)
    }

    protected onDisable() {
        this.unschedule(this.step);
    }

    protected step(dt) {
        if (this.isPaused) return;
        this._time += dt || 1;
        for (var i in this.buffs) {
            let buf = this.buffs[i]
            if (buf.isEnabled) {
                buf.doStep();
                if (!buf.isEnabled) {
                    buf.disable();
                }
            }
        }
    }

    pause() {
        this.isPaused = true;
        for (let k in this.buffs) {
            let buff = this.buffs[k]
            buff.pause();
        }
        // let comps = this.getComponents(cc.Component)
        // comps.forEach(v => cc.director.getScheduler().pauseTarget(v))
    }

    resume() {
        this.isPaused = false;
        for (let k in this.buffs) {
            let buff = this.buffs[k]
            buff.resume();
        }
        // let comps = this.getComponents(cc.Component)
        // cc.director.getScheduler().resumeTargets(comps)
    }

    static pauseAll() {
        BuffSystem.all_buffSystems.forEach(v => v.pause())
    }

    static resumeAll() {
        BuffSystem.all_buffSystems.forEach(v => v.resume())
    }

    public static register(name, cls, data = null) {
        BuffSystem.buff_cls[name] = cls;
        BuffSystem.buff_cls_data[name] = data;
    }

    private _create(buffname) {
        let cls = BuffSystem.buff_cls[buffname];
        if (cls == null) {
            if (typeof (buffname) == "string") {
                console.error("[BuffSystem]:" + buffname + " 미등록!")
                return new EmptyBuff();
            } else {
                return new buffname;
            }
        } else {
            let data = BuffSystem.buff_cls_data[buffname]
            let buff = new cls() as Buff;
            buff.name = buffname;
            buff.cls_data = data;
            return buff;
        }
    }

    getOrAddBuff(buffname) {
        let buf = this.buffs[buffname]
        if (!buf) {
            buf = this._create(buffname);
            this.buffs[buffname] = buf
        }
        return buf;
    }

    getBuff(buffname) {
        return this.buffs[buffname];
    }

    isEnabled(buffname) {
        let buff = this.getBuff(buffname);
        return buff && buff.isEnabled;
    }

    restartBuff(buffname, dur = 0, data = null) {
        this.stop(buffname)
        this.startBuff(buffname, dur, data)
    }


    startBuff(buffname, dur = 0, data = null) {
        if (buffname == '') return;
        if (csv.Audio) {
            let audio = csv.Audio["sfx_buff_" + buffname];
            Device.playSfx(audio)
        }
        if (dur <= 0) {
            dur = 999999999;
        }
        let buf = this.getOrAddBuff(buffname);
        buf.node = this.node;
        buf.system = this;
        if (buf.isEnabled) {
            if (buf.canAdd) {
                buf.addLife(dur)
            } else {
                buf.resetLife();
                console.warn("[BuffSystem]" + buffname + " is still running!")
            }
        } else {
            buf.enable(dur, data)
        }
        return buf;
    }


    stopAll() {
        for (var k in this.buffs) {
            let v = this.buffs[k];
            if (v.isEnabled) {
                v.disable();
            }
        }
    }

    stop(buffname) {
        let buf = this.getBuff(buffname)
        if (buf && buf.isEnabled)
            buf.disable();
    }

    removeBuff(buffname) {
        let buf = this.getBuff(buffname)
        if (buf) {
            buf.isEnabled && buf.disable();
            buf.destroy();
            delete this.buffs[buffname]
        }
    }

    /** broadcast msgs to all buffs bind to this instance , **onNotify** will be called in Buff  */
    broadcast(evtname, data) {
        for (let k in this.buffs) {
            let buf = this.buffs[k]
            buf.notify(evtname, data)
        }
    }


}