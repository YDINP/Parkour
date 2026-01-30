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
import Hi5 from "../../../framework/Hi5/Hi5";

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return Hi5 != null;
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

    /** Currently playing level */
    @field()
    playinglv: number = 1;

    // Current highest level
    @field()
    level: number = 1;

    // Silver coins
    @field()
    gold: number = 1000;


    /** Diamond */
    @field()
    diamond: number = 0;

    /** Player level  */
    @field()
    playerlv: number = 1;

    /** Player experience */
    @field()
    exp: number = 0;


    // 0- Not obtained
    // 1- Current level
    /** Hero level */
    @field()
    heros: { [index: string]: number } = {
        ["1"]: 1,
    }

    @field()
    selHero: string = "1"

    /** Pet level */
    @field()
    pets: { [index: string]: number } = {}
    @field()
    selPet: string = "0"

    /** Energy */
    @field()
    energy: number = 5;

    /** Buff count */
    @field()
    buffs: { [type: string]: number } = {
        giant: 0,// Giant state
        protect: 0,// Magic protection
        speed: 0,// Speed boost at start
        pet_hatch: 0,// Hatch ticket
    };

    /** Ability level */
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

    /** Last recovery time  */
    @field()
    energyRecoveryT: number = 0;


    /** Endless mode highest score record */
    @field()
    score: number = 0;

    /** Normal level highest score record */
    @field()
    normal_maxScores: { [index: number]: number } = {}

    /** Player's current hero HP  */
    private _hp: number = 0;


    /** Temporary score  */
    @field({ persistent: false, enumerable: false })
    tmpScore: number = 0;

    /** Temporary gold  */
    @field({ persistent: false, enumerable: false })
    tmpGold: number = 0;

    maxHp: number = 0;
    maxHp_normal: number = 0;

    // Distance run
    distance: number = 0;

    // Sign in
    @field()
    signIn: { date: number, isSignIn: boolean } = { date: 1, isSignIn: false };

    // Sign in time
    @field()
    signInTime: number = 0;

    // 무료 다이아 광고 일일 횟수 (기본 3회)
    @field()
    freeDiamondCount: number = 3;

    // 무료 다이아 마지막 충전 날짜 (YYYY-MM-DD)
    @field()
    freeDiamondDate: string = "";

    // 무료 펫 알 광고 일일 횟수 (기본 1회)
    @field()
    freePetHatchCount: number = 1;

    // 무료 펫 알 마지막 충전 날짜 (YYYY-MM-DD)
    @field()
    freePetHatchDate: string = "";

    // Game mode
    gameMode: number = 0;

    // Start buffs
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

    /**
     * 다이아 광고 일일 제한 체크 및 리셋
     * 날짜가 바뀌면 횟수를 3으로 리셋
     */
    checkDailyDiamondReset(): void {
        const today = new Date().toISOString().split('T')[0];
        if (this.freeDiamondDate !== today) {
            this.freeDiamondCount = 3;
            this.freeDiamondDate = today;
            this.save("freeDiamondCount", "freeDiamondDate");
        }
    }

    /**
     * 다이아 광고 시청 가능 여부 확인
     */
    canWatchDiamondAd(): boolean {
        this.checkDailyDiamondReset();
        return this.freeDiamondCount > 0;
    }

    /**
     * 다이아 광고 시청 횟수 차감
     */
    useDiamondAdCount(): void {
        if (this.freeDiamondCount > 0) {
            this.freeDiamondCount--;
            this.save("freeDiamondCount");
        }
    }

    /**
     * 펫 알 광고 일일 제한 체크 및 리셋
     * 날짜가 바뀌면 횟수를 1로 리셋
     */
    checkDailyPetHatchReset(): void {
        const today = new Date().toISOString().split('T')[0];
        if (this.freePetHatchDate !== today) {
            this.freePetHatchCount = 1;
            this.freePetHatchDate = today;
            this.save("freePetHatchCount", "freePetHatchDate");
        }
    }

    /**
     * 펫 알 광고 시청 가능 여부 확인
     */
    canWatchPetHatchAd(): boolean {
        this.checkDailyPetHatchReset();
        return this.freePetHatchCount > 0;
    }

    /**
     * 펫 알 광고 시청 횟수 차감
     */
    usePetHatchAdCount(): void {
        if (this.freePetHatchCount > 0) {
            this.freePetHatchCount--;
            this.save("freePetHatchCount");
        }
    }

    /** Game start data processing */
    enterGame() {
        let hero = ccUtil.get(HeroData, this.selHero)
        // Extra HP bonus
        let hpAddLevel = this.abilitys.lifeup
        let shopcap = ccUtil.get(ShopCapData, ShopCapType.lifeup)
        let shopHpAdd = shopcap.vals[hpAddLevel - 1];
        console.log("=== Shop HP bonus: " + shopHpAdd)
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

    /** Game end data processing  */
    endGame(isWin?) {
        this.isGameEnd = true;
        if (isWin) {
            this.isGameWin = true;
        }
        // Upload data
        if (this.tmpScore > this.score) {
            this.score = this.tmpScore;
        }
        this.distance = root.player.node.x / 10

        // Hi5 게임 종료 및 점수 제출
        if (isHi5Platform()) {
            Hi5.GameEnd();
            Hi5.submitScore(this.tmpScore);
            Hi5.SaveData();
            console.log("[Hi5] GameEnd called, score submitted:", this.tmpScore);
        }
    }


    /** Sync specified domain data */
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

    /** Try to break record */
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

    // Get hero level
    getHeroLevel(id) {
        let lv = this.heros[id] || 0
        return lv;
    }

    /** Get pet level  */
    getPetLevel(id) {
        let lv = this.pets[id] || 0
        return lv;
    }

    /** Currently selected hero level */
    get selHeroLevel() {
        return this.getHeroLevel(this.selHero)
    }

    /** Currently selected pet level  */
    get selPetLevel() {
        return this.getPetLevel(this.selPet)
    }

    get selHeroData() {
        return ccUtil.get(HeroData, this.selHero)
    }

    get selPetData() {
        return ccUtil.get(PetData, this.selPet)
    }


    /** Select hero */
    selectHero(id) {
        this.selHero = id;
        this.save("selHero")
    }

    /** Select pet  */
    selectPet(id) {
        this.selPet = id;
        this.save("selPet")
    }

    /** Upgrade hero */
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

    /** Upgrade player level   */
    upPlayer(): UpgradeResult {
        let d = ccUtil.get(PlayerData, pdata.playerlv + 1);
        if (d == null) {
            //max level reached
            return "max";
        } else {
            // let next_require_exp = d.require_exp;
            // console.log("Experience:", pdata.exp, next_require_exp)
            // if (pdata.exp >= next_require_exp) {
            //     pdata.exp = pdata.exp - next_require_exp;
            //     // Bug if leveling up 2 levels consecutively
            //     pdata.playerlv++;
            //     this.save("exp", 'playerlv')
            //     return "succ";
            // }
            // this.save("exp")
            // return "fail";

            let next_require_exp = d.require_exp;
            let isSucc = false;
            while (pdata.exp >= next_require_exp) {
                console.log("Experience:", pdata.exp, next_require_exp)
                pdata.exp = pdata.exp - next_require_exp;
                pdata.playerlv++;
                isSucc = true;
                d = ccUtil.get(PlayerData, pdata.playerlv + 1);
                if (d == null) {
                    // Max level reached
                    break;
                }
                next_require_exp = d.require_exp;
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

    /** Upgrade pet */
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

    // Add buff item
    addBuffItem(id: number, num: number) {
        this.buffs[id] += num;
        this.save("buffs");
    }


    /** Add resource, res is resource type and amount, mul is multiplier, -1 to decrease resource
     *
     *  @returns  Returns false if add/decrease failed, true if successful
     *
        */
    addRes(res: Res, mul = 1) {
        switch (res.type) {
            case ResType.Gold:
                if (mul < 0) {
                    let g = this.gold + res.num * mul;
                    if (g < 0) {
                        // Insufficient amount
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
                        // Insufficient amount
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