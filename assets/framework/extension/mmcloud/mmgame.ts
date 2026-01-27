
import Platform from "../Platform";
import { CheatInfo } from "./cheatInfoDC";
import Cloud from "./Cloud";

export default class mmgame {
    // not destroy node
    static comp: cc.Component = null;

    static init(comp: cc.Component) {
        this.comp = comp;
    }

    static timer_fake: number = 0;

    /**骗点 
     * comp  view绑定的脚本
     * normal 正常的节点
     * fake 骗点的节点
     * timeout 真节点出来的延迟时间 
    */
    static enableFakeForAdClick(normal: cc.Node, fake: cc.Node, timeout: number, errorCallback?) {
        try {
            normal.active = false;
            fake.active = true;
            // Platform.hideBannerAd();
            let scene = cc.director.getScene().name;
            let recovery = () => {
                let lastscene = cc.director.getScene().name;
                if (lastscene == scene) {
                    console.log("*************banner---------5")
                    Platform.showBannerAd(errorCallback);
                    fake.active = false;
                    normal.active = true;
                }
            }
            // comp.scheduleOnce(recovery, timeout)
            this.timer_fake = setTimeout(recovery, timeout * 1000);
            return recovery;
        } catch (e) {
            console.warn(e);
        }
    }

    static clear() {
        // comp.unscheduleAllCallbacks();
        clearTimeout(this.timer_fake);
    }

    // static scheduleOnce(func, timeout) {
    //     this.comp.scheduleOnce(func, timeout);
    // }


    // static unschedule(func) {
    //     this.comp.unschedule(func);
    // }
    static getStatus(feature_id: string) {
        if (Cloud.config.globalSwitch == 0) {
            return 0;
        }
        if (Cloud.funcs == null) {
            return -1;
        }
        let feature = Cloud.funcs[feature_id]
        if (feature) {
            return feature.status;
        } else {
            return -1;
        }
    }

    static isCheatOpen(feature_id: string) {
        if (Cloud.config.globalSwitch == 0) {
            return false;
        }
        if (Cloud.funcs == null) {
            return false;
        }
        let feature = Cloud.funcs[feature_id]
        if (!feature) return false;
        if (feature.status == 1) {
            let num = parseInt(feature.max);
            if (!isNaN(num)) {
                if (CheatInfo.getCount(feature_id) < num) {
                    // 次数未达最大次数
                    let rate = parseFloat(feature.ratio);
                    if (!isNaN(num)) {
                        if (Math.random() < rate) {
                            return true
                        }
                        console.log("[wegame]차단 id:" + feature_id + " 확률 미통과")
                        return false;
                    } else {
                        return true;
                    }
                }
                console.log("[wegame]차단 id:" + feature_id + " 횟수 상한 도달" + CheatInfo.getCount(feature_id))
                return false
            } else {
                return true;
            }
        }
        console.log("[wegame]차단 id:" + feature_id + " 미활성화")
        return false;
    }

    /**标记已打开 */
    static markOpen(feature_id) {
        CheatInfo.markOpen(feature_id)
    }

    static view_paths: {} = {}

    static registerUI(feature_id, viewpath) {
        this.view_paths[feature_id] = viewpath;
    }

    /**打开普通功能（受次数限制)  ，不受屏蔽接口控制 */
    static openFeature(feature_id, max, data, callback?, target?) {
        let c = CheatInfo.getCount(feature_id);
        if (c < max) {
            let viewpath = this.view_paths[feature_id]
            if (viewpath) {
                vm.show(viewpath, data, callback, target);
            }
            CheatInfo.markOpen(feature_id);
            return true
        }
        console.log("[wegame]기능 열기 실패: [" + feature_id + "], 오늘 사용 횟수 초과!(" + c + "/" + max + ")");
        return false;
    }

    static tryOpenFeature(feature_id, max, data) {
        return new Promise((resolve, reject) => {
            let b = this.openFeature(feature_id, max, data, resolve)
            if (!b) {
                Promise.reject(false);
            }
        })
    }



    /** 尝试打开屏蔽接口的ui ：红包雨功能 ， 疯狂点击 功能等等 */
    static openCheat(feature_id, data?, callback?, target?) {
        if (this.isCheatOpen(feature_id)) {
            let viewpath = this.view_paths[feature_id]
            if (viewpath) {
                vm.show(viewpath, data, callback, target);
                CheatInfo.markOpen(feature_id);
                return true;
            }
        }
        console.log("[wegame]차단 기능 열기 실패: [" + feature_id + "], 미활성화, 사용 횟수 초과, 또는 확률 미통과")
        return false;
    }

    static tryOpenCheat(feature_id, data?, callback?, target?) {
        return new Promise((resolve, reject) => {
            let b = this.openCheat(feature_id, data, callback, target)
            if (!b) {
                reject(false);
            } else {
                resolve(true);
            }
        })
    }

}