import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import gUtil from "../../../framework/core/gUtil";
import Fx from "../../../framework/extension/fxplayer/Fx";
import FxPlayer from "../../../framework/extension/fxplayer/FxPlayer";
import Platform from "../../../framework/extension/Platform";
import LabelAnim from "../../../framework/extension/qanim/LabelAnim";
import ProgressBarAnim from "../../../framework/extension/qanim/ProgressBarAnim";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import LoadingScene from "../common/LoadingScene";
import { ParkourType, pdata } from "../data/PlayerInfo";
import { root } from "../game/Game";
import Guide, { guider } from "../game/Guide";
import { Res, ResType } from "../game/model/BaseData";
import LevelData from "../game/model/LevelData";
import PlayerData from "../game/model/PlayerData";
import QualityLevelData from "../game/model/QualityLevelData";
import InventoryUI from "../view/TopMostInventoryUI";
import { heroSpinePaths } from "../common/HeroSpinePaths";

const { ccclass, property } = cc._decorator;

interface LootItemData {
    type: ResType,
    id?: number;
    num: number;
    is_lvup_reward?: boolean;
}

@ccclass
export default class UIEndPage extends mvcView {
    @property(cc.Node)
    newRecord: cc.Node = null;

    @property(cc.Node)
    btn_triple: cc.Node = null;

    @property(cc.Node)
    btn_next: cc.Node = null;

    @property(cc.Label)
    lab_gold: cc.Label = null;

    @property(cc.Label)
    lab_exp: cc.Label = null;


    @property(cc.Label)
    lab_score: cc.Label = null;

    @property(cc.ProgressBar)
    bar_exp: cc.ProgressBar = null;

    @property(cc.Layout)
    layout_lootlist: cc.Layout = null;

    @property(cc.Node)
    node_close: cc.Node = null;

    @property(cc.Node)
    node_btn_boxtip: cc.Node = null;

    @property(sp.Skeleton)
    roleModel: sp.Skeleton = null;

    @property(cc.Label)
    lab_level: cc.Label = null;

    @property(cc.Node)
    endlessHint: cc.Node = null;

    private isNewRecord: boolean = false;

    private goldNum: number = 100;

    private extraGold: number = 100;

    private expNum: number = 100;

    @property(cc.Node)
    node_success: cc.Node = null;

    anim: cc.Animation = null;

    tmp: cc.Node = null;

    static instance: UIEndPage


    onLoad() {
        this.anim = this.getComponentInChildren(cc.Animation)
        this.onVisible(this.newRecord, () => this.isNewRecord);
        this.register(this.lab_gold, () => this.goldNum);
        this.onClick(this.btn_triple, this.click_triple);
        this.onClick(this.btn_next, this.click_next);
        this.onClick(this.node_btn_boxtip, this.click_boxtip);
        this.onClick(this.node_close, this.click_close);
        this.updateHeroSpine(pdata.selHero);
        this.tmp = this.layout_lootlist.node.children[0]
        this.tmp.active = false;
        UIEndPage.instance = this;
    }

    start() {
        this.render();
    }

    onShow() {
        Device.playSfx(csv.Audio.sfx_gameWin);
        if (pdata.gameMode == ParkourType.Normal) {
            if (pdata.isGameWin) {
                this.node_success.active = true;
            }
        }
        this.lab_level.string = "" + pdata.playerlv;
        this.anim.play()
        this.cleanup();
        this.cutBtnStyle(false);
        this.scheduleOnce(this.showResult, 1)

    }

    cutBtnStyle(b: boolean) {
        this.btn_next.active = b;
        this.btn_triple.active = b;
        this.node_close.active = b;
    }

    onUpgradePlayLv() {
        this.lab_level.string = "" + pdata.playerlv;
    }

    onHidden() {
        //todo  
    }

    items_tobeAdded: LootItemData[] = []

    cleanup() {
        let children = this.layout_lootlist.node.children
        children.filter(v => v != this.tmp).forEach(v => v.destroy())
        this.lab_exp.string = (pdata.expPercent * 100).toFixed(2) + "%"
        // this.bar_exp.progress = pdata.expPercent;
    }

