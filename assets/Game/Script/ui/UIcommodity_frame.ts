import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import { pdata } from "../data/PlayerInfo";
import SilverCoinData from "../game/model/SilverCoinData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIcommodity_frame extends mvcView {

    @property(cc.Label)
    lab_silver_coin: cc.Label = null;

    @property(cc.Label)
    lab_diamond: cc.Label = null;

    @property(cc.Sprite)
    commodity_icon: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.register<SilverCoinData>(this.lab_silver_coin, (data) => data.silver_coin);
        this.register<SilverCoinData>(this.lab_diamond, (data) => data.diamond);
        this.register<SilverCoinData>(this.commodity_icon, (data) => data.icon);

    }

    start() {

    }

    click_get() {
         
        let data = this.getData() as SilverCoinData;
        if (pdata.diamond - data.diamond >= 0) {
            pdata.diamond -= data.diamond;
            pdata.gold += data.silver_coin;
            pdata.save();
        }
        else
            Toast.make("钻石不足");
    }

    // update (dt) {}
}
