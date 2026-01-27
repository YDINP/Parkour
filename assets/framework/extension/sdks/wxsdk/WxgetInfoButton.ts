import Platform from "../../Platform";

const { ccclass, property, menu } = cc._decorator;
let wxSysInfo
@ccclass
@menu("mimgame/Wxsdk/WxgetInfoButton")
export default class WxgetInfoButton extends cc.Component {

    @property(cc.Component.EventHandler)
    handler: cc.Component.EventHandler = new cc.Component.EventHandler();
    button: any = null;
    @property
    width: number = 200;
    @property
    height: number = 40;
    onLoad() {

    }

    onEnable() {
        this.button && this.button.show();
    }

    onDisable() {
        this.button && this.button.hide();
    }

    onDestroy() {
        this.button && this.button.destroy();
    }
    private createButton(callback) {
        if (!wxSysInfo) {
            wxSysInfo = wx.getSystemInfoSync();
        }
        console.log("------미인증! wx.createUserInfoButton 호출-------", wx.getSystemInfoSync().windowWidth)
        var leftPos = wxSysInfo.windowWidth * 0.5 - this.width / 2
        var topPos = wxSysInfo.windowHeight * 0.5 - this.height / 2
        var width = this.width
        var height = this.height
        if (this.button) {
            this.button.destroy()
        }
        var btnRect = this.node.getBoundingBoxToWorld()
        var ratio = cc.view.getDevicePixelRatio();
        var scale = cc.view.getScaleX()
        var factor = scale / ratio
        // var point = cc.v2(btnRect.x, btnRect.y)
        // cc.view._convertPointWithScale(point)
        leftPos = btnRect.x * factor
        topPos = wxSysInfo.screenHeight - (btnRect.y + btnRect.height) * factor
        width = btnRect.width * factor
        height = btnRect.height * factor
        this.button = wx.createUserInfoButton({
            type: "text",
            text: "        ",
            style: {
                left: leftPos,
                top: topPos,
                width: width,
                height: height,
                lineHeight: 60,
                textAlign: 'center',
                backgroundColor: '#00000000',
                color: '#ffffff'
            }
        });
        this.button.onTap((res) => {
            if (res && res.userInfo) {
                console.log("res", res)
                this.button.destroy();
                if (callback) {
                    callback(res.userInfo);
                }
            } else if (callback) {
                callback(null);
            }
        });
    }
    start() {
        Platform.checkAuth().then(v => {
            if (!v) {
                if (CC_WECHATGAME) {
                    this.createButton(userInfo => {
                        this.onClick(userInfo, true)
                    })
                }
            } else {
                this.node.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this, v, false))
                // this.handler.emit([v])
                //n已授权无需创建 按钮
                // this.infoHandler.emit([v])
            }
        })
    }

    onClick(userInfo, isNew) {
        this.handler.emit([userInfo, isNew])
    }
}