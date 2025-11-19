import { evt } from "../../../core/event";
import AliEvent from "../../AliEvent";
import Platform from "../../Platform";
import { UInfo } from "../../weak_net_game/UInfo";

var Global = {
    videoAd: null,
    bannerAd: null,
    interstitialAd: null,
    isBannerShow: null,
    videoAdLoadCount: null,
    bannerAdLoadCount: null,
    video_close_callback: (ret: any) => { },
    video_error_callback: () => { },
    video_load_callback: () => { }
}

export interface ShareInfo {
    title: string,
    imageUrl: string,
    query?: string,
    ald_desc?: string

    id?: string,
    queryObjects: Object
}

class TTSdk {
    _UInfo: any = null;
    _loginCode: any;
    _openId: string = "";

    _db: any;
    _version: number;
    _systemInfo: any;

    public get Ver(): number { return this._version; }

    public get UInfo() { return this._UInfo }

    public get parent() {
        if (!window.tt) return ""
        let info = tt.getLaunchOptionsSync();
        if (info.scene == 1007 || info.scene == 1008) {//通过分享进入游戏
            let openId = info.query["user_id"];
            return openId
        }
        return ""; //默认
    }

    public set openId(v) {
        this._openId = v
    }

    public get openId() {
        return this._openId
    }


    constructor() {
        if (window.tt) {
            if (this._version == null) {
                this._systemInfo = tt.getSystemInfoSync();
                let ver = this._systemInfo.SDKVersion.replace(/\./g, "")
                this._version = parseInt(ver);
            }
        }
        this.onRecorder()
    }

    public static basePointKey_top = {
        aufromvideo: "aufromvideo"
    }
    public static basePointKey_last = {

    }
    requestDB(tbname, callback, target) {
        this._db.collection(tbname).get({
            success: function (res) {
                console.log("get " + tbname + " succ:", res.data)
                // self._shareConfig = res.data;
                if (callback) callback.call(target, res.data);
            }, fail: (res) => {
                console.log("get " + tbname + " fail:")
                if (callback) callback.call(target)
            }
        });
    }

    requestConfig(callback) {
        this._db.collection("t_conf").get({
            success: function (res) {
                console.log("get configs succ:", res.data)
                // self._shareConfig = res.data;
                if (callback) callback(res.data);
            }, fail: (res) => {
                console.log("get configs fail:", res)
                if (callback) callback(null)
            }
        });
    }


    /**
     * 打开分享
     * @param share_cfg {ShareInfo}
     */
    async openShare(share_cfg: ShareInfo, params?) {
        if (!gUtil.iswxgame()) return;
        let info = {} as ShareInfo
        info.title = share_cfg.title;
        info.imageUrl = share_cfg.imageUrl;
        let querys: any = info.queryObjects || {};
        if (info != null) {
            let querystr = ""
            params = params || {}
            Object.keys(params).forEach(k1 => {
                querys[k1] = params[k1]
            })
            querystr = Object.keys(querys).reduce((sum, k) => {
                let v = querys[k]
                return sum + `${k}=${v}&`
            }, querystr)
            info.query = querystr + "time=" + new Date().getTime()
            info.ald_desc = share_cfg.ald_desc
            console.log("open Share", info)
            tt.aldShareAppMessage(info);
        }
    }

    private createButton(callback, x?, y?, width?, height?) {
        console.log("-------------createButton");
        let button = tt.createUInfoButton({
            type: "text",
            text: "     ",
            style: {
                x: x || 0, y: y || 0,
                width: width || cc.winSize.width,
                height: height || cc.winSize.height,
                lineHeight: 40,
                backgroundColor: '#00000000',
                color: '#ffffff'
            }
        });
        button.onTap(function (res) {
            button.destroy();
            if (res && res) {
                if (callback) callback(res);
            } else if (callback) callback(null);
        });
    }


