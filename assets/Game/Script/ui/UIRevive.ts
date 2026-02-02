import { evt } from "../../../framework/core/event";
import Platform from "../../../framework/extension/Platform";
import { AdManager, AdType } from "../../../framework/Hi5/AdManager";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import ccUtil from "../../../framework/utils/ccUtil";
import { ParkourType, pdata } from "../data/PlayerInfo";
import { root } from "../game/Game";
import HeroData from "../game/model/HeroData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRevive extends mvcView {
    @property(cc.Node)
    btn_close: cc.Node = null;

    @property(cc.Layout)
    listLayout: cc.Layout = null;

    @property(cc.Label)
    lab_count: cc.Label = null;

    private allHeroData: Array<HeroData> = [];

    private listData: Array<HeroData> = [];

    private countDownTime: number = 10;

    private isClickAgain: boolean = false;

    @property(cc.Node)
    btn_revive: cc.Node = null;

    private iconPath = {
        Video: "Textures/ui/common/ui_icon_video",//修改
        Gold: "Textures/kakao/01lobby/ui_img_lobby_topmenu_coin"
    }
    onLoad() {
        csv.HeroInfo.values.map((v, idx) => {
            this.allHeroData.push(ccUtil.get(HeroData, idx + 1));
        })
        this.register(this.listLayout, () => this.listData);
        this.onClick(this.btn_close, this.click_close)
        this.onClick(this.btn_revive, this.click_revive);
        this.schedule(this.countDown, 1);
        evt.on("UIRevive.FailVideo", this.recovery_btn_revive, this);
    }

    onShow() {
        this.isClickAgain = false;
        this.countDownTime = 9;
        this.lab_count.string = this.countDownTime.toString();
        this.updateListData();
        this.btnDelay();
        pdata.reviveCount++;
        this.render();
    }

    onHidden() {
        this.unschedule(this.countDown);
    }


    btnDelay() {
        this.btn_close.active = false;
        this.unschedule(this.showClose)
        this.scheduleOnce(this.showClose, 2)
    }

    showClose() {
        this.btn_close.active = true;
    }

    click_revive() {
        ccUtil.setButtonEnabled(this.btn_revive, false);
        AdManager.showRewardAd(AdType.REVIVE, (success) => {
            if (success) {
                this.onWatchCallback();
            } else {
                this.recovery_btn_revive();
            }
        });
    }

    recovery_btn_revive() {
        // 기존 스케줄러 제거 후 다시 등록 (중복 등록 방지)
        this.unschedule(this.countDown);
        this.schedule(this.countDown, 1);
        ccUtil.setButtonEnabled(this.btn_revive, true);
    }

    onWatchCallback() {
        root.resume("revive");
        // ccUtil.setButtonEnabled(this.btn_revive, true);
        vm.hide(this);
    }


    countDown() {
        if (this.isClickAgain) return;
        if (this.countDownTime <= 0) {
            if (!pdata.isGameWin && pdata.gameMode == ParkourType.Normal) {
                //普通败
                vm.show("UIFail")
            } else {
                //普通 胜，无尽胜/败
                vm.show("UIEndPage")
            }
            this.unschedule(this.countDown);
            vm.hide(this)
            return;
        }
        this.countDownTime--;
        this.lab_count.string = this.countDownTime.toString();
    }

    updateListData() {
        this.listData.splice(0)
        let arrB = [];
        let arrC = [];
        let arrD = [];
        this.allHeroData.forEach(v => {
            v.quality == "B" && arrB.push(v);
            v.quality == "C" && arrC.push(v);
            v.quality == "D" && arrD.push(v);
        });
        let ranB = Math.floor(Math.random() * arrB.length);
        let ranC = Math.floor(Math.random() * arrC.length);
        let ranD = Math.floor(Math.random() * arrD.length);
        this.listData.push(arrD[ranD]);
        this.listData.push(arrC[ranC]);
        this.listData.push(arrB[ranB]);
    }

    click_again(e) {
        this.unschedule(this.countDown);
        this.isClickAgain = true;
    }

    click_close() {
        this.unschedule(this.countDown);
        vm.hide(this);
        if (!pdata.isGameWin && pdata.gameMode == ParkourType.Normal) {
            //普通败
            vm.show("UIFail")
        } else {
            //普通 胜，无尽胜/败
            vm.show("UIEndPage")
        }
    }

    onDestroy() {
        evt.off(this);
    }
}
