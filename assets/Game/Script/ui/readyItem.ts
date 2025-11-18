import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Switcher from "../../../framework/ui/controller/Switcher";
import mvcView from "../../../framework/ui/mvcView";
import { pdata } from "../data/PlayerInfo";
import BuyPropsData from "../game/model/BuyPropsData";

let { ccclass, property } = cc._decorator
@ccclass
export default class readyItem extends mvcView {

    @property(cc.Label)
    label_cost: cc.Label = null;

    @property(Switcher)
    switcher: Switcher = null;

    @property(cc.Node)
    btn_use: cc.Node = null;

    @property(cc.Node)
    btn_toggle: cc.Node = null;

    @property(cc.Label)
    label_name: cc.Label = null;

    @property(cc.Label)
    label_desc: cc.Label = null;


    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    label_rest: cc.Label = null;

    @property(cc.Node)
    node_badge: cc.Node = null;


    isUse: boolean = false;

    onLoad() {
        this.register<BuyPropsData>(this.icon, d => d.icon)
        this.register<BuyPropsData>(this.label_rest, d => {
            let num = pdata.buffs[d.type]
            if (num > 0) {
                return num - (this.isUse ? 1 : 0)
            }
            return 0;
        })
        this.onVisible<BuyPropsData>(this.node_badge, d => pdata.buffs[d.type] > 0)
        this.register<BuyPropsData>(this.label_name, d => d.name)
        this.register<BuyPropsData>(this.label_desc, d => d.describe)
        this.register<BuyPropsData>(this.label_cost, d => d.cost)

        this.register<BuyPropsData>(this.switcher, d => this.isUse ? 1 : 0)

        this.onClick(this.btn_use, this.click_use)
        this.onClick(this.btn_toggle, this.click_toggle)
    }

    onDisable() {
        this.isUse = false;
    }

    click_use() {
         
        this.isUse = true;
        this.render()
        evt.emit("readyItem.use", this)
    }

    click_toggle() {
         
        this.isUse = false;
        this.render();
        evt.emit("readyItem.use", this)
    }



}