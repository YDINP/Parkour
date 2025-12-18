import { evt } from "../../../framework/core/event";
import gUtil from "../../../framework/core/gUtil";
import AliEvent from "../../../framework/extension/AliEvent";
import BuffSystem from "../../../framework/extension/buffs/BuffSystem";
import Platform from "../../../framework/extension/Platform";
import { UInfo } from "../../../framework/extension/weak_net_game/UInfo";
import WeakNetGame from "../../../framework/extension/weak_net_game/WeakNetGame";
import LoadingSceneBase from "../../../framework/misc/LoadingSceneBase";
import { pdata } from "../data/PlayerInfo";
import { ServerConfig } from "./ServerConfig";
import _Hi5Import from "../../../framework/Hi5/Hi5";

const { ccclass, property } = cc._decorator;

let inited = false;

// Hi5 모듈 가져오기 (import 실패 시 전역 객체에서 가져옴)
const getHi5Module = () => {
    // 1. import된 모듈 사용
    if (_Hi5Import && typeof _Hi5Import.Init_SDK === 'function') {
        return _Hi5Import;
    }
    // 2. 전역 _Hi5Module에서 가져오기
    if (typeof window !== 'undefined' && window['_Hi5Module'] && typeof window['_Hi5Module'].Init_SDK === 'function') {
        return window['_Hi5Module'];
    }
    // 3. 초기화된 Hi5 객체에서 가져오기
    if (typeof window !== 'undefined' && window['Hi5'] && typeof window['Hi5'].Init_SDK === 'function') {
        return window['Hi5'];
    }
    // 4. cc.pvz.Hi5에서 가져오기 (hi5.js fallback)
    if (typeof cc !== 'undefined' && cc['pvz'] && cc['pvz']['Hi5'] && typeof cc['pvz']['Hi5'].Init_SDK === 'function') {
        return cc['pvz']['Hi5'];
    }
    return null;
};

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return typeof window !== 'undefined' && window['Hi5'] != null;
};

@ccclass
export default class LoadingScene extends LoadingSceneBase {

    @property(cc.Label)
    labelTip: cc.Label = null;

    private heartbeatTime: number = 0;

    private isLoadSucc: boolean = false;
    private hi5Initialized: boolean = false;

    onLoad() {
        super.onLoad();
        this.status = 1;

        // Hi5 SDK 초기화
        this.initHi5SDK();

        this.scheduleOnce(this.heartBeatReport, 2)
    }

    // Hi5 SDK 초기화
    initHi5SDK() {
        // Hi5 모듈 가져오기
        const _Hi5 = getHi5Module();

        // _Hi5 모듈이 로드되지 않은 경우 건너뛰기
        if (!_Hi5) {
            console.warn("[Hi5] SDK module not loaded, skipping initialization");
            return;
        }

        // 초기 게임 데이터 정의 (pdata 필드와 일치해야 함)
        const initialGameData = {
            high_score: 0,
            score: 0,
            // pdata 기본값들
            "pdata.playinglv": 1,
            "pdata.level": 1,
            "pdata.gold": 1000,
            "pdata.diamond": 1000,
            "pdata.playerlv": 1,
            "pdata.exp": 0,
            "pdata.heros": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1 },
            "pdata.selHero": "1",
            "pdata.pets": {},
            "pdata.selPet": "0",
            "pdata.energy": 5,
            "pdata.buffs": { giant: 0, protect: 0, speed: 0, pet_hatch: 0 },
            "pdata.abilitys": { lifeup: 1, beanup: 1 },
            "pdata.guides": { noob: 0, pet: 0, item: 0, hero: 0 },
            "pdata.energyRecoveryT": 0,
            "pdata.score": 0,
            "pdata.normal_maxScores": {},
            "pdata.signIn": { date: 1, isSignIn: false },
            "pdata.signInTime": 0,
            "pdata.showTimeRateAdd": 1,
            "pdata.save_timestamps": 0,
        };

        // Hi5 SDK 메시지 콜백
        const onHi5Message = (data) => {
            console.log("[Hi5] Message received:", data.fromhi5action, JSON.stringify(data));

            if (data.fromhi5action === _Hi5.MESSAGE.GAME_DATA) {
                // 서버에서 게임 데이터 수신
                console.log("[Hi5] Game data loaded from server");
                this.hi5Initialized = true;
            } else if (data.fromhi5action === _Hi5.MESSAGE.START_GAME) {
                // 게임 시작 요청
                console.log("[Hi5] Start game requested");
                evt.emit("Hi5.StartGame");
            } else if (data.fromhi5action === _Hi5.MESSAGE.RESTART_GAME) {
                // 게임 재시작 요청
                console.log("[Hi5] Restart game requested");
                evt.emit("Hi5.RestartGame");
            } else if (data.fromhi5action === _Hi5.MESSAGE.SOUND) {
                // 사운드 설정
                console.log("[Hi5] Sound setting:", data.data);
                evt.emit("Hi5.Sound", data.data);
            } else if (data.fromhi5action === "LOAD_AD") {
                // 광고 로드 결과
                console.log("[Hi5] LOAD_AD message - status:", data.data.status);

                if (data.data.status === 0) {
                    // 로드 성공 → showAd 호출
                    console.log("[Hi5] Ad loaded, showing...");
                    if (_Hi5.lastAd) {
                        _Hi5.showAd(_Hi5.lastAd);
                    }
                } else {
                    // 로드 실패
                    console.error("[Hi5] Ad load failed:", data.data.msg);
                    evt.emit("Hi5.AdResult", false);
                    _Hi5.lastAd = undefined;
                    cc.audioEngine.resumeMusic();
                }
            } else if (data.fromhi5action === "SHOW_AD") {
                // Hi5 광고 메시지 처리
                console.log("[Hi5] SHOW_AD message - status:", data.data.status, "type:", data.data.type);

                if (data.data.status === 0) {
                    const adType = data.data.type;

                    if (adType === "show" || adType === "userEarnedReward") {
                        // 광고가 표시되거나 보상을 받았을 때 - 플래그 설정
                        _Hi5.lastShowAd = true;
                        console.log("[Hi5] Ad show/reward - lastShowAd set to true");
                    } else if (adType === "dismissed") {
                        // 광고가 닫혔을 때 - 콜백 호출
                        const success = _Hi5.lastShowAd && _Hi5.lastAd;
                        console.log("[Hi5] Ad dismissed - success:", success);

                        evt.emit("Hi5.AdResult", !!success);

                        _Hi5.lastShowAd = false;
                        _Hi5.lastAd = undefined;
                    }
                } else {
                    // 광고 로드/표시 실패 (status !== 0)
                    console.error("[Hi5] Ad show failed:", data.data.msg);
                    evt.emit("Hi5.AdResult", false);

                    _Hi5.lastShowAd = false;
                    _Hi5.lastAd = undefined;
                }
            }
        };

