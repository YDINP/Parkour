import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Platform from "../../../framework/extension/Platform";
import { AdManager, AdType } from "../../../framework/Hi5/AdManager";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { pdata } from "../data/PlayerInfo";
import { root } from "../game/Game";
import HeroData from "../game/model/HeroData";
import InventoryUI from "../view/TopMostInventoryUI";
import UIRevive from "./UIRevive";
import { heroSpinePaths } from "../common/HeroSpinePaths";

const { ccclass, property } = cc._decorator;

/**
 * 영웅별 스파인 스케일 설정
 * 기본값 1.0, 필요에 따라 각 영웅별 크기 조절
 */
const heroScales: { [heroId: string]: number } = {
    "1": 0.6,   // 춘식이
    "2": 0.5,   // 라이언
    "3": 0.6,   // 프로도
    "4": 0.6,   // 어피치
    "5": 0.55,   // 제이지
    "6": 0.45,  // 튜브 (크기가 커서 축소)
    "7": 0.55,   // 무지
    "8": 0.6,   // 네오
};

@ccclass
export default class UIReviveItem extends mvcView {

    @property(cc.Label)
    lab_name: cc.Label = null;

    @property(cc.Label)
    lab_subNum: cc.Label = null;

    @property(sp.Skeleton)
    headIcon: sp.Skeleton = null;

    @property(cc.Sprite)
    typeIcon: cc.Sprite = null;

    @property(cc.Node)
    desNode: cc.Node = null;

    @property(UIRevive)
    parentScript: UIRevive = null;

    private iconPath = {
        Video: "Textures/ui/common/ui_icon_video",//修改
        gem: "Textures/kakao/01lobby/ui_img_lobby_topmenu_dia"
    }
    onLoad() {
        this.onClick(this.node, this.click_revive);
        this.register(this.lab_name, (d: HeroData) => LocalizationManager.getText(`@hero.${d.id}.name`));
        this.register(this.lab_subNum, (d: HeroData) => {
            if (d.quality == "A" || d.quality == "B") {
                return LocalizationManager.getText("@text.watch_video");
                // return "看视频";
            } else {
                return "X 3";
            }
        });
        this.register(this.typeIcon, (d: HeroData) => {
            if (d.quality == "A" || d.quality == "B") {
                return this.iconPath.Video;
            } else {
                return this.iconPath.gem;
            }
        });
    }

    click_revive() {

        this.parentScript.unschedule(this.parentScript.countDown);
        this.enterGame()
    }

    enterGame() {
        let d = this.getData() as HeroData;
        if (d.quality == "A" || d.quality == "B") {
            AdManager.showRewardAd(AdType.HERO_SUMMON, (success) => {
                if (success) {
                    vm.hide("UIRevive");
                    root.resume("revive", d.id);
                } else {
                    evt.emit("UIRevive.FailVideo");
                }
            });
        } else {
            if (pdata.diamond < 3) {
                Toast.make(LocalizationManager.getText("@text.diamond_not_enough"));
                // Toast.make("钻石不足！");
                Loading.show(0.5);
                this.scheduleOnce(() => {
                    vm.show("UIDiamondShop");
                }, 0.5)
                return;
            } else {
                pdata.diamond -= 3;
                pdata.save("diamond");
                vm.hide("UIRevive");
                root.resume("revive", d.id);
            }
        }
    }
    onHidden() {
        pdata.sendToServer("diamond,energy");
    }

    render(d?, d2?) {
        super.render(d, d2);
        const data = this.getData() as HeroData;
        if (data) {
            this.updateHeroSpine(data.id);
        }
    }

    /**
     * 영웅 ID에 맞는 스파인 데이터 로드 및 적용
     */
    private updateHeroSpine(heroId: string) {
        const spinePath = heroSpinePaths[heroId];

        if (!spinePath) {
            console.warn(`Hero spine path not found for hero ID: ${heroId}`);
            return;
        }

        cc.loader.loadRes(spinePath, sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
            if (err) {
                console.error(`Failed to load hero spine: ${spinePath}`, err);
                return;
            }

            if (this.headIcon && skeletonData) {
                
                // 영웅별 스케일 적용
                const scale = heroScales[heroId] || 1.0;
                this.headIcon.node.scale = scale;

                this.headIcon.skeletonData = skeletonData;
                this.headIcon.setAnimation(0, "Idle", true);
            }
        });
    }
}
