import DataCenter, { dc, field } from "../../../framework/core/DataCenter";
import { evt } from "../../../framework/core/event";
import BuffSystem from "../../../framework/extension/buffs/BuffSystem";
import Platform from "../../../framework/extension/Platform";
import { lerpVec2 } from "../../../framework/extension/qanim/Extension";
import { UInfo } from "../../../framework/extension/weak_net_game/UInfo";
import WeakNetGame from "../../../framework/extension/weak_net_game/WeakNetGame";
import ccUtil from "../../../framework/utils/ccUtil";
import gameUtil from "../../../framework/utils/gameUtil";
import { root } from "../game/Game";
import { Res, ResType } from "../game/model/BaseData";
import HeroData from "../game/model/HeroData";
import PetData from "../game/model/PetData";
import PlayerData from "../game/model/PlayerData";
import ShopCapData from "../game/model/ShopCapData";
import _Hi5Import from "../../../framework/Hi5/hi5";

// Hi5 모듈 가져오기 (import 실패 시 전역 객체에서 가져옴)
const getHi5Module = () => {
    // 1. import된 모듈 사용
    if (_Hi5Import && typeof _Hi5Import.GameEnd === 'function') {
        return _Hi5Import;
    }
    // 2. 전역 _Hi5Module에서 가져오기
    if (typeof window !== 'undefined' && window['_Hi5Module'] && typeof window['_Hi5Module'].GameEnd === 'function') {
        return window['_Hi5Module'];
    }
    // 3. 초기화된 Hi5 객체에서 가져오기
    if (typeof window !== 'undefined' && window['Hi5'] && typeof window['Hi5'].GameEnd === 'function') {
        return window['Hi5'];
    }
    // 4. cc.pvz.Hi5에서 가져오기 (hi5.js fallback)
    if (typeof cc !== 'undefined' && cc['pvz'] && cc['pvz']['Hi5'] && typeof cc['pvz']['Hi5'].GameEnd === 'function') {
        return cc['pvz']['Hi5'];
    }
    return null;
};

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return typeof window !== 'undefined' && window['Hi5'] != null;
};

export enum ParkourType {
    Normal,
    Infinite,
}

export enum PlayerActionType {
    get_hit,
    fall_off,
    consume_hp,
    revive,
}

enum ShopCapType {
    lifeup = 1,
    beanup = 2
}


export type UpgradeResult = "max" | "succ" | "fail"

@dc("pdata")
export default class PlayerInfoDC extends DataCenter {

    /** 正在玩哪关 */
    @field()
    playinglv: number = 1;

    //当前最高关卡
    @field()
    level: number = 1;

    //银币
    @field()
    gold: number = 1000;


    /**钻石 */
    @field()
    diamond: number = 1000;

    /** 玩家等级  */
    @field()
    playerlv: number = 1;

    /**玩家经验 */
    @field()
    exp: number = 0;


    // 0- 未获取
    // 1- 为当前等级
    /** 英雄 等级 */
    @field()
    heros: { [index: string]: number } = {
        ["1"]: 1,
        ["2"]: 1,
        ["3"]: 1,
        ["4"]: 1,
        ["5"]: 1,
        ["6"]: 1,
    }

    @field()
    selHero: string = "1"

    /** 宠物等级 */
    @field()
    pets: { [index: string]: number } = {}
    @field()
    selPet: string = "0"

    /** 体力 */
    @field()
    energy: number = 5;

    /**buff数量 */
    @field()
    buffs: { [type: string]: number } = {
        giant: 0,//巨人状态
        protect: 0,//魔法保护
        speed: 0,//开局加速
        pet_hatch: 0,//孵化卷
    };

    /**能力等级 */
    @field()
    abilitys: { [type: string]: number } = {
        lifeup: 1,
        beanup: 1,
    };

    @field()
    guides: { [stepID: string]: number } = {
        noob: 0,
        pet: 0,
        item: 0,
        hero: 0,
    };

    nickName: string = "unknonw"

    avatarUrl: string = ""

    /**上一次恢复的时间  */
    @field()
    energyRecoveryT: number = 0;


    /** 无尽关卡最高分记录 */
    @field()
    score: number = 0;

    /**普通  关卡最高分记录 */
    @field()
    normal_maxScores: { [index: number]: number } = {}

    /** 玩家当湔 英雄 的生命值  */
    private _hp: number = 0;


