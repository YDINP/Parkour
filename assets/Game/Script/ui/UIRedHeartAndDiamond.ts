import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Platform from "../../../framework/extension/Platform";
import { AdManager, AdType } from "../../../framework/Hi5/AdManager";
import { Loading } from "../../../framework/ui/LoadingManager";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import PlayerInfoDC, { pdata } from "../data/PlayerInfo";
import { Res, ResType } from "../game/model/BaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRedHeartAndDiamond extends cc.Component {

    @property({
        type: cc.Enum(ResType),
        displayName: "획득 자원"
    })
    res = ResType.Diamond

    @property(Number)
    lab_num: number = 0;

    @property(cc.Label)
    lab_num1: cc.Label = null;

    @property(cc.Label)
    lab_amount: cc.Label = null;

    succCallBack: Function;
    cancelCallBack: Function;

    onLoad() { }

    onEnable() {
        // 언어 변경 이벤트 리스너 등록
        cc.director.on('localization:languageChanged', this.updateLabels, this);
    }

    onDisable() {
        // 언어 변경 이벤트 리스너 해제
        cc.director.off('localization:languageChanged', this.updateLabels, this);
    }

    start() {
        this.updateLabels();
    }

    private updateLabels() {
        let name = this.res == ResType.Diamond ? LocalizationManager.getText("@currency.dia") : LocalizationManager.getText("@currency.heart");
        this.lab_num1.string = name + "+" + this.lab_num;
        
        if(this.lab_amount == null) return;

        // 다이아몬드일 경우 남은 충전 횟수 표시 (현재/최대)
        if (this.res == ResType.Diamond) {
            pdata.checkDailyDiamondReset();
            this.lab_amount.string = `${pdata.freeDiamondCount}/3`;
        } else {
            this.lab_amount.string = "";
        }
    }

    onShow(call?, cancelCall?) {
        this.succCallBack = call;
        this.cancelCallBack = cancelCall;
    }

    click_get() {
        // 다이아몬드 광고의 경우 일일 제한 체크
        if (this.res == ResType.Diamond) {
            if (!pdata.canWatchDiamondAd()) {
                Toast.make(LocalizationManager.getText("@text.daily_limit_reached"));
                return;
            }
        }

        const adType = this.res == ResType.Diamond ? AdType.DIAMOND : AdType.HEART;
        AdManager.showRewardAd(adType, (success) => {
            if (success) {
                let str;
                if (this.res == ResType.Diamond) {
                    str = "diamond";
                    pdata.useDiamondAdCount(); // 다이아 광고 횟수 차감
                    this.updateLabels(); // 남은 횟수 UI 갱신
                } else {
                    str = "energy";
                }
                pdata[str] += this.lab_num;
                pdata.save(str);
                this.scheduleOnce(() => {
                    this.succCallBack && this.succCallBack();
                    this.succCallBack = null;
                }, 1);
            }
        });
    }

    private click_closes() {
        this.cancelCallBack && this.cancelCallBack();

        vm.hide(this);
    }

    onHidden() {
        this.succCallBack = null;
        this.cancelCallBack = null;
        pdata.sendToServer("diamond,energy");
    }

    // update (dt) {}
}
