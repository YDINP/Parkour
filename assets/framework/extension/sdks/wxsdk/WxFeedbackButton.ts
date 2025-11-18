const { ccclass, property, menu } = cc._decorator;
let wxSysInfo
@ccclass
@menu("mimgame/Wxsdk/WxFeedbackButton")
export default class WxFeedbackButton extends cc.Component {

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
        leftPos = wxSysInfo.screenWidth - btnRect.x * factor
        //(+ btnRect.height)
        topPos = (btnRect.y + btnRect.height - wxSysInfo.screenHeight) * factor + btnRect.height*2
        //(btnRect.y - btnRect.height) * factor
        console.log("************************************")
        console.log("按钮横坐标", leftPos);
        console.log("按钮纵坐标", topPos);
        console.log(wxSysInfo.screenWidth)
        console.log(wxSysInfo.screenHeight)
        console.log(wxSysInfo)
        console.log(btnRect.y)
        console.log(btnRect.x)
        console.log(btnRect.height)
        console.log("****************************************")
        width = btnRect.width * factor
        height = btnRect.height * factor
        this.button = wx.createFeedbackButton({
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
                color: '#ffffff',
            }
        });
        this.button.onTap((res) => {
            if (res) {
                if (callback) callback(res);
            } else if (callback) callback(null);
        });
    }

    start() {
        if (CC_WECHATGAME) {
            this.createButton(res => {
                this.handler.emit([res])
            })

        }
    }
}