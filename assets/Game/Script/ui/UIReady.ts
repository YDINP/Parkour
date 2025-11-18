import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Fx from "../../../framework/extension/fxplayer/Fx";
import Platform from "../../../framework/extension/Platform";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import LoadingScene from "../common/LoadingScene";
import { ParkourType, pdata } from "../data/PlayerInfo";
import BuyPropsData from "../game/model/BuyPropsData";
import ShopCapData from "../game/model/ShopCapData";
import readyItem from "./readyItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIReady extends mvcView {

    @property(cc.Layout)
    private lay_props_content: cc.Layout = null;

    //ui_ability
    @property(cc.Layout)
    private Toggle_ability: cc.Layout = null;

    @property(cc.Sprite)
    private img_ability: cc.Sprite = null;

    @property(cc.Label)
    private lab_ability_lv: cc.Label = null;

    @property(cc.Label)
    private lab_ability_name: cc.Label = null;

    @property(cc.Label)
    private lab_ability_describe: cc.Label = null;

    @property(cc.Label)
    private lab_upgrade_price: cc.Label = null;

    private sel_itemId: number = 1;

    @property(cc.Button)
    private btn_upgrade: cc.Button = null;

    @property(cc.Label)
    lable_coin_rest: cc.Label = null;

    @property(Fx)
    up_fx: Fx = null;

    shopItemList: ShopCapData[];

    onLoad() {
        this.register(this.lay_props_content, _ => csv.BuyProps.values.map(v => ccUtil.get(BuyPropsData, v.id)));

        let dd = ccUtil.get(ShopCapData, this.sel_itemId)
        let price = dd.prices[pdata.abilitys[dd.type]];
        this.lab_upgrade_price.string = price == null ? "MAX" : price;
        this.register(this.img_ability, () => {
            let d = ccUtil.get(ShopCapData, this.sel_itemId)
            return d.prefix + pdata.abilitys[d.type];
        })
        this.register(this.lab_ability_lv, d => {
            let dd = ccUtil.get(ShopCapData, this.sel_itemId)
            return "LV." + pdata.abilitys[dd.type]
        })

        this.register(this.lab_ability_name, d => {
            let dd = ccUtil.get(ShopCapData, this.sel_itemId)
            return dd.name;
        })
        this.register(this.lab_ability_describe, d => {
            let dd = ccUtil.get(ShopCapData, this.sel_itemId)
            let lv = pdata.abilitys[dd.type]
            return cc.js.formatStr(dd.description, dd.vals[lv - 1])
        })
        //this.register(this.Toggle_ability, _ => this.get_ability.bind(this));
        // evt.on("essential_data", this.render, this);
        this.shopItemList = csv.shopCap.values.map(v => ccUtil.get(ShopCapData, v.id))
        evt.on("readyItem.use", this.on_useItem, this);

    }

    onShow() {
        this.lable_coin_rest.string = pdata.gold + "";
        this.render();
        this.ability_refresh();
    }

    ability_refresh() {
        this.Toggle_ability.showlist(this.get_ability.bind(this), this.shopItemList, this.Toggle_ability.node.children[0]);
    }

    on_useItem(item: readyItem) {
        // let data = item.getData() as BuyPropsData;
        // if (item.isUse) {
        //     this.money = 100;
        // }
        let items = this.lay_props_content.getComponentsInChildren(readyItem)
        let type;
        let cost_total = items.reduce((sum, v) => {
            let data = v.getData() as BuyPropsData;
            if (v.isUse && pdata.buffs[data.type] <= 0) {
                type = data.type;
                sum += data.cost;
            }
            return sum;
        }, 0)
        let rest = pdata.gold - cost_total
        if (rest < 0) {
            item.isUse = false;
            item.render();
            Toast.make("无法使用，当前银币不足.")
            return;
        }
        this.lable_coin_rest.string = rest.toString()
    }

    onDestroy() {
        evt.off(this);
    }

    start() {

    }


    private get_ability(node: cc.Node, dat: ShopCapData, idx: number) {
        let icon = ccUtil.find("icon", node, cc.Sprite);
        icon.node.active = false;
        let lv = pdata.abilitys[dat.type];

        let lvLabel = ccUtil.find("lv", node, cc.Label);
        let toggle = node.getComponent(cc.Toggle)

        ccUtil.setDisplay(icon, dat.prefix + lv).then(v => {
            icon.node.active = true;
        })
        lvLabel.string = "LV." + lv;
        toggle.isChecked = this.sel_itemId == dat.id
        toggle['__data'] = dat;
    }



    //获取体力
    private click_get_engergy() {

        vm.show("UIRedHeartShop");
    }
    //获取银币
    private click_get_gold() {

        vm.show("UISilverCoin");
    }
    //获取钻石
    private click_get_diamond() {

        vm.show("UIDiamondShop");
    }

    //标记使用
    // private click_get_buff(e, customEventData) {
    //     let num = Number(e.target.parent.name.split("_")[1]) + 1;
    //     let data = ccUtil.get(BuyPropsData, num);
    //     Platform.watch_video(() => {
    //         pdata.buffs[data.type] += 2;
    //         pdata.save("buffs");
    //         Toast.make("购买成功");
    //         this.render();
    //     })
    // }

    //能力选择
    private click_ability_select(e: cc.Toggle) {

        let data = e['__data']
        this.selectItem(data.id);
    }


    private selectItem(id: number) {
        this.sel_itemId = id;
        this.skillPromote();
        let dd = ccUtil.get(ShopCapData, this.sel_itemId)
        let lv = pdata.abilitys[dd.type];
        ccUtil.setButtonEnabled(this.btn_upgrade, !!dd.prices[lv])
        //this.render();
    }

    //能力升级
    private click_ability_upgrade() {

        let data = ccUtil.get(ShopCapData, this.sel_itemId);
        let lv = pdata.abilitys[data.type];
        let price = data.prices[lv];
        if (price == null) {
            // max level reached
            Toast.make("已到达最高级")
            return;
        }
        if (pdata.gold - price >= 0) {
            pdata.abilitys[data.type] += 1;
            pdata.gold -= price;
            //升级别成功
            ccUtil.setButtonEnabled(this.btn_upgrade, false)
            this.up_fx.play().then(v => {
                ccUtil.setButtonEnabled(this.btn_upgrade, true)
            })
            pdata.save();
            this.lable_coin_rest.string = pdata.gold + ""

        }
        else {
            Toast.make("银币不足");
        }
        this.ability_refresh();
        this.skillPromote();
    }

    private click_start_game() {
        pdata.gameMode = ParkourType.Infinite;
        if (pdata.energy <= 0) {
            Toast.make("红心不足！");
            vm.show("UIRedHeartShop", () => {
                pdata.energy--;
                pdata.save("energy");
                vm.hide("UIRedHeartShop");
                Loading.show(0.5);
                this.scheduleOnce(() => {
                    LoadingScene.goto("Main")
                }, 0.5)
            })
            return
        }
        let items = this.lay_props_content.getComponentsInChildren(readyItem)
        pdata.startBuffs = items.filter(v => {
            return v.isUse
        }).map(v => {
            let data = v.getData() as BuyPropsData;
            return data.type;
        })
        pdata.energy--;
        pdata.save("energy");
        Loading.show(0.5);
        this.scheduleOnce(_ => {
            LoadingScene.goto("Main");
        }, 0.5)

    }

    private skillPromote() {
        let dd = ccUtil.get(ShopCapData, this.sel_itemId)
        ccUtil.setDisplay(this.img_ability, dd.prefix + pdata.abilitys[dd.type]);

        let price = dd.prices[pdata.abilitys[dd.type]];
        let lv = pdata.abilitys[dd.type]

        this.lab_ability_lv.string = "LV." + lv

        this.lab_ability_name.string = dd.name;


        this.lab_ability_describe.string = cc.js.formatStr(dd.description, dd.vals[lv - 1])
        this.lab_upgrade_price.string = price == null ? "MAX" : price;
    }

    private click_closes() {

        vm.hide(this);
    }

    onHidden() {
        pdata.sendToServer("gold,diamond");
    }
    // update (dt) {}
}