        // Hi5 SDK 초기화
        _Hi5.Init_SDK(onHi5Message, initialGameData);
        console.log("[Hi5] SDK initialized");
    }


    heartBeatReport() {
        if (this.isLoadSucc || this.heartbeatTime >= 4) return;
        // AliEvent.aliEvent("loading", { "heart": (this.heartbeatTime + 1) * 2 });
        this.heartbeatTime++;
        this.scheduleOnce(this.heartBeatReport, 2)
    }

    async nextScene() {
        if (gUtil.isNextDay(UInfo.lastLoginTime)) {
            UInfo.lastLoginTime = Date.now();
            UInfo.isFirstLoginToday = true;
            UInfo.save("lastLoginTime")
        } else {
            UInfo.isFirstLoginToday = false;
        }
        //开始
        this.loadNextScene()
        // AliEvent.aliEvent("loading", { "statu": "finish" });
        evt.emit("Loading.Success")

        // Hi5 로딩 완료 알림
        if (isHi5Platform()) {
            const _Hi5 = getHi5Module();
            if (_Hi5 && typeof _Hi5.LoadEnd === 'function') {
                _Hi5.LoadEnd();
                console.log("[Hi5] LoadEnd called");
            }
        }
    }
    //login 
    _status: number = 0;

    set status(v) {
        this._status = v;
        if (v == -1) {
            this.labelTip.string = "登录失败"
        } else if (v == 1) {
            this.labelTip.string = "加载中"
        } else {
            this.labelTip.string = "加载中"
        }
    }


    click_retry() {

    }

    //csv config share_config complete
    loginProgress(evt) {
        switch (evt) {
            case 'login':
                this.labelTip.string = "登录中"
                this.progress = 0.9;
                break;
            case 'config':
                this.labelTip.string = "加载配置"
                this.progress = 0.1;
                break;
            case 'local_csv':
                this.labelTip.string = "加载本地配置"
                this.progress = 0.3;
            case "csv":
                this.labelTip.string = "加载网络配置"
                this.progress = 0.5;
                break;
            case 'share_config':
                this.labelTip.string = "加载分享配置"
                this.progress = 0.7;
                break;
            case "complete":
                this.labelTip.string = "进入游戏..."
                this.progress = 1.0;
                break;
        }
    }

    finishLoad(data?) {
        this.isLoadSucc = true;
        // 后设置索引 
        csv.createIndex("Config", "key", "value")
        csv.createIndex("Audio", "key", "value")
        // WeakNetGame.is_safe_mode = !!csv.Config.Safe_Mode;
        inited = true;
        // check save timestamps 
        //sdk :设置 openid
        if (!data) {
            //登录失败，也进入
            this.nextScene();
            return;
        }
    }

    start() {
        //do init 
        // GameLogic.doLogin().then(v=>this.onLoadCsvs())
        //提前下载配置文件 
        // AliEvent.aliEvent("loading", { "statu": "start" });
        if (!inited) {
            WeakNetGame.initConfig(ServerConfig);
            //第一进入游戏 的loading 界面 
            if (!ServerConfig.is_local_game) {
                WeakNetGame.downloadCsv("Config").then(v => {
                    csv.createIndex("Config", "key", "value")
                })
            }
        }
        if (!inited) {
            WeakNetGame.doLogin(UInfo.userId, this.loginProgress.bind(this)).then(data => {
                this.finishLoad(data)
                let time = data.save_timestamps
                if (time) {
                    // openId 
                    if (data.openId == UInfo.userId) {
                        if (time > pdata.save_timestamps) {
                            //use server data 
                            pdata.loadFromJsonObject(data);
                        } else {
                            //使用本地数据 
                            console.log("使用本地数据 ，服务器不是最新的")
                        }
                    } else {
                        //别的玩家登陆游戏 
                        UInfo.userId == data.openId;
                        UInfo.save("userId")
                        pdata.loadFromJsonObject(data);
                    }
                } else {
                    //新玩家使用本地数据 
                    UInfo.isNew = true;
                    UInfo.userId = data.openId;
                    UInfo.save('userId')
                    console.log("新玩家使用本地数据----,更新玩家id")
                }
                !data.stime && (data.stime = new Date().getTime());
                BuffSystem.time = data.stime / 1000;
                // util.checkIp()
                this.nextScene();
            }).catch(v => {
                this.finishLoad()
            })
        } else {
            this.nextScene();
        }

    }

}