import Net from "../../../core/Net";

const { ccclass, property } = cc._decorator;

export enum EventType {
    paySuccess,
    payFail,
    tools,
    revive,
    award,
}

export enum LevelEndEventType {
    Exit = 0,
    Win = 1,
    Lose = 2
}



@ccclass
export default class StatHepler {
    static level_end_event: LevelEndEventType = LevelEndEventType.Exit
    static current_lv_desc: string = ""
    static isInLevel = false;


    static _userId: string = '';
    static levelId: string = '0';
    static client = new Net()

    static init(userId) {
        this._userId = userId
    }

    static startLevel(levelId, lv_desc) {
        this.levelId = levelId;
        this.current_lv_desc = lv_desc
        //默认为退出，其它 状态 会设置 成功或者 失败,不设置 就是退出
        StatHepler.level_end_event = LevelEndEventType.Exit;
        if (cc.sys.platform == cc.sys.WECHAT_GAME && wx.aldStage) {

            wx.aldStage.onStart({
                stageId: levelId,
                stageName: this.current_lv_desc,
                userId: this._userId
            });
        }
        this.isInLevel = true;
    }

    static setLevelEndEvent(evt: LevelEndEventType) {
        StatHepler.level_end_event = evt;
    }

    static userAction(eventName, k?, v?) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME && wx.aldStage) {
            if (k) {
                let param = {}
                param[k] = v;
                wx.aldSendEvent(eventName, param)
            } else {
                let param = {}
                param["userId"] = this._userId;
                wx.aldSendEvent(eventName)
            }
        }
    }

    public static sendPath(name, title?, val?) {
        // if(cc.sys.platform == cc.sys.WECHAT_GAME){
        // window['zzsdkui'].aliEvent(name, {
        //     [title]: val || 1
        // });
        // return;
        // }

        // let appid = "";
        // if(window.tt){
        //     appid = TTGameConfig.tt_appid;
        // }else if(window.qq){
        //     appid = QQGameConfig.qq_appid;
        // }else if(CC_WECHATGAME){
        //     appid = GameConfig.wx_appid;
        // }    
        // var sendData = {
        //     xsl_uuid: UserInfo.userId,
        //     xsl_appid: appid,
        //     xsl_et_action: name,
        //     xsl_et_label: title,
        //     xsl_et_value: val || 1
        // };
        // this.client.httpGet("https://r.d1fm.com/r.gif", sendData);
        if (cc.sys.os == cc.sys.OS_IOS) {
            // jsb.reflection.callStaticMethod("GDTSdk", "applicationLogAction:count:", name,title + val);
        }
    }



    static doLevelEvent(eventType: EventType, itemName, itemId, itemCount = 1, itemMoney = "1") {
        if (!this.isInLevel) return;
        if (cc.sys.platform == cc.sys.WECHAT_GAME && wx.aldStage) {
            wx.aldStage.onRunning({
                stageId: this.levelId,
                stageName: this.current_lv_desc,
                userId: this._userId,
                event: EventType[eventType],
                params: {
                    itemName, itemId, itemCount, itemMoney
                }
            })
        }
    }

    static winLevel() {
        if (this.isInLevel) {
            this.setLevelEndEvent(LevelEndEventType.Win);
            this.endLevel();
        }
    }

    static loseLevel() {
        if (this.isInLevel) {
            this.setLevelEndEvent(LevelEndEventType.Lose);
            this.endLevel();
        }
    }

    static exitLevel() {
        if (this.isInLevel) {
            this.setLevelEndEvent(LevelEndEventType.Exit);
            this.endLevel();
        }
    }

    static endLevel() {
        //统计
        if (cc.sys.platform == cc.sys.WECHAT_GAME && wx.aldStage) {
            //------------------------------------------------------------------------------//
            let desc = ""
            let ald_event = ''
            switch (StatHepler.level_end_event) {
                case LevelEndEventType.Win:
                    desc = "完成关卡"
                    ald_event = 'complete'
                    break;
                case LevelEndEventType.Lose:
                    desc = "关卡失败"
                    ald_event = "fail"
                    break;
                case LevelEndEventType.Exit:
                    desc = "中途退出"
                    ald_event = "fail"
                    break;
            }
            wx.aldStage.onEnd({
                stageId: this.levelId,
                stageName: this.current_lv_desc,
                userId: this._userId,
                event: ald_event,
                params: {
                    desc
                }
            });
        }
        this.isInLevel = false;
        //------------------------------------------------------------------------------//
    }

}