import Signal from "../core/Signal";
import gUtil from "../core/gUtil";
import { wxsdk } from "./sdks/wxsdk/sdk";
import SpriteFrameCache from "./optimization/SpriteFrameCache";
import { Toast } from "../ui/ToastManager";
import { evt } from "../core/event";
import { GameConfig } from "../../Game/Script/common/configs/GameConfigs";
import { qqsdk } from "./sdks/qq/qqsdk";
import { ttsdk } from "./sdks/ttsdk/ttsdk";
import mmgame from "./mmcloud/mmgame";
import { LocalizationManager } from "../Hi5/Localization/LocalizationManager";
import _Hi5Import from "../Hi5/hi5";
import { Loading } from "../ui/LoadingManager";

// Hi5 모듈 가져오기 (import 실패 시 전역 객체에서 가져옴)
const getHi5Module = () => {
    // 1. import된 모듈 사용
    if (_Hi5Import && typeof _Hi5Import.showAd === 'function') {
        return _Hi5Import;
    }
    // 2. 전역 _Hi5Module에서 가져오기
    if (typeof window !== 'undefined' && window['_Hi5Module'] && typeof window['_Hi5Module'].showAd === 'function') {
        return window['_Hi5Module'];
    }
    // 3. 초기화된 Hi5 객체에서 가져오기
    if (typeof window !== 'undefined' && window['Hi5'] && typeof window['Hi5'].showAd === 'function') {
        return window['Hi5'];
    }
    // 4. cc.pvz.Hi5에서 가져오기 (hi5.js fallback)
    if (typeof cc !== 'undefined' && cc['pvz'] && cc['pvz']['Hi5'] && typeof cc['pvz']['Hi5'].showAd === 'function') {
        return cc['pvz']['Hi5'];
    }
    return null;
};

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return typeof window !== 'undefined' && window['Hi5'] != null;
};

// Hi5 광고 콜백 저장
let hi5AdCallback: Function = null;
let hi5AdTarget: any = null;
let hi5AdFailCallback: Function = null;


enum WxCommands {
    Hide = 99,
    Next,
    RankSmall,
    Rank,
}

export interface ShareInfo {
    title: string,
    imageUrl: string,
    query?: string,
    ald_desc?: string
    // id?:string,
    queryObjects: Object | { id: string },
    share_weight: number,
}
//"{"nickName":"꯭Da꯭m꯭o꯭nR꯭e꯭n","gender":1,"language":"zh_CN","city":"","province":"","country":"中国","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/OAaG3jcYYVFic1vYH3K4Lxaej7OPFl7cVpaACre2ibiaJa21Cz5zUz1K7FH6JNvfZqqlhC2glrDj9ibgofmk2ZqzMQ/132"}"
export interface AuthUserInfo {
    openId: string,
    avatarUrl: string,
    nickName: string,
    city: string,
    gender: number,
    country: string;
    provice: string;
}


export default class Platform {

    static bannnerRefreshEnabled = true;
    static _refreshEnabled = false;
    static onEnterForegroundSignal = new Signal();

    static isAndroid = false
    static isIOS = false;

    static _shareConfig: any;

    static BannerSchedule

    static bannerIsShow: boolean = false;

