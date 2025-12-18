import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Platform from "../../../framework/extension/Platform";
// import { wxsdk } from "../../../framework/extension/sdks/wxsdk/sdk"; // Hi5로 대체
import ViewManager from "../../../framework/ui/ViewManager";
import actionUtil from "../../../framework/utils/actionUtil";
import { GameConfig } from "./configs/GameConfigs";
import Cloud from "../../../framework/extension/mmcloud/Cloud";
import { SDKBase } from "../../../framework/extension/sdks/SDKInterafce";
import mmgame from "../../../framework/extension/mmcloud/mmgame";
import AliEvent from "../../../framework/extension/AliEvent";
import BuffSystem from "../../../framework/extension/buffs/BuffSystem";
import { pdata } from "../data/PlayerInfo";
import _Hi5Import from "../../../framework/Hi5/Hi5";
// g.js는 플러그인 스크립트로 자동 로드되므로 명시적 import 불필요
// 에디터 환경에서는 require가 작동하지 않으므로 import 제거

// Hi5 모듈 가져오기 (import 실패 시 전역 객체에서 가져옴)
const getHi5Module = () => {
    // 1. import된 모듈 사용
    if (_Hi5Import && typeof _Hi5Import.SaveData === 'function') {
        return _Hi5Import;
    }
    // 2. 전역 _Hi5Module에서 가져오기
    if (typeof window !== 'undefined' && window['_Hi5Module'] && typeof window['_Hi5Module'].SaveData === 'function') {
        return window['_Hi5Module'];
    }
    // 3. 초기화된 Hi5 객체에서 가져오기
    if (typeof window !== 'undefined' && window['Hi5'] && typeof window['Hi5'].SaveData === 'function') {
        return window['Hi5'];
    }
    // 4. cc.pvz.Hi5에서 가져오기 (hi5.js fallback)
    if (typeof cc !== 'undefined' && cc['pvz'] && cc['pvz']['Hi5'] && typeof cc['pvz']['Hi5'].SaveData === 'function') {
        return cc['pvz']['Hi5'];
    }
    return null;
};

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return typeof window !== 'undefined' && window['Hi5'] != null;
};

const { ccclass, property } = cc._decorator;


function openUI(node: cc.Node): Promise<void> {
    let dur = 0.2
    node.opacity = 0;
    return new Promise(resolve => {
        cc.tween(node).to(0.01, { scale: 1.3 }).to(dur, { opacity: 255, scale: 1 }, { easing: "backOut" }).call(() => {
            resolve();
        }).start()
    })
}


function closeUI(node: cc.Node, callback: Function, target) {
    let dur = 0.2
    cc.tween(node).to(dur, { opacity: 0, scale: 1.2 }, { easing: "sineOut" }).call(callback.bind(target)).start();
}

@ccclass
export default class PersistNode extends cc.Component {

    isNewUser: boolean = true;

    onLoad() {
        cc.game.addPersistRootNode(this.node)
        cc.game.on(cc.game.EVENT_SHOW, this.onShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onHide, this)
        cc.view.enableAntiAlias(false);
        ViewManager.setHideFunc(closeUI)
        ViewManager.setShowFunc(openUI)
        Device.setAudioPath("Audio/")
        SDKBase.initConfig(GameConfig);
        AliEvent.init(GameConfig.appId);

        let buffSystem = this.getComponent(BuffSystem);
        if (!buffSystem) {
            buffSystem = this.addComponent(BuffSystem);
        }

        cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL_TMX = 1;

        cc.macro.CLEANUP_IMAGE_CACHE = false;
        cc.dynamicAtlasManager.enabled = true;
        
        cc.dynamicAtlasManager.maxFrameSize = 2048;


        csv.setParser((type, value) => {
            // berry[100, 200, 300, 400, 500, 600]
            if (type == "dui") {
                if (typeof (value) == "string") {
                    let vs = value.split(/(\w+)\[(.+)\]/)
                    let name = vs[1], countPrices = vs[2].split(",").map(v => parseInt(v));
                    return { id: name, countPrices: countPrices }
                }
                return null;
            }
        })

        evt.on("wxsdk.BannerReady", this.onBannerReady, this);
        evt.on("View.onShow", this.onViewShow, this)
        evt.on("View.onHidden", this.onViewHidden, this)
        evt.on("Loading.Success", this.onLoadingSuccess, this);

        BuffSystem.main.startBuff("heartRecovery", 9999999999)

        console.log("*********动态合图************")
        console.log(cc.macro.CLEANUP_IMAGE_CACHE)
    }



