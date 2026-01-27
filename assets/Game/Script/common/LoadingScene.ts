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
import Hi5 from "../../../framework/Hi5/Hi5";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";

const { ccclass, property } = cc._decorator;

let inited = false;

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return Hi5 != null;
};

@ccclass
export default class LoadingScene extends LoadingSceneBase {

    @property(cc.Label)
    labelTip: cc.Label = null;

    private heartbeatTime: number = 0;

    private isLoadSucc: boolean = false;
    private hi5Initialized: boolean = false;

    onLoad() {
        console.log("[LoadingScene] onLoad started");
        super.onLoad();
        this.status = 1;

        // Hi5 SDK 초기화
        this.initHi5SDK();

        this.scheduleOnce(this.heartBeatReport, 2)
        console.log("[LoadingScene] onLoad finished");
    }

    // Hi5 SDK 초기화
    initHi5SDK() {
        console.log("[Hi5] initHi5SDK called");

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

            if (data.fromhi5action === Hi5.MESSAGE.GAME_DATA) {
                // 서버에서 게임 데이터 수신
                console.log("[Hi5] Game data loaded from server");
                this.hi5Initialized = true;
            } else if (data.fromhi5action === Hi5.MESSAGE.START_GAME) {
                // 게임 시작 요청
                console.log("[Hi5] Start game requested");
                evt.emit("Hi5.StartGame");
            } else if (data.fromhi5action === Hi5.MESSAGE.RESTART_GAME) {
                // 게임 재시작 요청
                console.log("[Hi5] Restart game requested");
                evt.emit("Hi5.RestartGame");
            } else if (data.fromhi5action === Hi5.MESSAGE.SOUND) {
                // 사운드 설정
                console.log("[Hi5] Sound setting:", data.data);
                evt.emit("Hi5.Sound", data.data);
            } else if (data.fromhi5action === "LOAD_AD") {
                // 광고 로드 결과
                console.log("[Hi5] LOAD_AD message - status:", data.data.status);

                if (data.data.status === 0) {
                    // 로드 성공 → showAd 호출
                    console.log("[Hi5] Ad loaded, showing...");
                    if (Hi5.lastAd) {
                        Hi5.showAd(Hi5.lastAd);
                    }
                } else {
                    // 로드 실패
                    console.error("[Hi5] Ad load failed:", data.data.msg);
                    evt.emit("Hi5.AdResult", false);
                    Hi5.lastAd = undefined;
                    cc.audioEngine.resumeMusic();
                }
            } else if (data.fromhi5action === "SHOW_AD") {
                // Hi5 광고 메시지 처리
                console.log("[Hi5] SHOW_AD message - status:", data.data.status, "type:", data.data.type);

                if (data.data.status === 0) {
                    const adType = data.data.type;

                    if (adType === "show" || adType === "userEarnedReward") {
                        // 광고가 표시되거나 보상을 받았을 때 - 플래그 설정
                        Hi5.lastShowAd = true;
                        console.log("[Hi5] Ad show/reward - lastShowAd set to true");
                    } else if (adType === "dismissed") {
                        // 광고가 닫혔을 때 - 콜백 호출
                        const success = Hi5.lastShowAd && Hi5.lastAd;
                        console.log("[Hi5] Ad dismissed - success:", success);

                        evt.emit("Hi5.AdResult", !!success);

                        Hi5.lastShowAd = false;
                        Hi5.lastAd = undefined;
                    }
                } else {
                    // 광고 로드/표시 실패 (status !== 0)
                    console.error("[Hi5] Ad show failed:", data.data.msg);
                    evt.emit("Hi5.AdResult", false);

                    Hi5.lastShowAd = false;
                    Hi5.lastAd = undefined;
                }
            }
        };

        // Hi5 SDK 초기화
        Hi5.Init_SDK(onHi5Message, initialGameData);
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
            Hi5.LoadEnd();
            console.log("[Hi5] LoadEnd called");
        }
    }
    //login 
    _status: number = 0;

    set status(v) {
        this._status = v;
        
        if (v == -1) {
            this.labelTip.string = LocalizationManager.getText("@loading.login_failed") || "로그인 실패"
        } else if (v == 1) {
            this.labelTip.string = LocalizationManager.getText("@loading.progress") || "로딩 중"
        } else {
            this.labelTip.string = LocalizationManager.getText("@loading.progress") || "로딩 중"
        }
    }


    click_retry() {

    }

    //csv config share_config complete
    loginProgress(evt, progressValue?: number) {

        switch (evt) {
            case 'login':
                this.labelTip.string = LocalizationManager.getText("@loading.login") || "로그인 중"
                this.progress = 0.9;
                break;
            case 'config':
                this.labelTip.string = LocalizationManager.getText("@loading.config") || "설정 로딩"
                this.progress = 0.1;
                break;
            case 'local_csv':
                this.labelTip.string = LocalizationManager.getText("@loading.config_local") || "로컬 설정 로딩"
                this.progress = 0.3;
                break;
            case "csv":
                this.labelTip.string = LocalizationManager.getText("@loading.config_network") || "네트워크 설정 로딩"
                // Use the detailed progress value if provided, otherwise use default 0.5
                this.progress = progressValue !== undefined ? progressValue : 0.5;
                break;
            case 'share_config':
                this.labelTip.string = LocalizationManager.getText("@loading.config_share") || "공유 설정 로딩"
                this.progress = 0.7;
                break;
            case "complete":
                this.labelTip.string = LocalizationManager.getText("@loading.entering") || "게임 진입 중..."
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
        console.log("[LoadingScene] start() called");
        //do init
        // GameLogic.doLogin().then(v=>this.onLoadCsvs())
        //提前下载配置文件
        // AliEvent.aliEvent("loading", { "statu": "start" });
        if (!inited) {
            console.log("[LoadingScene] Initializing WeakNetGame config");
            WeakNetGame.initConfig(ServerConfig);
            //第一进入游戏 的loading 界面
            if (!ServerConfig.is_local_game) {
                WeakNetGame.downloadCsv("Config").then(v => {
                    csv.createIndex("Config", "key", "value")
                })
            }
        }
        if (!inited) {
            console.log("[LoadingScene] Calling WeakNetGame.doLogin");
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
                            //로컬 데이터 사용
                            console.log("로컬 데이터 사용, 서버가 최신이 아님")
                        }
                    } else {
                        //다른 플레이어 게임 로그인 
                        UInfo.userId = data.openId;
                        UInfo.save("userId")
                        pdata.loadFromJsonObject(data);
                    }
                } else {
                    //신규 플레이어 로컬 데이터 사용
                    UInfo.isNew = true;
                    UInfo.userId = data.openId;
                    UInfo.save('userId')
                    console.log("신규 플레이어 로컬 데이터 사용----, 플레이어 ID 업데이트")
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