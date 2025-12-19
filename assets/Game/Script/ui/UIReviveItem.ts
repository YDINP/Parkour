import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Platform from "../../../framework/extension/Platform";
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

const { ccclass, property } = cc._decorator;

// 영웅 ID -> 스파인 리소스 경로 매핑
const heroSpinePaths: { [id: string]: string } = {
    "1": "Textures/kakao/heros/01choonsik",
    "2": "Textures/kakao/heros/02Ryan",
    "3": "Textures/kakao/heros/03Apeach",
    "4": "Textures/kakao/heros/04Tube",
    "5": "Textures/kakao/heros/05Muzi",
    "6": "Textures/kakao/heros/06Frodo",
    "7": "Textures/kakao/heros/07Neo",
    "8": "Textures/kakao/heros/08Jay-G",
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
        this.register(this.lab_name, (d: HeroData) => d.name);
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
        Loading.show(1);
        if (d.quality == "A" || d.quality == "B") {
            Platform.watch_video(() => {
                vm.hide("UIRevive");
                root.resume("revive", d.id);
            }, this, null, () => {
                evt.emit("UIRevive.FailVideo");
            })
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
                this.headIcon.skeletonData = skeletonData;
                this.headIcon.setAnimation(0, "Idle", true);
            }
        });
    }
}
