import DataCenter, { dc, field } from "../../core/DataCenter";
import Device from "../../core/Device";

@dc("SettingInfo")
export default class SettingInfoDC extends DataCenter {

    //背景音乐
    @field()
    music: boolean = true;

    //音效
    @field()
    effect: boolean = true;

    //手机震动
    @field()
    vibrate: boolean = true;

    //屏幕晃动
    @field()
    shake: boolean = true;

    @field()
    volume_bgm: number = 0.75;

    isfirst: boolean = false;

    onLoadAll() {
        Device.setBGMEnable(this.music);
        Device.setSFXEnable(this.effect);
        Device.isVibrateEnabled = this.vibrate;
        console.log("load settings:---------------")
        console.log("music:", this.music)
        console.log("effect:", this.effect)
        console.log("vibrate:", this.vibrate)
        cc.audioEngine.setMusicVolume(this.volume_bgm)
    }

    saveSettings() {
        this.music = Device.isBgmEnabled;
        this.effect = Device.isSfxEnabled;
        this.vibrate = Device.isVibrateEnabled;

        this.save();
    }

}

export let SettingInfo: SettingInfoDC = DataCenter.register(SettingInfoDC);