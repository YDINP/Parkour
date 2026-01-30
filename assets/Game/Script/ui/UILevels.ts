import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import { EaseType } from "../../../framework/extension/qanim/EaseType";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import LoadingScene from "../common/LoadingScene";
import { pdata } from "../data/PlayerInfo";
import UILevelsPage from "./UILevelsPage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILevels extends mvcView {

    @property(cc.Layout)
    levelsLayout: cc.Layout = null;

    @property(cc.Node)
    touchNode: cc.Node = null;

    @property(cc.Layout)
    indicator: cc.Layout = null;

    @property(cc.Node)
    btn_start: cc.Node = null;

    private levelsData: Array<Array<number>> = null;

    static instance: UILevels;

    private pageIdx: number = 0;
    onLoad() {
        UILevels.instance = this;
        this.register(this.levelsLayout, () => this.levelsData);
        this.register(this.indicator, () => this.levelsData, this.initIndicator.bind(this));
        this.onClick(this.btn_start, this.enterGame);

        this.touchNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.updateLvData();
    }

    start() {
        this.render();
    }

    onShow() {
        evt.emit("UILevel.render");
        this.setCurrentPage();
        this.updateStartButton();
    }

    /**
     * 최대 레벨 초과 시 시작 버튼 숨김
     */
    updateStartButton() {
        let maxLevel = csv.Level.values.length - 1;
        let isMaxLevelCleared = pdata.level > maxLevel;

        if (this.btn_start) {
            this.btn_start.active = !isMaxLevelCleared;
        }
    }

    updateLvData() {
        let max = csv.Level.values.length - 1;
        let arr1 = [];
        let arr2 = [];
        for (let i = 1; i <= max; ++i) {
            arr2.push(i);
            if (arr2.length >= 10) {
                arr1.push(arr2);
                arr2 = [];
            }
            if (i == max) {
                if (arr2.length > 0) {
                    arr1.push(arr2);
                    arr2 = [];
                }
            }
        }

        this.levelsData = arr1;
    }

    click_close() {
        vm.hide(this);
    }

    initIndicator(node, data, idx) {
        let on = node.getChildByName("on");
        let off = node.getChildByName("off");

        on.active = idx == this.pageIdx;
        off.active = !on.active;
    }

    renderIndicator() {
        let indicators = this.indicator.node.children
        for (let i = 0; i < indicators.length; ++i) {
            let on = indicators[i].getChildByName("on");
            let off = indicators[i].getChildByName("off");
            on.active = i - 1 == this.pageIdx;
            off.active = !on.active;
        }
    }

    setCurrentPage() {
        let maxLevel = csv.Level.values.length - 1;
        let level = Math.min(pdata.level, maxLevel);  // 최대 레벨 초과 방지
        let pageIdx = Math.floor((level - 1) / 10);
        let maxPageIdx = Math.floor((maxLevel - 1) / 10);
        pageIdx = Math.min(pageIdx, maxPageIdx);  // 페이지 인덱스 범위 제한
        this.scheduleOnce(() => {
            this.setPageByIdx(pageIdx);
        }, 0);
    }

    pageMoveLeft() {
        if (this.isInMove) return;
        this.pageMove(1)
    }

    pageMoveRight() {
        if (this.isInMove) return;
        this.pageMove(-1)
    }

    setPageByIdx(idx: number) {
        let page = this.levelsLayout.node;
        let vw = page.children[0].width;
        page.x = -vw * idx;
        this.countNowPageIdx();
    }

    pageMove(dir, subX?) {
        let page = this.levelsLayout.node;
        let w = page.width;
        let vw = page.children[0].width;
        let max = (page.childrenCount - 2) * vw;
        // let nowPage = Math.floor(Math.abs(page.x / vw));
        let nowPage = this.pageIdx;
        let sub = Math.abs(page.x % vw);
        let to = 0;
        if (!subX) {
            to = -1 * (nowPage - dir) * vw;
            if (to < -max) {
                to = 0;
            }
            if (to > 0) {
                to = -max;
            }
        } else {
            if (Math.abs(subX) <= 200) {
                to = this.contentStartX;
            } else {
                if (dir < 0) {
                    to = dir * (nowPage - dir) * vw;
                    if (to < -max) {
                        to = 0;
                    }
                } else {
                    if (sub >= vw / 2) {
                        nowPage += 1
                    }
                    to = -(nowPage - 1) * vw;
                    if (to > 0 && nowPage == 0) {
                        to = -max;
                    }
                }
            }
        }


        this.isInMove = true;
        cc.tween(page)
            .to(0.3, { x: to }, { easing: EaseType[EaseType.sineInOut] })
            .call(() => {
                this.isInMove = false;
                this.countNowPageIdx();
            })
            .start();

    }

    countNowPageIdx() {
        let page = this.levelsLayout.node;
        let vw = page.children[0].width;
        this.pageIdx = Math.floor(Math.abs(page.x / vw));
        this.renderIndicator();
    }

    private touchStartX = 0;
    private contentStartX = 0;
    private isInMove: boolean = false;
    public isInTouch: boolean = false;
    onTouchStart(evt: cc.Event.EventTouch) {
        if (this.isInMove) return;
        let page = this.levelsLayout.node;
        this.touchStartX = evt.getLocationX();
        this.contentStartX = page.x;
    }

    onTouchMove(evt: cc.Event.EventTouch) {
        if (this.isInMove) return;
        let touchX = evt.getLocationX();
        let sub = touchX - this.touchStartX;
        if (Math.abs(sub) > 5) {
            this.isInTouch = true;
            this.levelsLayout.node.x = this.contentStartX + sub;
        }
    }

    onTouchCancel(evt: cc.Event.EventTouch) {
        this.scheduleOnce(() => {
            this.isInTouch = false;
        }, 0)
        if (this.isInMove) return;
        let touchX = evt.getLocationX();
        let sub = touchX - this.touchStartX;
        let dir = sub > 0 ? 1 : -1;
        if (Math.abs(sub) > 5) {
            this.pageMove(dir, sub)
        }
    }

    onTouchEnd(evt: cc.Event.EventTouch) {
        this.scheduleOnce(() => {
            this.isInTouch = false;
        }, 0);
        if (this.isInMove) return;
        let touchX = evt.getLocationX();
        let sub = touchX - this.touchStartX;
        let dir = sub > 0 ? 1 : -1;
        if (Math.abs(sub) > 5) {
            this.pageMove(dir, sub);
        }
    }

    enterGame() {
        // 최대 레벨 초과 시 게임 시작 방지
        let maxLevel = csv.Level.values.length - 1;
        if (pdata.level > maxLevel) {
            Toast.make(LocalizationManager.getText("@text.waitForMoreLevels"));
            return;
        }

        if (pdata.energy <= 0) {
            // Toast 제거 - 팝업이 이미 충분한 정보 제공
            vm.show("UIRedHeartShop", () => {
                pdata.playinglv = pdata.level;
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
        pdata.playinglv = pdata.level == 0 ? 1 : pdata.level;
        pdata.energy--;
        pdata.save("energy");
        Loading.show(0.5);
        this.scheduleOnce(() => {
            LoadingScene.goto("Main")
        }, 0.5)
    }

    click_openGift() {
        vm.show("UILIftGift");
    }
}