    click_boxtip() {
        Toast.make(LocalizationManager.getText("@text.upgrade_extra_reward"));
        // Toast.make("每次升级将会额外获得奖励!")
    }

    async addLootItems(items: LootItemData[], interval = 0.1) {
        let tmp = this.layout_lootlist.node.children[0]
        for (let i = 0; i < items.length; i++) {
            let itemd = items[i]
            //仅支持金币和钻石2种资源 ，
            if (ResType[itemd.type] == null) return console.warn("Unknown resource type");
            if (itemd.num == 0) return;
            this.items_tobeAdded.push(itemd);
            let loot = LocalizationManager.instantiatePrefab(tmp);
            loot.active = true;
            let fx = loot.getComponentInChildren(FxPlayer);
            let icon = ccUtil.find("icon", loot, cc.Sprite)
            let label = ccUtil.find("label", loot, cc.Label)
            let rewardTip = cc.find("blinkText", loot)
            rewardTip.active = itemd.is_lvup_reward;
            ccUtil.setDisplay(icon, Res.getIconPath(itemd.type, itemd.id)).then(v => {
                ccUtil.clampSize(icon.node, 80, 80)
            })
            let n = Math.floor(itemd.num)
            label.string = "+" + n
            loot['data'] = itemd;
            loot.parent = this.layout_lootlist.node;
            fx.play();
            await evt.sleepSafe(this, interval)
        }
    }

    async showResult() {
        let lv_before = pdata.playerlv;
        let data = ccUtil.get(PlayerData, lv_before)

        this.items_tobeAdded.splice(0)
        let isThisLevelPlayed = pdata.getMaxScore(pdata.playinglv) > 0;
        let multi = 1;
        if (isThisLevelPlayed) {
            multi = 0.5;
        }
        let score = pdata.tmpScore;
        let labelAnim = gUtil.getOrAddComponent(this.lab_score, LabelAnim)
        await labelAnim.play(0.3, 0, score)
        this.isNewRecord = pdata.breakNewRecord();
        this.render();

        // get items ,游戏中获得+ 等级分数加成
        await this.addLootItems([{ type: ResType.Gold, num: pdata.tmpGold * multi }, { type: ResType.Gold, num: score * 0.01 * multi }]);

        if (this.isNewRecord && csv.Config.NewRecordReward_Diamond > 0) {
            //如果是新记录则给一定 数量 的钻石 ，由Config.csv配置 
            await this.addLootItems([{ type: ResType.Diamond, num: csv.Config.NewRecordReward_Diamond }]);
        }

        //get exp  formular 
        let qualityData = ccUtil.get(QualityLevelData, pdata.selHeroData.quality)
        let expGain = Math.floor(0.1 * pdata.distance + pdata.playerlv * qualityData.values[pdata.selHeroLevel - 1])
        if (pdata.gameMode == ParkourType.Normal) {
            //关卡模式 额外经验值 算法
            let expInNormalMode = (200 + pdata.playinglv * 100)
            expGain += expInNormalMode;
        }
        expGain *= multi;
        // get exp current percentage 
        let expRatio = pdata.expPercent;
        let addExpRatio = expGain / pdata.reuquireExp;
        // let barAnim = gUtil.getOrAddComponent(this.bar_exp, ProgressBarAnim)
        let labelExpAnim = gUtil.getOrAddComponent(this.lab_exp, LabelAnim)
        labelExpAnim.templateStr = "%s%"
        let nextExp = Math.min(1, expRatio + addExpRatio)
        Device.playSfx(csv.Audio.sfx_addgemOrGold);
        labelExpAnim.play(0.3, expRatio * 100, nextExp * 100)
        // await barAnim.play(0.3, expRatio, nextExp)
        pdata.exp += expGain;
        // levelup 
        let ret = pdata.upPlayer();

        if (ret == "succ") {
            this.onUpgradePlayLv();
            expRatio = pdata.expPercent;
            labelExpAnim.play(0.3, 0, Math.floor(expRatio * 100));
            // await barAnim.play(0.3, 0, pdata.expPercent)
            // Toast.make("获得升级奖励!")
            // add lvup-reward-item to loot list
            await this.addLootItems([{ type: ResType.Diamond, num: data.diamond_reward, is_lvup_reward: true }, { type: ResType.Gold, num: data.gold_reward, is_lvup_reward: true }]);
            this.endlessHint.active = pdata.playerlv == 3;
        }
        if (pdata.gameMode == ParkourType.Normal) {
            // 过关
            let lvdata = ccUtil.get(LevelData, pdata.playinglv)
            let reward = lvdata.getReward()
            if (reward) {
                //过关奖励
                //前三关将连接新手引导 
                if (!isThisLevelPlayed) {
                    // 仅第一次可获取
                    await this.addLootItems([reward])
                }
            }
            if (pdata.level == pdata.playinglv && pdata.isGameWin) {
                // 关卡 +1 
                pdata.level++;
            }

            guider.finishLevel();

        } else {
            //无尽模式
            Platform.updateRank(pdata.score);
        }
        this.cutBtnStyle(true);

    }


