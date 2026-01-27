import Net from "../../core/Net";
import { IGameConfig, SDKBase } from "../sdks/SDKInterafce";
export interface CloudFunc {
    name: string,
    status: number, // 0 , 1 
    max: string,
    ratio: string,
}

export interface CloudConfig {
    disFunc: { [index: string]: CloudFunc },
    globalSwitch: number,
}

export default class Cloud {
    static config: CloudConfig = { globalSwitch: 1, disFunc: {} };
    static funcs: { [index: string]: CloudFunc } = null;
    static appid: string = "";

    public static getCloudConfig(): Promise<CloudConfig> {
        let channel = ""
        let scene = 1001;
        let gc = SDKBase.gameConfig;
        if (CC_WECHATGAME) {
            let a = wx.getLaunchOptionsSync();
            scene = a.scene
            channel = a.query['channel']
        }
        let client = new Net();
        if (CC_WECHATGAME) {
        } else {
            client.setHeader("Referer", "https://servicewechat.com/" + gc.appId + "/30/page-frame.html");
        }
        return new Promise(((resolve, reject) => {
            let dataTobesend = { scene, version: gc.version, channel, game: gc.gameId };
            client.httpGet(gc.cloudUrl, dataTobesend).then(res => {
                if (res) {
                    let s = JSON.parse(res)
                    if (s.errno != 0) {
                        reject(s.errmsg)
                        return
                    }
                    if (CC_DEBUG) {
                        console.log("차단 인터페이스 반환", s);
                    }
                    resolve(s.data);
                } else if (res == Net.Code.Timeout) {
                    reject("timeout")
                }
            })
        }))

    }

    static async reload() {
        let res
        res = await this.getCloudConfig().catch(v => {
            console.error(v);
        })
        if (!res) {
            res = JSON.parse(this.test).data;
        } else {
            this.config = res;
        }
        this.process(res);
    }

    static process(res: CloudConfig) {
        this.funcs = res.disFunc;
    }

    static test: string = `{
    "code": 200,
    "msg": "",
    "data": {
        "disFunc": {
            "1": {
                "name": "banner位移",
                "status": 1,
                "show_num": "100",
                "show_per": "1"
            },
            "2": {
                "name": "连胜奖励",
                "status": 1,
                "show_num": "100",
                "show_per": "1"
            },
            "3": {
                "name": "体力大礼包",
                "status": 1,
                "show_num": "100",
                "show_per": "1"
            },
            "4": {
                "name": "游戏页面banner",
                "status": 1,
                "show_num": "1000",
                "show_per": "1"
            },
            "5": {
                "name": "假分享失败控制",
                "status": 1,
                "show_num": "3",
                "show_per": "1"
            },
            "6": {
                "name": "banner刷新",
                "status": 1,
                "show_num": "3",
                "show_per": "1"
            },
            "7": {
                "name": "投放用户拉抽屉",
                "status": 1,
                "show_num": "3",
                "show_per": "1"
            },
            "8": {
                "name": "投放用户继续游戏拉抽屉",
                "status": 1,
                "show_num": "3",
                "show_per": "0.5"
            },
            "9": {
                "name": "电击枪领取弹窗",
                "status": 1,
                "show_num": "999",
                "show_per": "1"
            },
            "10": {
                "name": "关闭按钮展示",
                "status": 1,
                "show_num": "3",
                "show_per": "1"
            }
        },
        "adSwitch": 1,
    }
}`
}

