const { ccclass, property, menu } = cc._decorator;
let wxSysInfo
@ccclass
@menu("mimgame/Wxsdk/WxGameClubButton")
export default class WxGameClubButton extends cc.Component {

    @property(cc.Component.EventHandler)
    handler: cc.Component.EventHandler = new cc.Component.EventHandler();
    button: any = null;

    @property
    width: number = 200;
    @property
    height: number = 40;
    static instance: WxGameClubButton = null
    onLoad() {
        WxGameClubButton.instance = this;
    }

    onEnable() {
        this.button && this.button.show();
    }

    onDisable() {
        this.button && this.button.hide();
    }

    onDestroy() {
        this.button && this.button.destroy();
        WxGameClubButton.instance = null;
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
        leftPos = btnRect.x * factor
        topPos = wxSysInfo.screenHeight - (btnRect.y + btnRect.height) * factor
        width = btnRect.width * factor
        height = btnRect.height * factor
        this.button = wx.createGameClubButton({
            //green,white,dark , light
            icon: 'light',
            style: {
                left: leftPos,
                top: topPos,
                width: width,
                height: height,
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