import DataCenter, { dc, field } from "../../core/DataCenter";
import gUtil from "../../core/gUtil";
import WeakNetGame from "./WeakNetGame";
import gameUtil from "../../utils/gameUtil";
import Platform, { AuthUserInfo } from "../Platform";
// pdata는 순환 참조 문제로 동적으로 접근
let firstEnterHome = true
@dc("UInfo")
export default class UInfoDC extends DataCenter {
    // @field()
    // ip_cname: string = ""

    // @field()
    // ip_addr: string = ""

    // @field()
    // ip_s: number = 0;

    @field()
    auth: boolean = false;

    @field()
    lastLoginTime: number = 0

    @field()
    isFirstLoginToday: boolean = false;

    /**需要在进入后置为false */
    @field()
    isFirstEnterGame: boolean = true;

    //================-----------------------
    /**每日分享录屏次数 */
    @field()
    sharecount: number = 0;
    @field()
    nickName: string = '';

    @field()
    userId: string = '';

    @field()
    avatarUrl: string = '';

    //================-----------------------

    @field()
    firstLoginTime: number = 0;

    /**最后一次退出游戏 的时间 ,秒为单位  */
    @field()
    lastExitTime: number = 0;

    @field()
    gender: number = 0;

    @field()
    signData: { count: number, timeStamp: Date, loopCount: number } = null;

    /**玩家当天抽奖剩余次数 */
    @field()
    drawResidueTime: number = 5;
    // （新玩家）当天退出游戏再进也算 
    isNew = false;

    //当天第一次结算
    isFirstGameOver = true;

    get userType() {
        return this.isNew ? "(新玩家)" : "(老玩家)"
    }

    exitGame() {
        this.lastExitTime = Date.now() / 1000;
        this.save("lastExitTime")
    }

    onLoadAll() {
        if (this.firstLoginTime == 0) {
            this.firstLoginTime = Date.now()
        }
        if (gameUtil.isNextDay(this.firstLoginTime)) {
            this.isNew = false;
        } else {
            this.isNew = true;
        }
        if (gameUtil.isNextDay(this.lastLoginTime)) {
            this.lastLoginTime = Date.now();
            this.isFirstLoginToday = true;
            this.drawResidueTime = 5;
            // signIn 리셋은 Home.ts에서 처리 (순환 참조 방지)
        } else {
            this.isFirstLoginToday = false;
        }
        // if (gameUtil.isNextDay(this.DyTime)) {
        //     //this.isDy = false;

        // } else {

        // }

        if (this.userId == null || this.userId == '') {
            this.userId = gUtil.uuid(32, 16);
            // Platform.userId = this.userId;
        }
        this.save()
    }

    /**
     * 上传用户数据 
     * @param kvs 
     */
    async uploadUserInfo(kvs: Object) {
        //仅对授权过的用户进行提交数据
        if (!UInfo.userId || UInfo.userId === '') {
            return -1;
        }
        //开始上传
        try {
            let d = {
                // userId: UserInfo.userId,
                // nickName: UserInfo.nickName,
                // avatarUrl: UserInfo.avatarUrl,
                // gender: UserInfo.gender,
                // channel: channel,
            }
            for (var k in kvs) {
                d[k] = kvs[k];
            }
            //上传授权信息
            await WeakNetGame.syncData(d)
        } catch (e) {
            console.error("데이터 업로드 실패" + e);
            return -2;
        }
        return 0;
    }
    /**
     *  在 WxgetInfoButton 的按钮回调里执行
     * @param kvs 需要上传的key-value 对 数据
     * @param authInfo 从WxgetInfoButton 按钮回调里获取的参数
     * @returns 0 表示成功上传 ,- 1玩家 未授权， -2  上传过程失败
     */
    async openRankAndUpload(kvs: Object, authInfo: AuthUserInfo) {
        if (UInfo.auth == false) {
            if (!authInfo) {
                authInfo = await Platform.checkAuth()
            }
            //update user info 
            if (authInfo == null) {
                //玩家未授权
                return -1;
            } else {
                //已授权 
                UInfo.nickName = authInfo.nickName;
                if (!UInfo.userId || UInfo.userId === '') {
                    UInfo.userId = gUtil.uuid(32, 16);
                }
                UInfo.gender = authInfo.gender;
                UInfo.avatarUrl = authInfo.avatarUrl;
                UInfo.auth = true;
                //保存授权信息
                UInfo.save();
                let channel = '';
                if (CC_WECHATGAME) {
                    if (window.tt) {
                        channel = 'tt'
                    } else if (window.qq) {
                        channel = 'qq'
                    } else {
                        channel = 'wx'
                    }
                } else {
                    channel = 'sim'
                }
                if (kvs == null) { kvs = {} }
                kvs["nickName"] = UInfo.nickName;
                kvs["avatarUrl"] = UInfo.avatarUrl;
                kvs["gender"] = UInfo.gender;
                kvs['channel'] = channel;
                kvs['auth'] = true;
                //开始上传
                return this.uploadUserInfo(kvs);
            }
        }
    }

    isAuthOk() {
        return !!(UInfo.nickName && UInfo.nickName !== '')
    }
    /**检查是否有离线收益 
     * @returns 离线时间  (s)
    */
    checkOffline() {
        if (firstEnterHome) {
            firstEnterHome = false;
            let offset = Date.now() / 1000 - UInfo.lastExitTime;
            if (offset > 60) {
                return offset;
            }
            return 0
        }
    }


}



export let UInfo: UInfoDC = DataCenter.register(UInfoDC);