    private getUInfo(callback) {
        console.warn("-------------getUInfo");
        tt.getUInfo({
            withCredentials: true,
            lang: "zh_CN",
            success: (res) => {
                console.log("getUInfo success.", res);
                if (callback) callback(res);
            }, fail: (res) => {
                console.log("getUInfo:", res);
                if (callback) callback(null);
            },
            complete: null
        });
    }

    oldAuthUser(callback) {
        tt.authorize({
            scope: "scope.UInfo",
            success: (res) => {
                console.log(res);
                if (callback) callback(true);
            }, fail: (res) => {
                console.log(res);
                if (callback) callback(false);
            }, complete: null
        });
    }


    public showShareMenu(cf: ShareInfo) {
        let self = this;
        tt.showShareMenu({
            withShareTicket: true,
            success: (res) => {
                console.log(res);
            }, fail: (res) => {
                console.log(res);
            }, complete: null
        });
        tt.aldOnShareAppMessage(function () {
            // let content =  {title:TTGameConfig.default_share_title,imageUrl:cc.url.raw(TTGameConfig.deafult_share_imgUrl)}
            return cf;
        });
    }
    private onRecorder() {
        if (window.tt) {
            const recorder = tt.getGameRecorderManager();
            recorder.onStart((res) => {
                console.log("录屏开始");

            });
            recorder.onError((res) => {
                console.log("录屏错误");

            });
            recorder.onStop((res) => {
                console.log("录屏结束");

                UInfo.record_path = res.videoPath
                console.log("录制地址:", UInfo.record_path)
            })
        }
    }
    /* 
    *开始录屏
    */
    public start_recorder() {
        if (tt.getSystemInfoSync().platform == "devtools") {
            console.log("********start录屏*************")
            return;
        }
        if (window.tt) {
            console.log("**********ttsdk->start_recorder->开始录屏*********")
            const recorder = tt.getGameRecorderManager();
            recorder.start({
                duration: 30,
            })
        }

    }
    /* 
   *暂停
   */
    public pause_recorder() {
        if (tt.getSystemInfoSync().platform == "devtools") {
            console.log("********暂停录屏*************")
            return;
        }
        if (window.tt) {
            console.log("**********ttsdk->pause_recorder->暂停录屏*********")
            const recorder = tt.getGameRecorderManager();
            recorder.pause()
        }
    }
    /* 
   *继续
   */
    public resume_recorder() {
        if (tt.getSystemInfoSync().platform == "devtools") {
            console.log("********继续录屏*************")
            return;
        }
        if (window.tt) {
            console.log("**********ttsdk->resume_recorder->继续录屏*********")
            const recorder = tt.getGameRecorderManager();
            recorder.resume()
        }
    }
    /* 
    *停止录屏
    */
    public stop_recorder() {
        if (tt.getSystemInfoSync().platform == "devtools") {
            console.log("********拉起分享成功*************")
            return;
        }
        if (window.tt) {
            console.log("**********ttsdk->stop_recorder->停止录屏*********")
            const recorder = tt.getGameRecorderManager();
            recorder.stop();
        }
    }

    /* 
    *分享录屏
    *参数：分享录屏成功回调函数
    */
    public ShareRecord(sucCallBack, failCall, target?) {
        if (tt.getSystemInfoSync().platform == "devtools") {
            console.log("********拉起分享成功*************")
            return;
        }
        if (window.tt) {
            console.log("ttsdk->ShareRecord->UInfo.record_path", UInfo.record_path)
            tt.shareAppMessage({
                channel: "video",
                title: "快来帮我",
                templateId: TTGameConfig.templateId, // 替换成通过审核的分享ID
                desc: "",
                imageUrl: "",
                query: "",
                extra: {
                    videoPath: UInfo.record_path,
                    videoTopics: ["抖音小游戏", "逆袭大冒险"]
                },
                success() {
                    if (sucCallBack) sucCallBack.call(target)
                },
                fail(e) {
                    console.log("分享视频失败");
                    if (failCall) failCall.call(target)
                }
            })
        }
    }