    /** 玩家当湔 英雄 的生命值  */
    @field({ persistent: false, enumerable: false })
    tmpScore: number = 0;

    /** 玩家当湔 英雄 的生命值  */
    @field({ persistent: false, enumerable: false })
    tmpGold: number = 0;

    maxHp: number = 0;
    maxHp_normal: number = 0;

    //跑的距离
    distance: number = 0;

    //签到
    @field()
    signIn: { date: number, isSignIn: boolean } = { date: 1, isSignIn: false };

    //签到时间
    @field()
    signInTime: number = 0;

    //游戏模式
    gameMode: number = 0;

    //开局buff
    startBuffs: Array<string> = [];

    hpLose: number = 1;

    lastAction: PlayerActionType;
    reviveCount: number = 0;

    isGameEnd: boolean = false;
    isGameWin: boolean = false;

    @field()
    showTimeRateAdd: number = 1;

    public get hp(): number {
        return this._hp;
    }
    public set hp(value: number) {
        if (value <= 0) {
            value = 0;
        }
        if (this._hp != value) {
            this._hp = value;
            evt.emit("pdata.hp", this._hp, value)
        }
    }

    onLoadAll() {

    }

    /**游戏 开始 数据处理 */
    enterGame() {
        let hero = ccUtil.get(HeroData, this.selHero)
        //额外血量加成
        let hpAddLevel = this.abilitys.lifeup
        let shopcap = ccUtil.get(ShopCapData, ShopCapType.lifeup)
        let shopHpAdd = shopcap.vals[hpAddLevel - 1];
        console.log("=== 商店 hp加成" + shopHpAdd)
        this.maxHp_normal = hero.hp;
        this.maxHp = hero.hp + shopHpAdd;
        this.hp = this.maxHp;
        this.hpLose = 1;
        this.tmpScore = 0;
        this.tmpGold = 0;
        this.distance = 0;
        this.reviveCount = 0;
        this.isGameEnd = false;
        this.isGameWin = false;
    }

    /**游戏结束后数据 处理  */
    endGame(isWin?) {
        this.isGameEnd = true;
        if (isWin) {
            this.isGameWin = true;
        }
        //上传数据
        if (this.tmpScore > this.score) {
            this.score = this.tmpScore;
        }
        this.distance = root.player.node.x / 10

        // Hi5 게임 종료 및 점수 제출
        if (isHi5Platform()) {
            const _Hi5 = getHi5Module();
            if (_Hi5) {
                _Hi5.GameEnd();
                _Hi5.submitScore(this.tmpScore);
                _Hi5.SaveData();
                console.log("[Hi5] GameEnd called, score submitted:", this.tmpScore);
            }
        }
    }


    /**同步指定域数据 */
    sendToServer(str: string) {
        let d = {}
        let n = 0
        str.split(",").map(v => v.trim()).forEach(k => {
            d[k] = this[k]
            this.save(k)
            n++;
        })
        this.save_timestamps = BuffSystem.time;
        this.save("save_timestamps")
        if (n > 0) {
            WeakNetGame.syncData(d, UInfo.userId);
        }
    }


    getMaxScore(lv) {
        return this.normal_maxScores[lv] || 0;
    }

    isNewRecord() {
        if (this.gameMode == ParkourType.Normal) {
            return this.tmpScore > this.getMaxScore(this.playinglv);
        } else {
            return this.tmpScore > this.score;
        }
    }

    /**尝试突破记录 */
    breakNewRecord() {
        if (this.gameMode == ParkourType.Normal) {
            let max = this.getMaxScore(this.playinglv);
            if (this.tmpScore > max) {
                this.normal_maxScores[this.playinglv] = this.tmpScore;
                return true
            }
        } else {
            if (this.tmpScore > this.score) {
                this.score = this.tmpScore;
                return true;
            }
        }
        return false;
    }



    exitGame() {

    }

    //获取英雄等级 
    getHeroLevel(id) {
        let lv = this.heros[id] || 0
        return lv;
    }

    /** 获取宠物等级  */
    getPetLevel(id) {
        let lv = this.pets[id] || 0
        return lv;
    }

    /**当前选中的英雄的等级 */
    get selHeroLevel() {
        return this.getHeroLevel(this.selHero)
    }

    /** 当前选中的宠物的等级  */
    get selPetLevel() {
        return this.getPetLevel(this.selPet)
    }

    get selHeroData() {
        return ccUtil.get(HeroData, this.selHero)
    }

