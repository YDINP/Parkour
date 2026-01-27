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
    }

    initEggPage() {
        this.eggItem_1.initEggPage();
        this.eggItem_2.initEggPage();
    }

    openEggCall(idx) {
        this.isOp = true
        let eggAct: eggItem = this.selectCard.getComponent(eggItem);
        eggAct.openEggCall(idx);
    }

    onHidden() {
        if (this.isOp) {
            pdata.sendToServer("gold,pet,buffs");
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
        Device.playSfx(csv.Audio.sfx_openEgg);
        let idx = e.target.parent == this.eggPage_1 ? 1 : 2;
        this.selectCard = e.target.parent;

        if (idx == 1) {
            this.isOnhatchPet = true;
            AdManager.showRewardAd(AdType.PET_HATCH, (success) => {
                if (success) {
                    this.openEggCall(2);
                } else {
                    this.isOnhatchPet = false;
                }
            });
        } else {
            //优先使用卷
            let pet_hatch_c = pdata.buffs['pet_hatch']
            if (pet_hatch_c > 0) {
                pdata.buffs['pet_hatch'] = pet_hatch_c - 1;
                pdata.save("pdata.buffs")
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