    showMoreGameModel(call, failCall, target?) {
        if (window.tt) {
            tt.onMoreGamesModalClose(function (res) {
                console.log("modal closed", res);
            });
            // 监听小游戏盒子跳转
            tt.onNavigateToMiniGameBox(function (res) {
                console.log(res.errCode);
                console.log(res.errMsg);
            });

            tt.showMoreGamesModal({
                appLaunchOptions: [
                    {
                        appId: "tt59d92f64c6f31c3a",
                        query: "",
                        extraData: {},
                    },
                    {
                        appId: "tta2a8d4153d92fe56",
                        query: "",
                        extraData: {},
                    },
                    {
                        appId: "ttab7fddc23445f0d1",
                        query: "",
                        extraData: {},
                    },
                    {
                        appId: "tt7f8a0937e0a01c12",
                        query: "",
                        extraData: {},
                    }
                ],

                success(res) {
                    console.log("success", res.errMsg);
                    if (call) call.call(target)
                },
                fail(res) {
                    console.log("fail", res.errMsg);
                    if (failCall) failCall.call(target)
                },
            })
        }
    }

    private wxLogin(callback) {
        tt.login({
            success: (res) => {
                console.log("code ", res.code);
                this._loginCode = res.code;
                evt.emit("wxlogin", res.code);
                if (callback) callback(true);
            }, fail: (res) => {
                if (callback) callback(false);
            }, complete: null
        });
    }

    public startAuth() {
        let self = this;
        return new Promise((resolve, reject) => {
            if (self._version >= 220) {
                self.createButton((ret) => {
                    self.loginToServer(ret);
                    if (ret)
                        resolve(this._UInfo)
                    else
                        reject();
                });
            } else {
                self.oldAuthUser((isAuth) => {
                    if (isAuth) {
                        self.getUInfo((ret) => {
                            self.loginToServer(ret);
                            resolve(this._UInfo)
                        });
                    } else {
                        reject();
                    }
                })
            }
        })
    }

    public checkAuth() {
        if (ttsdk.UInfo) {
            return Promise.resolve(ttsdk.UInfo);
        } else {
            return new Promise((resolve, reject) => {
                tt.getSetting({
                    success: (res) => {
                        let auth = res.authSetting;
                        if (auth["scope.UInfo"]) {
                            this.getUInfo((ret) => {
                                this.loginToServer(ret);
                                resolve(this._UInfo)
                            })
                        } else {
                            // return this.startAuth();
                            resolve(null);
                        }
                    }, fail: null,
                    complete: null,
                });
            })
        }

    }


    private loginToServer(ret) {
        console.log("loginToServer", ret)
        if (ret && ret.UInfo) {
            this._UInfo = ret.UInfo
        }
        evt.emit("wxUInfo", this._UInfo, this._loginCode);
    }

    public login(p) {
        if (!window.tt) return
        let self = this;
        //tt.cloud.init({traceUser: true});
        // this._db = tt.cloud.database({env: "release-2c87c4"});//测试环境
        //this._db = tt.cloud.database();
        self.wxLogin(isLogin => {
            if (!isLogin) return;
            if (p) {
                this.startAuth();
            }
        })
    }

    //发送消息到子域
    public postMessage(cmd, data?) {
        if (window.tt) {
            let req = { cmd }
            if (data) {
                Object.keys(data).forEach(k => {
                    req[k] = data[k]
                })
            }
            tt.getOpenDataContext().postMessage(req);
        }
    }

    public uploadScores(kvs) {
        return new Promise((resolve, reject) => {
            let obj = {
                KVDataList: kvs,
                success: function (d) {
                    resolve(d)
                },
                fail: function () {
                    reject();
                },
                complete: function () { },
            }
            console.warn("-------uploadScores", kvs);
            tt.setUserCloudStorage(obj)
        })
    }

    public uploadScore(k, v, callback?) {
        var kvDataList = new Array();
        kvDataList.push({
            key: k,
            value: v
        });

        let obj = {
            KVDataList: kvDataList,
            success: function (d) {
                if (callback) callback(d)
            },
            fail: function () { },
            complete: function () { },
        }
        tt.setUserCloudStorage(obj)
        // "wxgame": {
        //     "score": 16,
        //     "update_time": 1513080573
        // },
        // "cost_ms": 36500
    }

