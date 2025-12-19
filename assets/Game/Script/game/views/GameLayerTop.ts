import Device from "../../../../framework/core/Device";
import { evt } from "../../../../framework/core/event";
import mvcView from "../../../../framework/ui/mvcView";
import ccUtil from "../../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../../framework/Hi5/Localization/LocalizationManager";
import { ParkourType, pdata } from "../../data/PlayerInfo";
import PlayerLoseBuff from "../behaviors/player/PlayerLoseHp";
import LevelData from "../model/LevelData";

const { ccclass, property } = cc._decorator;

const color_green: { h, s, v } = cc.color().fromHEX("#45FF48").toHSV();
const color_red: { h, s, v } = cc.color().fromHEX("#FF4545").toHSV();

@ccclass
export default class GameLayerTop extends cc.Component {


    @property(cc.Label)
    private label_level: cc.Label = null;

    @property(cc.Label)
    private lab_gold: cc.Label = null;

    @property(cc.Label)
    private lab_bean: cc.Label = null;

    @property(cc.ProgressBar)
    bar_hp: cc.ProgressBar = null;


    @property(cc.Animation)
    redGlow: cc.Animation = null;


    onLoad() {
        evt.on("pdata.tmpGold", (v) => this.lab_gold.string = v, this)
        evt.on("pdata.tmpScore", (v) => this.lab_bean.string = v, this)
        evt.on("pdata.hp", this.onHpChanged, this)
        this.redGlow.play("hp_glow");
    }

    onDestroy() {
        evt.off(this);
    }

    tmpColor: cc.Color = cc.color().fromHEX("#45FF48")

    onHpChanged() {
        let per = pdata.hp / pdata.maxHp;
        let h = cc.misc.lerp(color_red.h, color_green.h, per)
        this.bar_hp.barSprite.node.color = this.tmpColor.fromHSV(h, color_green.s, color_green.v);
        if (per < 0.2) {
            this.redGlow.node.active = true;
        } else {
            this.redGlow.node.active = false;
        }
    }

    update() {
        let per = pdata.hp / pdata.maxHp;
        this.bar_hp.progress = cc.misc.lerp(this.bar_hp.progress, per, 0.1);

    }

    start() {
        if (pdata.gameMode == ParkourType.Normal) {
            let lvdata = ccUtil.get(LevelData, pdata.playinglv)
            this.label_level.string = lvdata.name
        } else {
            this.label_level.string = LocalizationManager.getText("@mode.eternal.infinity")
        }
    }

    click_pause() {
         
        vm.show("UIPause")
    }


}
