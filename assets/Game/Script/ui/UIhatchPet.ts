import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Platform from "../../../framework/extension/Platform";
import { AdManager, AdType } from "../../../framework/Hi5/AdManager";
import Switcher from "../../../framework/ui/controller/Switcher";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { pdata } from "../data/PlayerInfo";
import eggAction from "../game/effects/eggAction";
import PetData from "../game/model/PetData";
import eggItem from "./eggItem";
import { ImgConfirmData } from "./UIImgComfirm";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIhatchPet extends mvcView {

    @property(cc.Node)
    btn_close: cc.Node = null;

    @property(cc.Node)
    btn_petBook: cc.Node = null;

    @property(cc.Node)
    eggPage_1: cc.Node = null;

    @property(cc.Node)
    eggPage_2: cc.Node = null;

    @property(eggItem)
    eggItem_1: eggItem = null;

    @property(eggItem)
    eggItem_2: eggItem = null;

    @property(cc.Node)
    btn_pet: cc.Node = null;

    @property(Switcher)
    switch_res: Switcher = null;
    
    @property(cc.Label)
    lab_coin: cc.Label = null;


    private openEggNeedGold = 2000;

    private selectCard: cc.Node = null;

    private isOnhatchPet: boolean = false;
    onLoad() {
        this.onClick(this.btn_close, this.click_close);
        this.onClick(this.btn_petBook, this.click_petBook);
        this.register(this.switch_res, () => {
            let c = pdata.buffs['pet_hatch']
            if (c <= 0) {
                // 显示 使用金币 资源 
                return 0;
            } else {
                //显示   使用卷 资源 
                return 1;
            }
        })
        evt.on("UIPet.refresh", () => {
            this.isOnhatchPet = false;

        }, this)
        this.onClick(this.btn_pet, this.click_pet)
        
        // 다이아 표시 등록
        if (this.lab_coin) {
            this.register(this.lab_coin, _ => pdata.gold);
        }
    }

    isOp = false;

    click_pet() {
        if (this.isOnhatchPet) {
            Toast.make(LocalizationManager.getText("@text.pet_hatching"));
            // Toast.make("宠物正在努力破壳，请稍后...");
            return
        }
        vm.hide(this);
        vm.show("UIPet")
    }

    onShow() {
        this.isOp = false;
        this.render();
        this.initEggPage();
        evt.on("pdata.gold", this.onGetCoin, this);
    }
    onHide() {
        evt.off("pdata.gold", this.onGetCoin, this);
    }

    // 다이아 업데이트 콜백
    onGetCoin(n) {
        if (this.lab_coin) {
            this.lab_coin.string = n;
        }
    }
    onclickOpenCoinShop(){
        vm.show("UISilverCoin");
    }

    initEggPage() {
        this.eggItem_1.initEggPage();
        this.eggItem_2.initEggPage();
    }

    private updateAdCountLabel() {
        // eggItem_1의 광고 횟수 표시만 업데이트 (initEggPage는 egg 상태 리셋됨)
        if (this.eggItem_1) {
            this.eggItem_1.updateAdCountDisplay();
        }
    }

    openEggCall(idx) {
        this.isOp = true
        let eggAct: eggItem = this.selectCard.getComponent(eggItem);
        eggAct.openEggCall(idx);
    }

    onHidden() {
        if (this.isOp) {
            pdata.sendToServer("gold,pets,buffs");
            this.isOp = false
        }
    }

    click_close() {
        if (this.isOnhatchPet) {
            Toast.make(LocalizationManager.getText("@text.pet_hatching"));
            // Toast.make("宠物正在努力破壳，请稍后...");
            return
        }
        vm.hide(this);
    }

    click_petBook() {

        vm.show("UIPatBook");
    }

    click_hatch(e) {

        if (this.isOnhatchPet) {
            Toast.make(LocalizationManager.getText("@text.pet_hatching"));
            // Toast.make("宠物正在努力破壳，请稍后...");
            return
        }
        // 클릭된 노드부터 상위로 탐색하여 eggPage_1 또는 eggPage_2를 찾음
        let targetNode = e.target;
        let isEggPage1 = false;

        while (targetNode) {
            if (targetNode === this.eggPage_1) {
                isEggPage1 = true;
                break;
            }
            if (targetNode === this.eggPage_2) {
                break;
            }
            targetNode = targetNode.parent;
        }

        let idx = isEggPage1 ? 1 : 2;
        this.selectCard = isEggPage1 ? this.eggPage_1 : this.eggPage_2;

        if (idx == 1) {
            // 광고 횟수 체크
            if (!pdata.canWatchPetHatchAd()) {
                Toast.make(LocalizationManager.getText("@text.daily_limit_reached"));
                return;
            }
            this.isOnhatchPet = true;
            AdManager.showRewardAd(AdType.PET_HATCH, (success) => {
                if (success) {
                    // 광고 완료 후에만 사운드 재생
                    Device.playSfx(csv.Audio.sfx_openEgg);
                    pdata.usePetHatchAdCount();
                    this.openEggCall(2);
                    // 횟수 표시 업데이트
                    this.updateAdCountLabel();
                } else {
                    this.isOnhatchPet = false;
                }
            });
        } else {
            // 유료 뽑기는 바로 사운드 재생
            Device.playSfx(csv.Audio.sfx_openEgg);
            //优先使用卷
            let pet_hatch_c = pdata.buffs['pet_hatch']
            if (pet_hatch_c > 0) {
                pdata.buffs['pet_hatch'] = pet_hatch_c - 1;
                pdata.save("buffs")
                this.openEggCall(1);
                this.isOnhatchPet = true;
                this.render();
            } else {
                if (pdata.gold >= this.openEggNeedGold) {
                    this.isOnhatchPet = true;
                    pdata.gold -= this.openEggNeedGold;
                    pdata.save("gold");
                    this.openEggCall(1);
                    this.render();
                } else {
                    Toast.make(LocalizationManager.getText("@text.not_enough_silver"));
                    // Toast.make("银币不足！")
                }
            }
        }

    }


    onDestroy() {
        evt.off(this);
    }
}
