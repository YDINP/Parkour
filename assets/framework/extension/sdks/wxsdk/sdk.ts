import { evt } from "../../../core/event";

import Signal from "../../../core/Signal";
import { SDKBase } from "../SDKInterafce";

class Global {
    static videoAd = undefined
    static bannerAd = undefined
    static interstitialAd = undefined
    static isBannerShow = false;
    static videoAdLoadCount = 0 //视频广告加载次数
    static bannerAdLoadCount = 0 //banner广告加载次数
    static video_close_callback: (ret: any) => void;
    static video_error_callback: () => void;
    static video_load_callback: () => void;
}



export interface ShareInfo {
    title: string,
    imageUrl: string,
    query?: string,
    ald_desc?: string

    id?: string,
    queryObjects: Object
}

class WxSdk extends SDKBase {
    _userInfo: any = null;
    _loginCode: any;
    _version: number;
    _systemInfo: SystemInfo;
    isIOS: boolean = false;

    bannerSchedule: any = null;
    bannerIsShow: boolean = false;

    public get userInfo() { return this._userInfo }

    public get parent() {
        if (!CC_WECHATGAME) return ""
        let info = wx.getLaunchOptionsSync();
        if (info.scene == 1007 || info.scene == 1008) {//通过分享进入游戏
            let openId = info.query["user_id"];
            return openId
        }
        return ""; //默认
    }

    constructor() {
        super();
        if (CC_WECHATGAME) {
            if (this._version == null) {
                this._systemInfo = wx.getSystemInfoSync();
                let ver = this._systemInfo.SDKVersion.replace(/\./g, "")
                this._version = parseInt(ver);
            }
            let modelStr = this._systemInfo.model
            this.isIOS = false;
            if (modelStr) {
                if (modelStr.indexOf("iPhone") != -1) {
                    this.isIOS = true;
                }
            }
        }
    }

    compareVersion(v1, v2) {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }

        return 0
    }


    /**
     * 打开分享
     * @param share_cfg {ShareInfo}
     */
    async openShare(share_cfg: ShareInfo, params?) {
        if (!gUtil.iswxgame()) return;
        let info = {} as ShareInfo;
        console.log("sdsdsd", info, info.title);

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
            if (wx.aldShareAppMessage) {
                wx.aldShareAppMessage(info);
            } else {
                wx.shareAppMessage(info);
            }
        }
    }

    private createButton(callback, x?, y?, width?, height?) {
        console.log("-------------createButton");
        let button = wx.createUserInfoButton({
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


    private getUserInfo(callback) {
        console.warn("-------------getUserInfo");
        wx.getUserInfo({
            withCredentials: true,
            lang: "zh_CN",
            success: (res) => {
                console.log("getUserInfo success.", res);
                if (callback) callback(res);
            }, fail: (res) => {
                console.log("getUserInfo:", res);
                if (callback) callback(null);
            },
            complete: null
        });
    }

    oldAuthUser(callback) {
        wx.authorize({
            scope: "scope.userInfo",
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
        wx.showShareMenu({
            withShareTicket: true,
            success: (res) => {
                console.log(res);
            }, fail: (res) => {
                console.log(res);
            }, complete: null
        });
        let onShare = wx.aldOnShareAppMessage || wx.onShareAppMessage;
        onShare(function () {
            // let content =  {title:GameConfig.default_share_title,imageUrl:cc.url.raw(GameConfig.deafult_share_imgUrl)}
            return cf;
        });
    }


    private wxLogin(callback) {
        wx.login({
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
                        resolve(this._userInfo)
                    else
                        reject();
                });
            } else {
                self.oldAuthUser((isAuth) => {
                    if (isAuth) {
                        self.getUserInfo((ret) => {
                            self.loginToServer(ret);
                            resolve(this._userInfo)
                        });
                    } else {
                        reject();
                    }
                })
            }
        })
    }

    public checkAuth() {
        if (wxsdk.userInfo) {
            return Promise.resolve(wxsdk.userInfo);
        } else {
            return new Promise((resolve, reject) => {
                wx.getSetting({
                    success: (res) => {
                        let auth = res.authSetting;
                        if (auth["scope.userInfo"]) {
                            this.getUserInfo((ret) => {
                                this.loginToServer(ret);
                                resolve(this._userInfo)
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
        if (ret && ret.userInfo) {
            this._userInfo = ret.userInfo
        }
        evt.emit("wxUserInfo", this._userInfo, this._loginCode);
    }

    public login(p) {
        if (!CC_WECHATGAME) return
        let self = this;
        //wx.cloud.init({traceUser: true});
        // this._db = wx.cloud.database({env: "release-2c87c4"});//测试环境
        //this._db = wx.cloud.database();
        self.wxLogin(isLogin => {
            if (!isLogin) return;
            if (p) {
                this.startAuth();
            }
        })
    }

    //发送消息到子域
    public postMessage(cmd, data?) {
        if (CC_WECHATGAME) {
            let req = { cmd }
            if (data) {
                Object.keys(data).forEach(k => {
                    req[k] = data[k]
                })
            }
            wx.getOpenDataContext().postMessage(req);
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
            wx.setUserCloudStorage(obj)
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
        wx.setUserCloudStorage(obj)
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
            this._systemInfo = wx.getSystemInfoSync();
        var w = this._systemInfo.screenWidth / 2;
        var h = this._systemInfo.screenHeight;

        let isPor = this._systemInfo.screenWidth <= this._systemInfo.screenHeight;
        let fixWidth = isPor ? this._systemInfo.screenWidth : (this._systemInfo.screenHeight / 3);
        let bannerAd = wx.createBannerAd({
            adUnitId: SDKBase.gameConfig.banner_ad_id,
            style: {
                left: 0,
                top: 0,//cc.visibleRect.height
                width: fixWidth
            }
        })
        Global.bannerAd = bannerAd;

        bannerAd.onLoad(() => {
            Global.bannerAdLoadCount = 0;
            // bannerAd.style.left = w - bannerAd.style.realWidth / 2;
            if (this.isIOS) {
                bannerAd.style.top = h - bannerAd.style.realHeight - 13;
            } else {
                bannerAd.style.top = h - bannerAd.style.realHeight;
            }
            if (callback) callback("load", bannerAd)
        })
        bannerAd.onError((err) => {
            //加载失败
            console.log("wxsdk bannerAd onError code:" + err.code + " msg:" + err.msg);
            Global.bannerAdLoadCount += 1;
            if (Global.bannerAdLoadCount < 4) {
                this.loadBannerAd(callback);
            }
            Global.bannerAd = null;
            if (callback) callback("error")
        });
    }

    public showBannerAd(errorCallback?, style?: { left?: Function, top?: Function }): any {

        console.log("Wxsdk 배너 광고 표시", Global.bannerAd)
        if (Global.bannerAd) {
            let banner = Global.bannerAd;
            banner.show();


            var w = this._systemInfo.screenWidth;
            var h = this._systemInfo.screenHeight;

            if (style) {
                if (style.top) {
                    banner.style.top = style.top(banner.style, w, h) || 0;
                } else {
                    if (this.isIOS) {
                        banner.style.top = h - banner.style.realHeight - 13;
                    } else {
                        banner.style.top = h - banner.style.realHeight;
                    }
                }
                if (style.left) {
                    banner.style.left = style.left(banner.style, w, h) || 0;
                } else {
                    banner.style.left = w / 2 - banner.style.realWidth / 2;
                }
            } else {
                banner.style.left = w / 2 - banner.style.realWidth / 2;
                if (this.isIOS) {
                    banner.style.top = h - banner.style.realHeight - 13;
                } else {
                    banner.style.top = h - banner.style.realHeight;
                }
            }
            Global.isBannerShow = true
            evt.emit("wxsdk.BannerReady")
        } else {
            console.log("Wxsdk 배너 리소스 없음....");
            this.loadBannerAd((v, ad) => {
                if (v == "load") {
                    this.showBannerAd(style)
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

    //interstitial
    showInterstitial(errorCallback) {
        // 创建插屏广告实例，提前初始化
        if (wx.createInterstitialAd) {
            Global.interstitialAd = wx.createInterstitialAd({
                adUnitId: SDKBase.gameConfig.interstitial_ad_id
            })
        }
        else {
            console.log("전면 광고 미지원")
            errorCallback && errorCallback('notsupport')
        }
        // 在适合的场景显示插屏广告
        if (Global.interstitialAd) {
            Global.interstitialAd.show().catch((err) => {
                console.error(err)
                errorCallback && errorCallback("err", err);
            })
            Global.interstitialAd.onClose((res) => {
                errorCallback && errorCallback("close");
            })
        }

    }

    loadVideoAd(callback) {
        console.log("============wxsdk.loadVideoAD");
        // if (!Global.videoAd ) { //如果没有广告资源就加载新的视频广告
        let self = this;
        let videoAd = Global.videoAd;
        if (!videoAd) {
            videoAd = wx.createRewardedVideoAd({
                adUnitId: SDKBase.gameConfig.video_ad_id
            })
        } else {
            videoAd.offClose(Global.video_close_callback);
            videoAd.offError(Global.video_error_callback);
            videoAd.offLoad(Global.video_load_callback);
        }
        Global.video_error_callback = function () {
            //加载失败
            Global.videoAdLoadCount += 1;
            //尝试4次
            if (Global.videoAdLoadCount < 1) {
                self.loadVideoAd(callback);
            } else {
                if (callback) callback("error")
            }
        }

        Global.video_close_callback = function (ret) {
            //播放结束
            console.log("wxsdk onClose...");
            Global.videoAdLoadCount = 0
            if (callback) callback("close", ret.isEnded)
            Global.videoAd = null;
        }

        Global.video_load_callback = function () {
            //加载成功
            console.log("wxsdk onLoad");
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
        Global.videoAd = videoAd
    }

    /**
     一次性模板 id 和永久模板 id 不可同时使用。
    低版本基础库2.4.4~2.8.3 已支持订阅消息接口调用，仅支持传入一个一次性 tmplId / 永久 tmplId。
    2.8.2 版本开始，用户发生点击行为或者发起支付回调后，才可以调起订阅消息界面。
    2.10.0 版本开始，开发版和体验版小游戏将禁止使用模板消息 fomrId。*/
    requestSubscribeMessage() {
        // if (!g.iswxgame()) return;
        const version = wx.getSystemInfoSync().SDKVersion
        if (CC_DEBUG || wxsdk.compareVersion(version, '2.8.4') > 0) {
            return new Promise((resolve, reject) => {
                wx.requestSubscribeMessage({
                    tmplIds: SDKBase.gameConfig.tmplIds,
                    success(res) {
                        console.log(res)
                        let ids = [];
                        this._gameConf.tmplIds.map((item, index) => {
                            if (res[item] == "accept") {
                                ids.push(item);
                            }
                        })
                        resolve(ids);
                    },
                    fail(err) {
                        wx.showModal({
                            title: '失败提示',
                            content: "错误信息：" + err.errMsg + "错误码：" + err.errCode
                        })
                        reject(err.errCode)
                    }
                })
            })
        }
        else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    }

    //客服
    openCustomerServiceConversation(callback, failCallback) {
        if (CC_DEBUG) {
            callback && callback();
            return;
        }
        // if (!g.iswxgame()) return;
        const version = wx.getSystemInfoSync().SDKVersion
        if (wxsdk.compareVersion(version, '2.0.3') > 0) {
            wx.openCustomerServiceConversation({
                showMessageCard: true,
                sendMessageTitle: "帮她脱险",
                sendMessageImg: "https://www.mimgame.com/games/helpher/share/customer-claim.png",
                success: function (data) {
                    console.log("success =", data)
                    callback && callback();
                },

                fail: function (data) {
                    console.log("fail =", data)
                    failCallback && failCallback();
                },

                complete: function (data) {
                    console.log("complete =", data)
                }
            })
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    }








    /** -----播放视频  开始------ */
    private desurl = ''
    /** 普清 */
    showVideo(avid, url) {
        console.log('showVideo ===>')
        this.desurl = url
        var self = this
        let start_url = `https://vv.video.qq.com/getinfo?vids=${avid}&platform=101001&charge=0&otype=json&defn=shd`
        console.log('start_url  ', start_url)
        return new Promise((resolve => {

            window['wx'].request({
                url: start_url,
                success: function (res) {
                    var dataJson = res.data.replace(/QZOutputJson=/, '') + "qwe";
                    var dataJson1 = dataJson.replace(/;qwe/, '');
                    var data = JSON.parse(dataJson1);
                    console.log('data  ', data)
                    if (data['em']) {
                        console.log('getVideoInfoB error  ===========>> !!!!!  em', data['em'])
                        return self.goSafeVideo(self.desurl)
                    }
                    else {
                        let theurl = data['vl']['vi'][0]['ul']['ui'][0]['url']
                            + data['vl']['vi'][0]['fn']
                            + "?vkey="
                            + data['vl']['vi'][0]['fvkey']
                        console.log('theurl   ', theurl)
                        return self.goFreeVideo(theurl)
                    }
                },
                fail: function () {
                    console.log('getVideoInfoB error  ===========>> !!!!!')
                    return self.goSafeVideo(self.desurl)
                }
            })
        }))
    }

    /** 高清 */
    showVideoG(avid, url?: string): Promise<any> {
        console.log('showVideo ===>')
        if (url)
            this.desurl = url.toString()
        var self = this
        let start_url = `https://vv.video.qq.com/getinfo?vids=${avid}&platform=101001&charge=0&otype=json&defn=shd`
        console.log('start_url  ', start_url)
        let signal = new Signal();
        window['wx'].request({
            url: start_url,
            success: function (res) {
                var dataJson = res.data.replace(/QZOutputJson=/, '') + "qwe";
                var dataJson1 = dataJson.replace(/;qwe/, '');
                var data = JSON.parse(dataJson1);
                console.log('data  ', data)
                if (data['em']) {
                    console.log('getVideoInfoB error  ===========>> !!!!!  em', data['em'])
                    self.goSafeVideo(self.desurl).then(v => signal.fire()).catch(v => signal.cancel())
                    // signal.cancel();
                }
                else {
                    let gUrl = `https://vv.video.qq.com/getkey?format=2&otype=json&vt=150&vid=${avid}&ran=0\%2E9477521511726081\\&charge=0&filename=${avid}.mp4&platform=11`
                    window['wx'].request({
                        url: gUrl,
                        success: function (res1) {
                            var dataJson2 = res1.data.replace(/QZOutputJson=/, '') + "qwe";
                            var dataJson3 = dataJson2.replace(/;qwe/, '');
                            var data1 = JSON.parse(dataJson3);
                            console.log('data1   ', data1)
                            let theurl = data['vl']['vi'][0]['ul']['ui'][0]['url']
                                + `${avid}.mp4`
                                + "?vkey="
                                + data1['key']

                            console.log('theurl   ', theurl)
                            self.goFreeVideo(theurl).then(v => signal.fire()).catch(v => signal.cancel())
                        },
                        fail: function () {
                            console.log('getkey error  ===========>> !!!!!')
                            self.goSafeVideo(self.desurl).then(v => signal.fire()).catch(v => signal.cancel())
                            // signal.cancel()
                        }
                    })
                }
            },
            fail: function () {
                console.log('getVideoInfoB error  ===========>> !!!!!')
                // signal.cancel()
                self.goSafeVideo(self.desurl).then(v => signal.fire()).catch(v => signal.cancel())
            }
        })
        return signal.wait();
    }

    //oss  地址

    /** oss备份 */
    goSafeVideo(url: string): Promise<any> {
        console.log('goVideo  ===>  ', url)
        if (!url) return Promise.resolve();
        let wx = window['wx'];
        let signal = new Signal();
        if (wx) {
            let sys = this.getSystemInfo();
            let video = wx.createVideo({
                x: 0,
                y: 0,
                width: sys.windowWidth,
                height: sys.windowHeight,
                src: url,
                objectFit: 'fill',
                controls: true,
                autoplay: true,
                showCenterPlayBtn: false,
                enableProgressGesture: false
            })
            video.requestFullScreen()


            video.onEnded(res => {
                console.log('재생 완료')
                video.destroy()
                // Game.Inst.showResult()
                signal.fire();
            })

            video.onError(errMsg => {
                video.destroy()
                this.goSafeVideo(url)
                signal.cancel();
                return
            })

        } else {
        }
        return signal.wait();
    }

    /** 免费视频 */
    goFreeVideo(url): Promise<any> {
        var self = this
        let wx = window['wx']
        if (wx) {
            let sys = this.getSystemInfo();
            let video = wx.createVideo({
                x: 0,
                y: 0,
                width: sys.windowWidth,
                height: sys.windowHeight,
                src: url,
                // poster: posterUrl,
                objectFit: 'contain',
                controls: true,
                autoplay: true,
                showCenterPlayBtn: false,
                enableProgressGesture: false
            })
            video.requestFullScreen()
            let signal = new Signal();
            video.onEnded(res => {
                console.log('재생 완료')
                video.destroy()
                signal.fire();
            })

            video.onError(errMsg => {
                console.log('goNewVideo  error  ===========>> !!!!!')
                video.destroy()
                self.goSafeVideo(self.desurl)
                return
            })
            return signal.wait();

        }
        return Promise.resolve();
    }
    /** -----播放视频  结束-----*/

    getSystemInfo(): SystemInfo {
        if (!this._systemInfo)
            this._systemInfo = wx.getSystemInfoSync();
        return this._systemInfo;
    }

}

export let wxsdk: WxSdk = new WxSdk();