    public loadBannerAd(callback?) {
        if (Global.bannerAd) {
            Global.bannerAd.destroy()
        }
        if (!this._systemInfo)
            this._systemInfo = tt.getSystemInfoSync();
        var w = this._systemInfo.screenWidth / 2;
        var h = this._systemInfo.screenHeight;
        console.log("**********systemInfo*************", this._systemInfo)
        let isPor = this._systemInfo.screenWidth <= this._systemInfo.screenHeight;
        let fixWidth = isPor ? this._systemInfo.screenWidth : (this._systemInfo.screenHeight / 3);
        let modelStr = this._systemInfo.model
        let isIOS = false;
        if (modelStr) {
            if (modelStr.indexOf("iPhone") != -1) {
                isIOS = true;
            }
        }
        let bannerAd = tt.createBannerAd({
            adUnitId: TTGameConfig.banner_ad_id,
            style: {
                left: 0,
                top: 0,//cc.visibleRect.height
                width: fixWidth
            }
        })
        Global.bannerAd = bannerAd;
        bannerAd.onResize(res => {
            // if (fixWidth != res.width){
            //     bannerAd.style.left = (w - res.width )/ 2 ;
            //     bannerAd.style.top = h - (res.width / 16 * 9)-10;
            // }

            bannerAd.style.left = w - res.width / 2;
            bannerAd.style.top = h - res.height - 10;
        });
        bannerAd.onLoad(() => {
            Global.bannerAdLoadCount = 0;
            if (callback) callback("load", bannerAd);
        });


        // bannerAd.onLoad(() => {
        //     Global.bannerAdLoadCount = 0;
        //     bannerAd.style.left = w - bannerAd.style.realWidth / 2;
        //     if (isIOS) {
        //         bannerAd.style.top = h - bannerAd.style.realHeight -13;
        //     } else {
        //         bannerAd.style.top = h - bannerAd.style.realHeight;
        //     }
        //     if (callback) callback("load", bannerAd)
        // })
        bannerAd.onError((err) => {
            //加载失败
            console.log(
                "ttsdk bannerAd onError code:" + err.errCode + " 当前次数" + Global.bannerAdLoadCount
            );
            console.log("ttsdk bannerAd onError code:" + err.code + " msg:" + err.msg);
            Global.bannerAdLoadCount += 1;
            if (Global.bannerAdLoadCount < 4) {
                this.loadBannerAd(callback);
            }
            Global.bannerAd = null;
            if (callback) callback("error")
        });
    }

    public showBannerAd(errorCallback?): any {
        console.log("ttsdk 显示banner广告", Global.bannerAd)
        if (Global.bannerAd) {
            Global.bannerAd.show();
            Global.isBannerShow = true
            evt.emit("ttsdk.BannerReady")
        } else {
            console.log("ttsdk 不存在banner资源....");
            this.loadBannerAd((v, ad) => {
                if (v == "load") {
                    this.showBannerAd()
                } else if (v == 'error') {
                    errorCallback && errorCallback();
                }
            });
        }
    }

    isBannerShow() {
        return Global.isBannerShow;
    }

    hideBannerAd() {
        if (Global.bannerAd) {
            Global.bannerAd.hide();
            Global.isBannerShow = false;
            // Global.bannerAd = null;
        }
    }

    destroy() {
        if (Global.bannerAd) {
            Global.bannerAd.destroy();
            Global.isBannerShow = false;
            Global.bannerAd = null;
        }
    }

    //interstitial
    showInterstitial(errorCallback) {
        // 创建插屏广告实例，提前初始化
        const isToutiaio = tt.getSystemInfoSync().appName === "Toutiao";
        // 插屏广告仅今日头条安卓客户端支持
        if (isToutiaio) {
            if (Global.interstitialAd) {
                Global.interstitialAd.destroy();
                Global.interstitialAd = null;
            }
            Global.interstitialAd = tt.createInterstitialAd({
                adUnitId: TTGameConfig.interstitial_ad_id
            });
            if (Global.interstitialAd) {
                Global.interstitialAd.load().then(() => {
                    Global.interstitialAd.show();
                }).catch(err => {
                    console.log(err);
                });
                return new Promise(v => {
                    Global.interstitialAd.onClose((res) => {
                        v();
                    })
                })
            }
            return Promise.resolve();
        }
    }

