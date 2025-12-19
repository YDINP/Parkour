import Fx from "../../../framework/extension/fxplayer/Fx";
import gUtil from "../../../framework/core/gUtil";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { pdata } from "../data/PlayerInfo";
import ShopCapData from "../game/model/ShopCapData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILiftGift extends mvcView {

    @property(cc.Layout)
    togLayout: cc.Layout = null;

    @property(cc.Label)
    lab_Lv: cc.Label = null;

    @property(cc.Label)
    lab_name: cc.Label = null;

    @property(cc.Label)
    lab_desc: cc.Label = null;

    @property(cc.Label)
    lab_price: cc.Label = null;

    @property(cc.Button)
    btn_growUp: cc.Button = null;

    @property(cc.Sprite)
    propSp: cc.Sprite = null;

    @property(Fx)
    growUpFx: Fx = null;

    @property(cc.Animation)
    onShowAnim: cc.Animation = null;

    private toggleListData: Array<ShopCapData> = null;
    private selectIdx = 1;
    onLoad() {
        this.toggleListData = csv.shopCap.values.map(v => ccUtil.get(ShopCapData, v.id))
    }

    onShow() {
        this.onShowAnim.play("pageRToL");
        this.renderShow();
        this.refreshToggleList();
    }

    refreshToggleList() {
        gUtil.showlistLayout(this.togLayout, this.refreshCallBack.bind(this), this.toggleListData, this.togLayout.node.children[0]);
    }

    refreshCallBack(node: cc.Node, dat: ShopCapData, idx: number) {
        let icon = ccUtil.find("icon", node, cc.Sprite);
        icon.node.active = false;
        let lv = pdata.abilitys[dat.type];

        let lvLabel = ccUtil.find("lv", node, cc.Label);
        let toggle = node.getComponent(cc.Toggle)

        ccUtil.setDisplay(icon, dat.prefix + lv).then(v => {
            icon.node.active = true;
        })
        lvLabel.string = "LV." + lv;
        toggle.isChecked = this.selectIdx == dat.id
        toggle['__data'] = dat;
    }

    renderShow() {
        let d = ccUtil.get(ShopCapData, this.selectIdx);
        ccUtil.setDisplay(this.propSp, d.prefix + pdata.abilitys[d.type]);
        let price = d.prices[pdata.abilitys[d.type]];
        let lv = pdata.abilitys[d.type];
        this.lab_Lv.string = "LV." + lv
        this.lab_name.string = d.name;
        this.lab_desc.string = cc.js.formatStr(d.description, d.vals[lv - 1])
        this.lab_price.string = price == null ? "MAX" : price;
    }

    private selectItem(id: number) {
        this.selectIdx = id;
        this.renderShow();
        let d = ccUtil.get(ShopCapData, this.selectIdx);
        let lv = pdata.abilitys[d.type];
        ccUtil.setButtonEnabled(this.btn_growUp, !!d.prices[lv])
    }

    private click_ability_select(e: cc.Toggle) {
        let data = e['__data']
        this.selectItem(data.id);
    }


    private canClose: boolean = true;
    clicl_close() {
        if (!this.canClose) return;
        this.canClose = false;
        let t = this.onShowAnim.play("pageLToR").duration;
        this.scheduleOnce(() => {
            this.canClose = true;
            vm.hide(this);
        }, t);
    }

    click_growUp() {
        let d = ccUtil.get(ShopCapData, this.selectIdx);
        let lv = pdata.abilitys[d.type];
        let price = d.prices[lv];
        if (price == null) {
            Toast.make(LocalizationManager.getText("@text.highest_level"));
            // Toast.make("已到达最高级")
            return;
        }
        if (pdata.gold - price >= 0) {
            pdata.abilitys[d.type] += 1;
            pdata.gold -= price;
            ccUtil.setButtonEnabled(this.btn_growUp, false)
            this.growUpFx.play().then(v => {
                ccUtil.setButtonEnabled(this.btn_growUp, true)
            })
            pdata.save();
        }
        else {
            Toast.make(LocalizationManager.getText("@text.not_enough_silver2"));
            // Toast.make("银币不足");
        }
        this.refreshToggleList();
        this.renderShow();
    }
}