    get selPetData() {
        return ccUtil.get(PetData, this.selPet)
    }


    /** 选择英雄 */
    selectHero(id) {
        this.selHero = id;
        this.save("selHero")
    }

    /** 选择宠物  */
    selectPet(id) {
        this.selPet = id;
        this.save("selPet")
    }

    /**升级 英雄 */
    upHero(id): UpgradeResult {
        let lv = this.getHeroLevel(id)
        let d = ccUtil.get(HeroData, lv + 1)
        if (d) {
            lv++;
            this.heros[id] = lv;
            this.save("heros")
            this.sendToServer("heros,gold,diamond")
            return "succ"
        } else {
            return "max"
        }
    }

    /**升级玩家等级   */
    upPlayer(): UpgradeResult {
        let d = ccUtil.get(PlayerData, pdata.playerlv + 1);
        if (d == null) {
            //max level reached
            return "max";
        } else {
            // let next_require_exp = d.require_exp;
            // console.log("经验值 :", pdata.exp, next_require_exp)
            // if (pdata.exp >= next_require_exp) {
            //     pdata.exp = pdata.exp - next_require_exp;
            //     //有bug,如果连续升2级
            //     pdata.playerlv++;
            //     this.save("exp", 'playerlv')
            //     return "succ";
            // }
            // this.save("exp")
            // return "fail";

            let next_require_exp = d.require_exp;
            let isSucc = false;
            while (pdata.exp >= next_require_exp) {
                console.log("经验值 :", pdata.exp, next_require_exp)
                pdata.exp = pdata.exp - next_require_exp;
                pdata.playerlv++;
                d = ccUtil.get(PlayerData, pdata.playerlv + 1);
                next_require_exp = d.require_exp;
                isSucc = true;
            }
            this.save("exp", 'playerlv');
            return isSucc ? "succ" : "fail";
        }
    }

    getStartBuff() {
        let buffs: { [id: number]: string } = {};
        if (this.startBuffs.indexOf("giant") != -1) {
            buffs[1] = "strong";
        }
        if (this.startBuffs.indexOf("protect") != -1) {
            buffs[2] = "shield";
        }
        if (this.startBuffs.indexOf("speed") != -1) {
            buffs[3] = "rush";
        }
        this.startBuffs = [];
        return buffs;
    }

    get reuquireExp() {
        let d = ccUtil.get(PlayerData, pdata.playerlv + 1);
        if (d == null) {
            //max level reached
            return 99999999;
        } else {
            let next_require_exp = d.require_exp;
            return next_require_exp
        }
    }

    get expPercent() {
        let d = ccUtil.get(PlayerData, pdata.playerlv + 1);
        if (d == null) {
            //max level reached
            return 1;
        } else {
            let next_require_exp = d.require_exp;
            let p = pdata.exp / next_require_exp;
            return p
        }
    }


    hasPet(id) {
        let lv = this.getPetLevel(id)
        return lv > 0;
    }

    /**升级 宠物 */
    upPet(id): UpgradeResult {
        let lv = this.getPetLevel(id)
        let d = ccUtil.get(PetData, lv + 1)
        if (d) {
            lv++;
            this.pets[id] = lv;
            this.save("pets")
            this.sendToServer("pets,gold,diamond")
            return "succ"
        } else {
            return "max"
        }
    }

    //添加buff道具
    addBuffItem(id: number, num: number) {
        this.buffs[id] += num;
        this.save("buffs");
    }


    /**添加资源 ,res 为资源类型，和数量 ， mul是添加的倍数，-1 为减少资源
     * 
     *  @returns  返回 false 表示 添加/减少 失败 ,true表示添加/减少成功
     * 
        */
    addRes(res: Res, mul = 1) {
        switch (res.type) {
            case ResType.Gold:
                if (mul < 0) {
                    let g = this.gold + res.num * mul;
                    if (g < 0) {
                        //数量不足
                        return false;
                    }
                }
                this.gold += mul * res.num;
                this.save("gold")
                break;
            case ResType.Diamond:
                if (mul < 0) {
                    let r = this.diamond + res.num * mul;
                    if (r < 0) {
                        //数量 不足
                        return false;
                    }
                }
                this.diamond += mul * res.num;
                this.save("diamond")
                break;
            case ResType.Energy:
                this.energy += mul * res.num;
                this.save("energy")
                break;
        }
        return true;
    }
tempEne
}

export let pdata: PlayerInfoDC = DataCenter.register(PlayerInfoDC);