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
        // 언어 변경 시 실시간 반영을 위해 캐시된 d.name 대신 직접 로컬라이징 호출
        this.lab_name.string = LocalizationManager.getText(`@shopCap.${d.id}.name`);
        const desc = LocalizationManager.getText(`@shopCap.${d.id}.desc`);
        this.lab_desc.string = cc.js.formatStr(desc, d.vals[lv - 1])
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
            // 이펙트는 재생하되 버튼은 바로 사용 가능하게 유지
            this.growUpFx.play()
            pdata.save();
            // 레벨업 후 필요한 UI만 빠르게 업데이트 (전체 토글 리스트 새로고침 대신)
            this.refreshLabelsOnlyAfterUpgrade();
        }
        else {
            Toast.make(LocalizationManager.getText("@text.not_enough_silver2"));
            // Toast.make("银币不足");
        }
    }

    /**
     * 레벨업 후 필요한 UI만 빠르게 업데이트 (이미지 재로드 없음)
     * - 메인 디스플레이: 레벨, 이름, 설명, 가격 라벨만 업데이트
     * - 토글 리스트: 선택된 항목의 레벨 라벨만 업데이트
     */
    private refreshLabelsOnlyAfterUpgrade() {
        const d = ccUtil.get(ShopCapData, this.selectIdx);
        const lv = pdata.abilitys[d.type];
        const price = d.prices[lv];

        // 메인 디스플레이 텍스트만 업데이트 (이미지는 그대로 - 같은 능력이므로)
        this.lab_Lv.string = "LV." + lv;
        this.lab_name.string = LocalizationManager.getText(`@shopCap.${d.id}.name`);
        const desc = LocalizationManager.getText(`@shopCap.${d.id}.desc`);
        this.lab_desc.string = cc.js.formatStr(desc, d.vals[lv - 1]);
        this.lab_price.string = price == null ? "MAX" : price;

        // 선택된 토글의 레벨 라벨만 업데이트 (아이콘 재로드 없음)
        this.togLayout.node.children.forEach(child => {
            const toggle = child.getComponent(cc.Toggle);
            if (toggle && toggle['__data']) {
                const dat = toggle['__data'] as ShopCapData;
                if (dat.id === this.selectIdx) {
                    const lvLabel = ccUtil.find("lv", child, cc.Label);
                    if (lvLabel) {
                        lvLabel.string = "LV." + lv;
                    }
                }
            }
        });
    }
}