    // Hi5 광고 리스너 등록 여부
    static _hi5AdListenerRegistered: boolean = false;
    static getOpenID() {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            // wechat 
            let userInfo = wxsdk.userInfo
            if (userInfo && userInfo.openID) {
                return userInfo.openID
            } else {
                return ""
            }
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            return;
        } else {
            return "123"
        }
    }

    static getNick() {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
            return;
        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            return (wxsdk.userInfo && wxsdk.userInfo.nickName) || "自已"
        } else {
            return "玩家自已"
        }
    }

    static getHead() {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
            return;
        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            // avatarUrl:"https://wx.qlogo.cn/mmopen/vi_32/QlHaicGZOD7do9LuX5W4APHYSrUBqVaGULuwISLUf35IyOOYZ3IXl7nF5mW36JiaQ9snziawrAvkknX41SmeYa9AQ/132"city:""country:""gender:1language:"zh_CN"nickName:"Damon Ren⁶⁶⁶"province:""
            let userInfo = wxsdk.userInfo
            if (userInfo && userInfo.avatarUrl) {
                return userInfo.avatarUrl
            } else {
                return "https://tank.wdfunny.com/speed_logo/2.jpg"
            }
        }
        return "https://tank.wdfunny.com/speed_logo/1.jpg"
    }


    static loadSelfHead(sprite) {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
        } else {
            SpriteFrameCache.instance.getSpriteFrame(Platform.getHead()).then(sf => sprite.spriteFrame = sf)
        }
    }

    static exit() {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wx.offShow(Platform.onEnterForeground)
            wx.offHide(Platform.onEnterBackground)
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {

        }
    }

    static configGetSignal: Signal = new Signal();

    static login(p?) {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wxsdk.login(p)
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
        }
    }

    static checkAuth(): Promise<AuthUserInfo> {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            return wxsdk.checkAuth() as any;
        } else {
            let userInfo = {} as AuthUserInfo
            userInfo.avatarUrl = "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1030399321,1493970029&fm=27&gp=0.jpg"
            userInfo.city = "WuHan",
                userInfo.gender = 1,
                userInfo.nickName = 'aliwangzai'
            return Promise.resolve(userInfo);
        }
    }

    /** 解决 排行榜 无法划动问题 */
    static fix_wechat_subContext(subContext: cc.WXSubContextView, self: cc.Component) {
        subContext.node.active = false;
        self.scheduleOnce(_ => {
            subContext.node.active = true
        }, 0.1)
    }

    /**当前玩家 id ，用于分享卡片是带上 */
    static userId: string = '0'
    public static setUserId(id) {
        this.userId = id
    }


    static defaultShareConfig: ShareInfo[] = null;
    static initShare(cfg: ShareInfo[], userId?) {
        this.defaultShareConfig = cfg;
        this.userId = userId;
        this.isAndroid = cc.sys.os == "Android"
        console.log("================= os", cc.sys.os);
        this.isIOS = cc.sys.os == "iOS"
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            wxsdk.showShareMenu(cfg[0]);
            wx.onShow(Platform.onEnterForeground)
            wx.onHide(Platform.onEnterBackground)
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
        }
        this.initUpdate();
    }


    static getGameID() {
        if (cc.sys.QQ_PLAY == cc.sys.platform) {
        }
        return "speed_wanyiwan";
    }


    static getLaunchOptions(): { scene: number, query: Object } {
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            return wx.getLaunchOptionsSync()
        }
        return { scene: 0, query: {} }
    }


    static getCity() {
        return ""
    }


    static doShare(share_cfg: ShareInfo[], callback?, timeout = 3000) {
        this.doShareWithParams(null, share_cfg, callback, timeout)
    }

    static share(calback?) {
        this.doShare(this.defaultShareConfig, calback);
    }


    static doShareWithParams(params, share_cfgs: ShareInfo[], callback?, target?, timeout = 2000) {
        share_cfgs = share_cfgs || this.defaultShareConfig
        let share_cfg;
        if (Array.isArray(share_cfgs)) {
            share_cfg = gUtil.getRandomInArray(share_cfgs) as ShareInfo;
        }
        console.log("######开始分享")
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            let sdk;
            if (window.qq) {
                sdk = qqsdk;
            } else if (window.tt) {
                sdk = ttsdk;
            } else {
                sdk = wxsdk
            }
            params = params || {}
            params.userId = this.userId;
            sdk.openShare(share_cfg, params);
            let t = new Date().getTime()
            Platform.onEnterForegroundSignal.on((obj) => {
                Platform.onEnterForegroundSignal.clear();
                let d = new Date().getTime() - t;
                if (d > timeout) {
                    // if(Math.random() < 0.5)
                    // {
                    setTimeout(_ => {
                        if (callback)
                            callback.call(target, 1);
                    }, 500)
                    // }else{
                    //     if(this.shareCount >= 2){
                    //         this.shareCount = 0;
                    //         setTimeout(_ => {
                    //             if (callback)
                    //                 callback.call(target)
                    //         }, 500)
                    //     }
                    //     else{
                    //         //用户及时返回分享失败 
                    //         Toast.make("分享失败,请尝试换其它群分享")
                    //     }
                    // }
                } else {
                    //用户及时返回分享失败 
                    if (callback)
                        callback.call(target, 0);
                    // Toast.make("分享失败,请尝试换其它群分享")
                }
            })
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {

        } else {
            callback && callback.call(target, 1)
        }
    }


    static _videoEnabled = true;
    static _bannerEnabled = true;

    static setAdEnabled(b) {
        this._videoEnabled = b;
        this._bannerEnabled = b;
    }

    static isVideoAdEnabled(b) {
        return this._videoEnabled
    }

    static isBannerAdEnabled(b) {
        return this._bannerEnabled;
    }

    static sendUmengEvt(title: string, count: string) {
        if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
            jsb.reflection.callStaticMethod("Umeng", "umengEvt:count:", title, count);
        }
    }

    static video_callback: Signal = new Signal();
    static video_failcallback: Signal = new Signal();

    static watch_video(callback, target?, fail_load_callback?, notfinish_callback?) {
        console.log("######Start watching the video")
        if (!this._videoEnabled) return;

        // Hi5 플랫폼 처리
        if (isHi5Platform()) {
            console.log("[Hi5] Showing reward ad");
            hi5AdCallback = callback;
            hi5AdTarget = target;
            hi5AdFailCallback = fail_load_callback;

            // Hi5 광고 결과 이벤트 리스너 등록 (한 번만)
            if (!Platform._hi5AdListenerRegistered) {
                Platform._hi5AdListenerRegistered = true;
                evt.on("Hi5.AdResult", (success: boolean) => {
                    console.log("[Hi5] Ad result received in Platform:", success);
                    cc.audioEngine.resumeMusic();
                    // 로딩 인디케이터 숨기기
                    Loading && Loading.hide();
                    if (success) {
                        console.log("[Hi5] Calling success callback");
                        hi5AdCallback && hi5AdCallback.call(hi5AdTarget);
                    } else {
                        console.log("[Hi5] Calling fail callback");
                        hi5AdFailCallback && hi5AdFailCallback.call(hi5AdTarget);
                    }
                    hi5AdCallback = null;
                    hi5AdTarget = null;
                    hi5AdFailCallback = null;
                });
            }

            cc.audioEngine.pauseMusic();
            // default_ad는 hi5Helper.js에 정의된 기본 광고 ID
            console.log("[Hi5] Loading reward ad");
            const _Hi5 = getHi5Module();
            if (_Hi5) {
                // loadAd 호출 → 내부에서 lastAd 설정 → LOAD_AD 응답 후 showAd 호출됨
                const adConfig = { aid: 'default_ad', key: 'default_ad' };
                _Hi5.loadAd(adConfig);
            } else {
                console.warn("[Hi5] SDK module not available for reward ad");
                fail_load_callback && fail_load_callback.call(target);
            }
            return;
        }

        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            let sdk;
            if (window.qq) {
                sdk = qqsdk;
            } else if (window.tt) {
                sdk = ttsdk;
            } else {
                sdk = wxsdk
            }
            sdk.loadVideoAd((code, isEnded) => {
                if (code == "load") {
                    Platform._refreshEnabled = false;
                } else if (code == 'show') {
                    cc.audioEngine.pauseMusic();
                }
                else if (code == "close") {
                    Platform._refreshEnabled = true;
                    cc.audioEngine.pauseMusic();
                    cc.audioEngine.resumeMusic();
                    if (!isEnded) {
                        Toast.make(LocalizationManager.getText("@text.must_watch_video_to_get_reward"));
                        // Toast.make("必须看完视频,才能获取奖励")
                        notfinish_callback && notfinish_callback.call(target)
                        wx.showModal({
                            title: LocalizationManager.getText("@ImgConfirm.title"), content: LocalizationManager.getText("@text.must_watch_video_to_get_reward2"), showCancel: false
                            // title: "提示", content: "看完广告才能获得奖励哦", showCancel: false
                        })
                    }
                    else {
                        callback && callback.call(target)
                    }
                } else if (code == 'error') {
                    // Toast.make("没有视频,请稍后再试!")
                    fail_load_callback && fail_load_callback.call(target);
                    // this.doShare(WeakNetGame.shareConfigs["default"], callback, target, fail_callback);
                }
            })
        } else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
            cc.audioEngine.setMusicVolume(0);
            // jsb.reflection.callStaticMethod("MoreGameHelper", "setbgmclose","(Ljava/lang/String;)V");
            // if (LocalUser.isInChina) {
            //     jsb.reflection.callStaticMethod("BuadHelper", "showRewardedVideo");
            // } else {
            // jsb.reflection.callStaticMethod("BuadHelper", "showRewardedVideo");
            jsb.reflection.callStaticMethod("TXsdk", "showRewardedVideo");

            // jsb.reflection.callStaticMethod("IronSourceHelper", "showRewardedVideo","(Ljava/lang/String;)V");
            // }
            // if (name) {
            //     let str = JSON.stringify({ "type": name, "result": 1 });
            //     jsb.reflection.callStaticMethod("AppsFlyerHelper", "trackEvent:withValues:","(Ljava/lang/String;)V", "adclick", str);
            // }

            var finishCallback = _ => {
                callback && callback.call(target);
                console.log(callback, name);
                cc.audioEngine.setMusicVolume(1);
                // jsb.reflection.callStaticMethod("MoreGameHelper", "setbgmresuse","(Ljava/lang/String;)V");
                // if (name) {
                //     let str = JSON.stringify({ "type": name, "result": 1 });
                //     console.log("进入埋点上传2")
                //     jsb.reflection.callStaticMethod("AppsFlyerHelper", "trackEvent:withValues:", "ad", str);
                // }
            }
            Platform.video_callback.on(finishCallback);

            var failCallback = _ => {
                cc.audioEngine.setMusicVolume(1);
                // jsb.reflection.callStaticMethod("MoreGameHelper", "setbgmresuse","(Ljava/lang/String;)V");
                fail_load_callback && fail_load_callback.call(target);
            }
            Platform.video_failcallback.on(failCallback);

        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
            //关闭背景

        } else if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            // jsb.reflection.callStaticMethod("com/mimgame/sdk/BytedanceAdSdk", "loadAd", "()V");
            // var finishCallback = _ => {
            //     callback && callback.call(target);
            // }
            // Platform.video_callback.on(finishCallback);
            // var failCallback = _ => {
            //     fail_load_callback && fail_load_callback.call(target);
            // }
            // Platform.video_failcallback.on(failCallback);
            setTimeout(callback.bind(target), 1000);
        }
        else {
            setTimeout(callback.bind(target), 1000);
        }
    }

    static initSDK() {
        if (CC_WECHATGAME) {
            if (window.tt) {
                ttsdk.loadGameBasePoint()
            }
        } else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
            jsb.reflection.callStaticMethod("GDTSdk", "init");
            jsb.reflection.callStaticMethod("Umeng", "init");
        }

    }
    static interstitial_callback: Signal = new Signal();
    static showInterstitial(callback?, target?, errorCallback?) {
        // Hi5 플랫폼 처리 - 전면 광고도 showAd 사용
        if (isHi5Platform()) {
            console.log("[Hi5] Showing interstitial ad");
            hi5AdCallback = callback;
            hi5AdTarget = target;
            hi5AdFailCallback = errorCallback;

            // Hi5 광고 결과 리스너는 watch_video에서 한 번만 등록됨
            if (!Platform._hi5AdListenerRegistered) {
                Platform._hi5AdListenerRegistered = true;
                evt.on("Hi5.AdResult", (success: boolean) => {
                    console.log("[Hi5] Ad result received in Platform:", success);
                    cc.audioEngine.resumeMusic();
                    Loading && Loading.hide();
                    if (success) {
                        console.log("[Hi5] Calling success callback");
                        hi5AdCallback && hi5AdCallback.call(hi5AdTarget);
                    } else {
                        console.log("[Hi5] Calling fail callback");
                        hi5AdFailCallback && hi5AdFailCallback.call(hi5AdTarget);
                    }
                    hi5AdCallback = null;
                    hi5AdTarget = null;
                    hi5AdFailCallback = null;
                });
            }

            cc.audioEngine.pauseMusic();
            console.log("[Hi5] Loading interstitial ad");
            const _Hi5 = getHi5Module();
            if (_Hi5) {
                // loadAd 호출 → 내부에서 lastAd 설정 → LOAD_AD 응답 후 showAd 호출됨
                const adConfig = { aid: 'default_ad', key: 'default_ad' };
                _Hi5.loadAd(adConfig);
            } else {
                console.warn("[Hi5] SDK module not available for interstitial ad");
                errorCallback && errorCallback.call(target);
            }
            return;
        }

        if (!CC_WECHATGAME) return;
        console.log("####Display screen ads");
        // console.log("####显示插屏广告");
        if (CC_DEBUG) {
            console.log("DEBUG Mode skips screen ads");
            callback && callback.call(target);
            return;
        }
        this.hideBannerAd();
        if (CC_WECHATGAME) {
            if (window.qq) {
                return qqsdk.showInterstitial(errorCallback)
            } else if (window.tt) {
                return ttsdk.showInterstitial(errorCallback)
            }
            return wxsdk.showInterstitial(v => {
                if (v == "err") {
                    errorCallback && errorCallback.call(target)
                } else if (v == "notsupport") {
                    errorCallback && errorCallback.call(target)
                } else if (v == "close") {
                    callback && callback.call(target)
                }
            });
        }
        else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
            cc.audioEngine.setMusicVolume(0);
            jsb.reflection.callStaticMethod("TXsdk", "showFullScreeAd");
            var finishCallback = _ => {
                callback && callback.call(target);
                cc.audioEngine.setMusicVolume(1);
                // jsb.reflection.callStaticMethod("MoreGameHelper", "setbgmresuse","(Ljava/lang/String;)V");
                // if (name) {
                //     let str = JSON.stringify({ "type": name, "result": 1 });
                //     console.log("进入埋点上传2")
                //     jsb.reflection.callStaticMethod("AppsFlyerHelper", "trackEvent:withValues:", "ad", str);
                // }
            }
            Platform.interstitial_callback.on(finishCallback);
        }
        else if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            jsb.reflection.callStaticMethod("com/mimgame/sdk/BytedanceAdSdk", "loadFullscreenAd", "()V");
            cc.audioEngine.setMusicVolume(0);

            var finishCallback = _ => {
                callback && callback.call(target);
                console.log(callback, name);
                cc.audioEngine.setMusicVolume(1);
                // jsb.reflection.callStaticMethod("MoreGameHelper", "setbgmresuse","(Ljava/lang/String;)V");
                // if (name) {
                //     let str = JSON.stringify({ "type": name, "result": 1 });
                //     console.log("进入埋点上传2")
                //     jsb.reflection.callStaticMethod("AppsFlyerHelper", "trackEvent:withValues:", "ad", str);
                // }
            }
            Platform.interstitial_callback.on(finishCallback);

        }
    }

    static showGamePortal(errcallback) {
        if (!CC_WECHATGAME) return;
        let portalAd = null;
        console.log("Create recommendation instance-----")
        if (wx.createGamePortal) {
            portalAd = wx.createGamePortal({ adUnitId: GameConfig.portal_id })
        } else {
            console.error('wx.createGamePortal is not supported');
            errcallback && errcallback(0);
        }
        // 在适合的场景显示推荐位
        if (portalAd) {
            portalAd.load().then(() => { portalAd.show() }).catch((err) => {
                console.error('createGamePortal:' + err);
                errcallback && errcallback(1, err);
            })
        }
    }

    static showBannerAd(errorCallback?, style?: { top?: Function, left?: Function }) {
        // Hi5 플랫폼은 배너 광고 미지원
        if (isHi5Platform()) {
            console.log("[Hi5] Banner ads not supported");
            return;
        }

        Platform.autoRefreshBanner(true);
        console.log("######Display banner ads")
        console.log("******************banner callback function", errorCallback)
        if (!this._bannerEnabled) return
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            if (window.qq) {
                return qqsdk.showBannerAd(errorCallback)
            } else if (window.tt) {
                return ttsdk.showBannerAd(errorCallback)
            }
            wxsdk.showBannerAd(errorCallback, style);
        } else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
            jsb.reflection.callStaticMethod("TXsdk", "loadBanner:")

        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
        } else if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            jsb.reflection.callStaticMethod("com/mimgame/sdk/BytedanceAdSdk", "loadBanner", "()V");

        }
        else {
            //pc 
            if (Math.random() < 0.5) {
                //显示 广告失败
                console.log("Display ad failure (simulation)")
                errorCallback && errorCallback();
            }
        }
    }
    /* 
    *开始录屏
    */
    static startRecorder() {
        if (CC_DEBUG) {
            console.log("************* Start Recording")
            return;
        }
        if (window.tt) {
            ttsdk.start_recorder()
        }
    }
    /* 
  *暂停
  */
    static pause_recorder() {
        if (CC_DEBUG) {
            console.log("************* Pause Recording")
            return;
        }
        if (window.tt) {
            ttsdk.pause_recorder()
        }
    }
    /* 
    *继续
    */
    static resume_recorder() {
        if (CC_DEBUG) {
            console.log("************* Resume Recording")
            return;
        }
        if (window.tt) {
            ttsdk.resume_recorder()
        }
    }
    /* 
    *结束录屏
    */
    static stopRecorder() {
        if (CC_DEBUG) {
            console.log("************* Stop Recording")
            return;
        }
        if (window.tt) {
            ttsdk.stop_recorder()
        }
    }
    /* 
    *分享录屏
    */
    static shareRecorder(sucCallBack, failCall?, target?) {
        if (CC_DEBUG) {
            console.log("******** Share Success *************")
            // console.log("拉起分享")
            sucCallBack.call(target)
            return;
            // if (sucCallBack) sucCallBack.call(target)
        }
        if (window.tt) {
            ttsdk.ShareRecord(sucCallBack, failCall, target)
        }
    }

    static isBannerShow() {
        if (CC_WECHATGAME) {
            return wxsdk.isBannerShow()
        }
    }

    static autoRefreshBanner(setType: boolean) {
        if (!CC_WECHATGAME) return;
        let f = function () {
            let result = mmgame.isCheatOpen("banner_refresh");
            if (result) {
                mmgame.markOpen("banner_refresh");
                wxsdk.loadBannerAd(() => {
                    Platform.showBannerAd();
                });
            }
        }
        if (setType) {
            if (!Platform.BannerSchedule) {
                Platform.BannerSchedule = setInterval(f, 1000 * 30);
            }
        } else {
            if (Platform.BannerSchedule) {
                Platform.BannerSchedule = clearInterval(Platform.BannerSchedule);
                Platform.BannerSchedule = null;
            }
        }


    }
    static hideBannerAd() {
        // Hi5 플랫폼은 배너 광고 미지원
        if (isHi5Platform()) return;
        if (!CC_WECHATGAME) return;
        Platform.autoRefreshBanner(false);
        console.log("###### Hide Banner Ad")
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            if (window.qq) {
                qqsdk.hideBannerAd();
                return;
            } else if (window.tt) {
                return ttsdk.hideBannerAd();
            }
            wxsdk.hideBannerAd();
        } else if (cc.sys.QQ_PLAY == cc.sys.platform) {
        } else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
            jsb.reflection.callStaticMethod("TXsdk", "hideBanner");

        } else if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            jsb.reflection.callStaticMethod("com/mimgame/sdk/BytedanceAdSdk", "closeBanner", "()V");

        } else {

        }
    }

    static refreshBannerAd() {
        // Hi5 플랫폼은 배너 광고 미지원
        if (isHi5Platform()) return;
        if (!CC_WECHATGAME) return;
        console.log("Refresh Banner")
        if (CC_WECHATGAME) {
            if (window.qq) {
                qqsdk.loadBannerAd();
                return;
            } else if (window.tt) {
                return ttsdk.destroy();
            }
            wxsdk.loadBannerAd();
        }
    }


    static reloadBannerAd(bShow = false, errcallback?) {
        if (!CC_WECHATGAME) return;
        if (CC_WECHATGAME) {
            wxsdk.hideBannerAd()
            wxsdk.loadBannerAd(v => {
                if (v == "load")
                    if (bShow) {
                        wxsdk.showBannerAd();
                    }
                    else if (v == 'error') {
                        errcallback && errcallback();
                    }
            })
        } else {
            console.log("#### Reload Banner.....")
        }
    }
    static showMoreGameModel(call, failcall, target?) {
        if (!CC_WECHATGAME) return;
        if (window.tt) {
            ttsdk.showMoreGameModel(call, failcall, target)
        }
    }
    static initBannerAd(b = 1) {
        if (!CC_WECHATGAME) return;
        if (b == 0) return;
        if (cc.sys.QQ_PLAY == cc.sys.platform) {

        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            setInterval(_ => {
                if (Platform.bannnerRefreshEnabled && Platform._refreshEnabled) {
                    console.log("###### Load WX Banner Ad")
                    wxsdk.hideBannerAd()
                    wxsdk.loadBannerAd(v => {
                        if (v == "load")
                            wxsdk.showBannerAd();
                    })
                }
            }, 40000)
        }
    }

    static jumpTo() {
        // var desGameId = 1234; //跳转的gameid，必须为数字
        // var extendInfo = ""; //额外参数，必须为字符串
        // BK.QQ.skipGame(desGameId, extendInfo);
    }

    static showRankDialog() {
        console.log("[Platform]# Show Rank Dialog");
        Toast.make("#[Platform]#showRankDialog")

        // vm.show("Game/RankDialog")
    }

    // Andriod 发送游戏快捷方式到桌面

    static onEnterForeground(obj?) {
        console.log("=====================onEnterForeground=====================")
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            //onEnterForeground
            // Device.resumeMusic()
            cc.audioEngine.resumeMusic()
        } else {
            // cc.audioEngine.resumeMusic()
        }
        Platform.onEnterForegroundSignal.fire(obj);
        evt.emit("onEnterForeground")
    }

    static onEnterBackground() {
        // BK.onEnterBackground(enterBackgroundListener);
        // if (cc.sys.platform == cc.sys.QQ_PLAY) {

        // } else {
        //     cc.audioEngine.pauseMusic()
        // }
        evt.emit("onEnterBackground")
    }

    static onGameExit() {
        // BK.onGameClose(gameCloseListener);
    }

    static sendMessageToOpen(cmd, data) {
        if (CC_WECHATGAME) {
            wxsdk.postMessage(cmd, data);
        }
    }
    static showSmallRank(rankName, rankType) {
        wxsdk.postMessage(WxCommands.RankSmall, { rankName, rankType });
    }

    static showRank(rankName, rankType) {
        wxsdk.postMessage(WxCommands.Rank, { rankName, rankType });
    }

    static hideRank() {
        wxsdk.postMessage(WxCommands.Hide)
    }

    static getRankList(callback, target?) {
        console.log("[Platform]#获取排行榜数据");
        if (cc.sys.platform == cc.sys.QQ_PLAY) {

        } else if (cc.sys.platform == cc.sys.WECHAT_GAME) {

        }
    }
    static uploadScores(kvs: { key: string, value: string }[]) {
        console.log("[Platform]#上传分数");
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
        } else if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            // wxsdk.postMessage(WxCommands., score);
            return wxsdk.uploadScores(kvs);
        } else {
            return Promise.resolve({})
            // Toast.make("#[Platform]#uploadScore")
        }
    }


    private static _launch_options: LaunchOption;
    public static get launch_options(): LaunchOption {
        if (!CC_WECHATGAME) {
            return null;
        }
        if (this._launch_options == null) {
            this._launch_options = wx.getLaunchOptionsSync();
        }
        return this._launch_options;
    }

    public static matchPath(cfg: string | number) {
        // ald_link_key
        //ald_media_id
        //ald_position_id
        // let t = '?ald_media_id=15641&ald_link_key=8ebc0645ddba0996&ald_position_id=0,?ald_media_id=15641&ald_link_key=8ebc0645ddba0996&ald_position_id=0'
        if (this.launch_options == null) return false;
        let s = cfg + ""
        let arr = s.split(/[,\s]+/)
        return arr.some(a => {
            let kvs = a.split(/[\?&@\*]/)
            kvs = kvs.filter(v => v != '')
            //是否解析出来的k和 launch option query 对象key 对应的值相等
            return kvs.every(kv => {
                let [k, v] = kv.split('=')
                let rv = this.launch_options.query[k]
                if (rv == undefined && v == undefined) return false;
                return rv == v;
            })
        })
    }
    static loadSubPackage(name, progress?) {
        if (CC_WECHATGAME) {
            if (window.wx) {
                return new Promise<void>((resolve, reject) => {
                    let id_interval = 0;
                    const loadTask = wx.loadSubpackage({
                        name: name,
                        success: function () {
                            clearInterval(id_interval);
                            resolve();
                        },
                        fail: function (e) {
                            clearInterval(id_interval);
                            reject(e + ":" + name)
                        }
                    })
                    let c = 0;
                    id_interval = setInterval(v => {
                        c += 5
                        progress && progress(c, c, 100);
                        if (c >= 100) {
                            clearInterval(id_interval);
                        }
                    }, 20)
                    loadTask.onProgressUpdate(res => {
                        if (id_interval != 0) {
                            clearInterval(id_interval)
                            id_interval = 0;
                        }
                        progress && progress(res.progress, res.totalBytesWritten, res.totalBytesExpectedToWrite)
                        // console.log('下载进度', res.progress)
                        // console.log('已经下载的数据长度', res.totalBytesWritten)
                        // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
                    })
                })
            }
        } else {
            return new Promise<void>(resolve => {
                let c = 0;
                let id = setInterval(v => {
                    c += 10
                    progress && progress(c, c, 100);
                    if (c >= 100) {
                        clearInterval(id);
                        resolve();
                    }
                }, 50)
            })
        }
    }

    static initUpdate() {
        if (CC_WECHATGAME) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate((res) => {
                // 请求完新版本信息的回调
                console.log(res.hasUpdate)
            })

            updateManager.onUpdateReady(function () {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    success(res) {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate()
                        }
                    }
                })
            })

            updateManager.onUpdateFailed(function () {
                // 新版本下载失败
            })
        }


    }

    static _userInfo: any;

    public static updateRank(value: string | number) {
        if (CC_WECHATGAME) {
            wx.setUserCloudStorage({
                KVDataList: [{
                    key: 'level',
                    value: value.toString()
                }],
                success: function success(res) {
                    console.log("wx.setUserCloudStorage success", res);
                },
                fail: function fail(res) {
                    console.log("wx.setUserCloudStorage fail", res);
                },
                complete: null
            });
        }
    }

    static postMessage(str: string) {
        if (CC_WECHATGAME) {
            wx.getOpenDataContext().postMessage({
                message: str
            });
        }
    }

    static async getUserInfo(): Promise<any> {
        if (CC_WECHATGAME) {
            let self = Platform;
            if (self._userInfo) return self._userInfo;
            await self._getUserInfo();
            return self._userInfo;
        }
        return null;
    }

    static async _getUserInfo() {
        let self = Platform;
        let setting = await self._getSetting();
        if (setting["scope.userInfo"] == true) {
            return new Promise<void>((resolve, reject) => {
                wx.getUserInfo({
                    withCredentials: false,
                    lang: null,
                    success: function (res) {
                        self._userInfo = res.userInfo;
                        resolve();
                    },
                    fail: null,
                    complete: null,
                });
            });
        }
        return null;

    }

    static _getSetting() {
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: function (res) {
                    console.log(res.authSetting);
                    resolve(res.authSetting);
                },
                fail: function () {
                    resolve({});
                },
                complete: null
            })
        })
    }

    static _userInfoButton;
    static _userInfoButtonCall;

    static showUserInfoButton(data: { left: number, top: number }, callback: (data) => any) {
        if (CC_WECHATGAME) {
            let self = Platform;
            let button = self._userInfoButton;
            self._userInfoButtonCall = callback;
            if (button) {
                button.show();
                return;
            }
            self._createUserInfoButton(data);
        }
    }

    static hideUserInfoButton() {
        let button = Platform._userInfoButton;
        button && button.hide()
    }

    static _createUserInfoButton(data: { left: number, top: number }) {
        let self = Platform;
        let info = wx.getSystemInfoSync();
        let button = self._userInfoButton = wx.createUserInfoButton({
            type: 'text',
            text: '',
            style: {
                left: info.windowWidth * data.left,
                top: info.windowHeight * data.top,
                width: 120,
                height: 25,
                lineHeight: 25,
                // backgroundColor: '#ffffff',
                color: '#000000',
                textAlign: 'center',
                fontSize: 12,
                borderRadius: 4
            },
            withCredentials: false
        });
        button.onTap((res) => {
            self._userInfoButtonCall && self._userInfoButtonCall(res.userInfo);
            self._userInfoButtonCall = null;
            if (res.errMsg == 'getUserInfo:fail auth deny')
                console.log(res)
        })
    }


    public static gc() {
        if (CC_WECHATGAME) {
            //trigger gc 
            wx.triggerGC()
        }
    }

}
