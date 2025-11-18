import Device from "../../../framework/core/Device";
import Platform from "../../../framework/extension/Platform";
import { SettingInfo } from "../../../framework/extension/weak_net_game/SettingInfo";
import mvcView from "../../../framework/ui/mvcView";

let { ccclass, property } = cc._decorator
@ccclass
export default class UISetting extends mvcView {

    @property(cc.Node)
    musicOn: cc.Node = null;

    @property(cc.Node)
    musicOff: cc.Node = null;

    @property(cc.Node)
    musicEffectOn: cc.Node = null;

    @property(cc.Node)
    musicEffectOff: cc.Node = null;

    @property(cc.Node)
    hendleControlOn: cc.Node = null;

    @property(cc.Node)
    hendleControlOff: cc.Node = null;

    @property(cc.Node)
    btn_close: cc.Node = null;

    @property(cc.Node)
    btn_share: cc.Node = null;

    onLoad() {
        this.onClick(this.musicOn, this.click_musicOn);
        this.onClick(this.musicOff, this.click_musicOff);
        this.onClick(this.musicEffectOn, this.click_musicEffectOn);
        this.onClick(this.musicEffectOff, this.click_musicEffectOff);
        this.onClick(this.hendleControlOn, this.click_hendleControlOn);
        this.onClick(this.hendleControlOff, this.click_hendleControlOff);
        this.onClick(this.btn_close, this.click_close);
        this.onClick(this.btn_share, this.click_share);
        this.onVisible(this.musicOn, () => !SettingInfo.music);
        this.onVisible(this.musicOff, () => SettingInfo.music);
        this.onVisible(this.musicEffectOn, () => !SettingInfo.effect);
        this.onVisible(this.musicEffectOff, () => SettingInfo.effect);
        this.onVisible(this.hendleControlOn, () => !SettingInfo.music);
        this.onVisible(this.hendleControlOff, () => SettingInfo.music);
    }

    onShow() {
        this.render();
    }

    click_musicOn() {
         
        Device.setBGMEnable(true);
        SettingInfo.saveSettings();
        this.render();
    }

    click_musicOff() {
         
        Device.setBGMEnable(false);
        SettingInfo.saveSettings();
        this.render();
    }

    click_musicEffectOn() {
         
        Device.setSFXEnable(true);
        SettingInfo.saveSettings();
        this.render();
    }

    click_musicEffectOff() {
         
        Device.setSFXEnable(false);
        SettingInfo.saveSettings();

        this.render();
    }

    click_hendleControlOn() {
        // SettingInfo.music = true;
        // SettingInfo.save("music");
         
        this.render();
    }

    click_hendleControlOff() {
        // SettingInfo.music = true;
        // SettingInfo.save("music");
         
        this.render();
    }

    click_close() {
         
        vm.hide(this);
    }

    click_share() {
        Platform.share();
    }
}