    findLootItem(type, id) {
        return this.layout_lootlist.node.children.find(v => {
            let data = v['data'] as LootItemData
            //pet_hatch :4 
            if (data == null) return false;
            return data.type == type && data.id == id;
        })
    }


    click_triple() {

        Loading.show(1)
        this.node_close.active = false;
        this.btn_triple.active = false;
        this.btn_next.active = false;
        Platform.watch_video(() => {
            Loading.hide()
            this.getReward(3);
            this.scheduleOnce(this.gotoNextLevel, 2)
        })
    }

    click_close() {

        this.getReward()
        Loading.show(0.5);
        this.scheduleOnce(() => {
            LoadingScene.goto("Home")
        }, 0.5)
    }

    click_next() {

        this.getReward()
        this.node_close.active = false;
        this.btn_next.active = false;
        this.btn_triple.active = false;
        if (pdata.energy <= 0) {
            Toast.make(LocalizationManager.getText("@text.not_enough_heart"));
            // Toast.make("红心不足！");
            vm.show("UIRedHeartShop", () => {
                vm.hide("UIRedHeartShop");
                this.scheduleOnce(this.gotoNextLevel, 2)
            }, () => {
                Loading.show(0.5);
                LoadingScene.goto("Home");
            })
            return
        }
        this.scheduleOnce(this.gotoNextLevel, 2)
    }

    gotoNextLevel() {
        if (pdata.gameMode == ParkourType.Normal) {
            pdata.playinglv++;
            let lvdata = ccUtil.get(LevelData, pdata.playinglv)
            if (lvdata == null || lvdata.segments.length <= 0) {
                //没有更多关卡
                Loading.show(0.5);
                this.scheduleOnce(() => {
                    LoadingScene.goto("Home", { msg: LocalizationManager.getText("@text.waitForMoreLevels") })
                    // LoadingScene.goto("Home", { msg: "可先进行无尽模式，请期待更多关卡！" })
                }, 0.5)
                return;
            }
        }
        LoadingScene.goto("Main", { type: "subEnergy" });
    }

    getReward(mul = 1) {
        for (let i = 0; i < this.items_tobeAdded.length; i++) {
            InventoryUI.instance.setTarget(this.layout_lootlist.node)
            let itmd = this.items_tobeAdded[i];
            if (itmd.type == ResType.Gold) {
                pdata.gold += Math.floor(itmd.num * mul)
            } else if (itmd.type == ResType.Diamond) {
                pdata.diamond += itmd.num * mul
            } else if (itmd.type == ResType.Prop) {
                let itmkey = csv.Prop.get(itmd.id).type;
                pdata.buffs[itmkey] += itmd.num * mul;
            } else if (itmd.type == ResType.Hero) {
                pdata.upHero(itmd.id)
            }
        }
        //同步数据到服务器
        pdata.sendToServer("level,normal_maxScores,energy,gold,diamond,playerlv,exp,buffs,heros")
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

            if (this.roleModel && skeletonData) {
                this.roleModel.skeletonData = skeletonData;
                this.roleModel.setAnimation(0, "Idle", true);
            }
        });
    }

}