    loadVideoAd(callback) {
        console.log("============ttsdk.loadVideoAD");
        // if (!Global.videoAd ) { //如果没有广告资源就加载新的视频广告
        let self = this;
        let videoAd = Global.videoAd;
        if (!videoAd) {
            videoAd = tt.createRewardedVideoAd({
                adUnitId: TTGameConfig.video_ad_id
            })
            Global.videoAd = videoAd
        } else {
            videoAd.offClose(Global.video_close_callback);
            videoAd.offError(Global.video_error_callback);
            videoAd.offLoad(Global.video_load_callback);
        }
        Global.video_error_callback = function () {
            //加载失败
            Global.videoAdLoadCount += 1;
            //尝试4次
            if (Global.videoAdLoadCount < 4) {
                self.loadVideoAd(callback);
            } else {
                if (callback) callback("error")
            }
        }

        Global.video_close_callback = function (ret) {
            //播放结束
            console.log("ttsdk onClose...");
            Global.videoAdLoadCount = 0
            if (callback) callback("close", ret.isEnded)
        }

        Global.video_load_callback = function () {
            //加载成功
            console.log("ttsdk onLoad");
            Global.videoAd = videoAd;
            Global.videoAdLoadCount = 0;
            // this.showBannerAd();
            if (callback) callback("load", videoAd)
        }
        // 用户触发广告后，显示激励视频广告
        videoAd.show().catch(() => {
            // this.hideBannerAd();
            videoAd.load().then(() => {
                videoAd.show();
                if (callback) callback("show")
            }).catch(err => {
                Global.videoAdLoadCount += 1;
            });
        })
        videoAd.onError(Global.video_error_callback);
        videoAd.onClose(Global.video_close_callback);
        videoAd.onLoad(Global.video_load_callback);
    }

    loadGameBasePoint() {
        let options = tt.getLaunchOptionsSync();
        let mid = '';
        if (options.group_id) {
            mid = options.group_id;
        }
        if (options.scene == '023001' || options.scene == '023002') {
            AliEvent.aliEvent(Platform.AL_event_id.aufromvideo, "");
            Platform.aliEvent(Platform.key_first.aufromvideo, Platform.key_next.videoid, "1");
            tt.reportAnalytics('aufromvideo', {
                videoid: mid,
            });
        }
    }
    aliEvent(name: string, title: string, val?) {
        let arr = this.aliEventData[name];
        let d = {};
        for (let value of arr) {
            d[value] = (value == title && (val || "1")) || '0';
            console.log("*****************", d[value], value, title)
        }
        console.log("*******************埋点", name, d);
        tt.reportAnalytics(name, d);
    }

    private aliEventData = {
        watchVideoOpen: ["tishika", "guoguansibei", "mianfeifuhuo", "pifushangdian", "shenmibaoxiang", "pifushiyong", "jinbizengjia", "haidaotishi", "chaorentishi", "buxiang"],
        watchVideoFinish: ["tishika", "guoguansibei", "mianfeifuhuo", "pifushangdian", "shenmibaoxiang", "pifushiyong", "jinbizengjia", "haidaotishi", "chaorentishi", "buxiang"],
        win_video_ok: [],
        lose_video_ok: [],
        pifushiyong: ["falao", "waimaiyuan", "saiyaren"],
        tongguan: ['tongguo'],
        jinruguanqia: ['jinru'],
        caidanqiang: [],
        chaoren: [],
        anniudianji: ['erbeisu', 'jinbibuzhu', 'renwutujian'],
        haidao: [],
        aufromvideo: ["videoid"]
    }

}

export let ttsdk: TTSdk = new TTSdk();