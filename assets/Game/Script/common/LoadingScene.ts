import { evt } from "../../../framework/core/event";
import AliEvent from "../../../framework/extension/AliEvent";
import BuffSystem from "../../../framework/extension/buffs/BuffSystem";
import Platform from "../../../framework/extension/Platform";
import { UInfo } from "../../../framework/extension/weak_net_game/UInfo";
import WeakNetGame from "../../../framework/extension/weak_net_game/WeakNetGame";
import LoadingSceneBase from "../../../framework/misc/LoadingSceneBase";
import { pdata } from "../data/PlayerInfo";
import { ServerConfig } from "./ServerConfig";

const { ccclass, property } = cc._decorator;

let inited = false;

@ccclass
export default class LoadingScene extends LoadingSceneBase {

    @property(cc.Label)
    labelTip: cc.Label = null;

    private heartbeatTime: number = 0;

    private isLoadSucc: boolean = false;
    onLoad() {
        super.onLoad();
        this.status = 1;

        this.scheduleOnce(this.heartBeatReport, 2)
    }


    heartBeatReport() {
        if (this.isLoadSucc || this.heartbeatTime >= 4) return;
        // AliEvent.aliEvent("loading", { "heart": (this.heartbeatTime + 1) * 2 });
        this.heartbeatTime++;
        this.scheduleOnce(this.heartBeatReport, 2)
    }

    async nextScene() {
        if (g.isNextDay(UInfo.lastLoginTime)) {
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