    onViewShow(view) {
        if (!csv.Config) return;
        if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(view.node.name) != -1) {
            console.log(view.node.name + "Display banner")
            Platform.showBannerAd();
        } else {
            console.log(view.node.name + "Hide banner")
            Platform.hideBannerAd();
        }
    }

    onViewHidden(view) {
        if (!csv.Config) return;
        if (csv.Config.BannerAdWhiteList && csv.Config.BannerAdWhiteList.indexOf(view.node.name) != -1) {
            console.log(view.node.name + "Hide banner")
            Platform.hideBannerAd();
        }
        if (csv.Config.BannerAdRefreshWhiteList && csv.Config.BannerAdRefreshWhiteList.indexOf(view.node.name) != -1) {
            console.log(view.node.name + "Refresh banner")
            Platform.refreshBannerAd();
        }
    }

    onBannerReady() {
        if (ViewManager.instance) {
            ViewManager.instance.allViews.forEach(v => {
                if (v.node.active) {
                    if (csv.Config.BannerAdWhiteList.indexOf(v.node.name) == -1) {
                        //没有在白名单里的要隐藏 
                        console.log("Not in the white list, close banner ad!")
                        Platform.hideBannerAd();
                    }
                }
            })
        }

    }

    onShow(a) {
        // Cloud.reload()
        // if (CC_WECHATGAME) {
        //     // 个人聊天 卡片1007， 群聊天 卡片 1008 , 1044 
        //     //点自已的卡片
        //     console.log(a.query.share_link, a.query.uuid, WeakNetGame.sharedUUIDs)
        //     if (a.query.share_link == "true" && WeakNetGame.isValidShare(a.query.uuid)) {
        //         if (a.scene == 1007) {
        //             vm.show("Prefab/UI/UIShareLink", "点击个人的分享链接不会获得奖励哟~请分享到微信群吧！")
        //             console.log("链接分享：个人")
        //         }
        //         else {
        //             if (a.scene == 1008 || a.scene == 1044) {
        //                 console.log("链接分享：群", a.scene)
        //                 if (WeakNetGame.isClaimedShare(a.query.uuid)) {
        //                     vm.show("Prefab/UI/UIShareLink", "短时间内，不能点击相同群的分享链接！请分享到其他群吧！")
        //                 } else {
        //                     WeakNetGame.claimShare(a.query.uuid);
        //                     vm.hide("Prefab/UI/UIShareLink")
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    onHide() {
        if (!CC_DEBUG) {
            // UserInfo.save(null, true);
        }

        // Hi5 앱 숨김 시 데이터 저장
        if (isHi5Platform()) {
            const _Hi5 = getHi5Module();
            if (_Hi5) {
                _Hi5.SaveData();
                console.log("[Hi5] SaveData called on app hide");
            }
        }

        Platform.refreshBannerAd();
        this.unschedule(this.time30);
        this.unschedule(this.time45);
        this.unschedule(this.time60);
    }

    start() {
        let isn = localStorage.getItem("UserInfo.guide")
        if (isn == null || isn == "") {
            this.isNewUser = true
        } else {
            this.isNewUser = false;
        }
        if (this.isNewUser) {
            //开始加载
            //StatHepler.userAction("开始加载")
        }

    }

    onLoadingSuccess() {
        if (this.isNewUser) {
            this.scheduleOnce(this.time30, 30);
            this.scheduleOnce(this.time45, 45);
            this.scheduleOnce(this.time60, 60);
            //StatHepler.userAction("新玩家-加载成功")
        }
    }

    time30() {
        //StatHepler.userAction("新玩家-30s未退出")
    }

    time45() {
        //StatHepler.userAction("新玩家-45s未退出")
    }

    time60() {
        //StatHepler.userAction("新玩家-60s未退出")
    }
}
