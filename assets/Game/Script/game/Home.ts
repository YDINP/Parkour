import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import gUtil from "../../../framework/core/gUtil";
import BuffSystem from "../../../framework/extension/buffs/BuffSystem";
import FxPlayer from "../../../framework/extension/fxplayer/FxPlayer";
import { ITileObjectFactory } from "../../../framework/extension/tilemap/TmxLayerWalker";
import { UInfo } from "../../../framework/extension/weak_net_game/UInfo";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { ParkourType, pdata } from "../data/PlayerInfo";
import InventoryUI from "../view/TopMostInventoryUI";
import { guider } from "./Guide";
import PlayerData from "./model/PlayerData";
import { heroSpinePaths } from "../common/HeroSpinePaths";
import GameCheats from "../common/GameCheats";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Home extends mvcView {

    //ui_engergy
    @property(cc.Label)
    private lab_engergy: cc.Label = null;

    //ui_gold
    @property(cc.Label)
    private lab_gold: cc.Label = null;

    //ui_diamond
    @property(cc.Label)
    private lab_diamond: cc.Label = null;

    //ui_exe
    @property(cc.Label)
    private lab_exe: cc.Label = null;
    @property(cc.Label)
    private lab_LV: cc.Label = null;

    @property(cc.Node)
    drawBoxPoint: cc.Node = null;


    @property(cc.Node)
    node_loc: cc.Node = null;

    @property(sp.Skeleton)
    heroModel: sp.Skeleton = null;

    // 펫 모델 컨테이너 노드 (펫 prefab을 자식으로 추가)
    @property(cc.Node)
    petModel: cc.Node = null;

    @property(cc.Node)
    node_btn_pet: cc.Node = null;

    onLoad() {
        this.register(this.lab_engergy, _ => pdata.energy)
        this.register(this.lab_gold, _ => pdata.gold);
        this.register(this.lab_diamond, _ => pdata.diamond);
        this.register(this.lab_exe, _ => (pdata.expPercent * 100).toFixed() + "%");
        this.register(this.lab_LV, _ => pdata.playerlv);
        //等级大于3级解锁无尽模式
        this.onVisible(this.node_loc, _ => pdata.playerlv < csv.Config.Unlock_Endless)
        //
        this.onVisible(this.drawBoxPoint, () => {
            return UInfo.drawResidueTime > 0;
        })
        this.updateHeroSpine();
        evt.on("pdata.selHero", this.updateHeroSpine, this);
        this.onVisible(this.petModel, () => pdata.selPet != "0");
        this.updatePetPrefab();
        evt.on("pdata.selPet", this.updatePetPrefab, this);
        this.onClick(this.node_btn_pet, this.click_pet)
        // 第二关后 ，宠物引导 完后
        this.onVisible(this.node_btn_pet, () => pdata.level > 2)

        // console.log('bgm', csv.Audio.homeBgm);
        Device.playBGM(csv.Audio.homeBgm);
        // evt.on("essential_data", this.render, this);
        evt.on("View.onHidden", this.render, this);
        evt.on("pdata.diamond", this.onGetDiamond, this);
        evt.on("pdata.gold", this.onGetGold, this);
        evt.on("pdata.energy", this.onGetHeart, this);
        evt.on("pdata.playerlv", this.onLvExpChanged, this)
        evt.on("pdata.exp", this.onLvExpChanged, this)

    }

    onLoadFinished(params) {
        if (params) {
            if (params.msg) {
                Toast.make(params.msg)
            }
        }
    }

    onLvExpChanged() {
        let canUp = pdata.upPlayer();
        if (canUp) {
            this.lab_LV.string = pdata.playerlv.toString()
        }
        this.lab_exe.string = (pdata.exp * 100).toFixed() + "%";
    }

    onGetDiamond(n) {
        this.lab_diamond.string = n
    }

    onGetGold(n) {
        this.lab_gold.string = n
    }

    onGetHeart(n) {
        this.lab_engergy.string = n;
    }


    start() {
        this.render();
        guider.enterHome();
        // 치트 시스템 초기화
        GameCheats.init();
        if (!guider.isInGuide) {
            if (gUtil.isNextDay(pdata.signInTime)) {
                if (pdata.signIn.date >= 7) {
                    pdata.signIn = { date: 1, isSignIn: false };
                }
                else if (pdata.signIn.isSignIn == true) {
                    pdata.signIn = { date: pdata.signIn.date + 1, isSignIn: false };
                }
                vm.show("UI_signIn");
            }
        }
        evt.emit("Home.start")
    }

    onDestroy() {
        evt.off(this);
    }

    /**
     * 선택된 영웅에 맞는 스파인 데이터 로드 및 적용
     */
    private updateHeroSpine() {
        const heroId = pdata.selHero;
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

            if (this.heroModel && skeletonData) {
                this.heroModel.skeletonData = skeletonData;
                this.heroModel.setAnimation(0, "Idle", true);
            }
        });
    }

    /**
     * 선택된 펫에 맞는 prefab 로드 및 애니메이션 재생
     */
    private updatePetPrefab() {
        if (!this.petModel) return;

        // 기존 자식 노드 제거
        this.petModel.removeAllChildren();

        const petId = pdata.selPet;
        if (petId === "0") return;

        const petData = pdata.selPetData;
        if (!petData || !petData.prefabPath) {
            console.warn(`Pet prefab path not found for pet ID: ${petId}`);
            return;
        }

        cc.loader.loadRes(petData.prefabPath, cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err) {
                console.error(`Failed to load pet prefab: ${petData.prefabPath}`, err);
                return;
            }

            if (this.petModel && prefab) {
                const petNode = cc.instantiate(prefab);
                this.petModel.addChild(petNode);
                petNode.setPosition(0, 0);

                // Follow 컴포넌트 비활성화 (로비에서는 따라다니지 않음)
                const pet = petNode.getComponent('Pet');
                if (pet && pet.follower) {
                    pet.follower.enabled = false;
                }

                // DragonBones 애니메이션 재생
                const armature = petNode.getComponent(dragonBones.ArmatureDisplay);
                if (armature) {
                    armature.playAnimation("run", 0);  // 0 = loop
                }
            }
        });
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

    //角色
    private click_role() {

        vm.show("UIHeroShop");
    }

    //宠物
    private click_pet() {

        vm.show("UIPet");
    }

    //排行
    private click_ranking() {

        vm.show("UIRank");
    }

    //礼物
    private click_gift() {

        vm.show("UIDrawBox");
    }

    //设置
    private click_setting() {

        vm.show("UISetting");
    }

    //闯关模式
    private click_breakthrough(e) {

        if (pdata.energy <= 0) {
            Toast.make(LocalizationManager.getText("@notEnoughHeart"));
            // Toast.make("爱心不足");
            vm.show("UIRedHeartShop", () => {
                InventoryUI.instance.setTarget(e.target)
                vm.hide("UIRedHeartShop");
                Loading.show(0.5);
                this.scheduleOnce(() => {
                    vm.show("UILevels");
                }, 0.5)
            })
            return;
        }
        pdata.gameMode = ParkourType.Normal;
        vm.show("UILevels")
    }

    //无尽模式
    private click_parkour(e) {

        if (pdata.playerlv < csv.Config.Unlock_Endless) {
            // Toast.make("达到等级 " + csv.Config.Unlock_Endless + "后解锁！")
            Toast.make(LocalizationManager.getTextWithArgs("@unlockEndlessLevel", csv.Config.Unlock_Endless))
            return
        }
        if (pdata.energy <= 0) {
            Toast.make(LocalizationManager.getText("@notEnoughHeart"));
            // Toast.make("爱心不足");
            vm.show("UIRedHeartShop", () => {
                InventoryUI.instance.setTarget(e.target)
                vm.hide("UIRedHeartShop");
                Loading.show(0.5);
                this.scheduleOnce(() => {
                    vm.show("UIReady");
                }, 0.5)
            })
            return;
        }
        pdata.gameMode = ParkourType.Infinite;
        vm.show("UIReady")
    }

    private test(e) {
        let count = 0;
        let d = ccUtil.get(PlayerData, count + 1);
        let exp = 5000
        let next_require_exp = d.require_exp;
        let isSucc = false;

        console.log("경험치 :", exp, next_require_exp)
        while (exp >= next_require_exp) {
            console.log("경험치1 :", exp, next_require_exp)
            exp = exp - next_require_exp;
            d = ccUtil.get(PlayerData, count + 1);
            next_require_exp = d.require_exp;
            count++
            isSucc = true;
        }
        console.log(isSucc)
        console.log(count)
        console.log(exp)
    }
}
