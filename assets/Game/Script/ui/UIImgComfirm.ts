import Device from "../../../framework/core/Device";
import mvcView from "../../../framework/ui/mvcView";

const { ccclass, property } = cc._decorator;
export interface ImgConfirmData {
    iconPath: string;
    content: string;
    isShowCancel: boolean;
    cancelIsDaley: boolean;
    confirmCall: Function;
    cancelCall: Function;
    title: string;
}
@ccclass
export default class UIImgConfirm extends mvcView {

    @property(cc.Node)
    btn_confirm: cc.Node = null;

    @property(cc.Node)
    btn_cancel: cc.Node = null;

    @property(cc.Sprite)
    img_icon: cc.Sprite = null;

    @property(cc.Label)
    lab_cancel: cc.Label = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Node)
    kNode: cc.Node = null;

    private confirmData: ImgConfirmData = null;

    private daleyTime = 2;

    onLoad() {
        this.onClick(this.btn_confirm, this.click_confirm);
        this.onClick(this.btn_cancel, this.click_cancel);
        this.register(this.lab_cancel, () => this.confirmData.content);
        this.register(this.img_icon, () => this.confirmData.iconPath);
        this.register(this.title, () => this.confirmData.title);
    }

    onShow(data: ImgConfirmData) {
        this.confirmData = data;
        this.render();
        this.initUI();
        this.scheduleOnce(() => {
            this.fitIcon();
        }, 0)
    }

    fitIcon() {
        let iconW = this.img_icon.node.width;
        let iconH = this.img_icon.node.height;
        let kWide = this.kNode.height - 10;
        let standard = iconW > iconH ? iconW : iconH;
        let odds = kWide / standard;
        this.img_icon.node.scale = odds;
    }

    initUI() {
        this.btn_cancel.active = false;
        if (this.confirmData.isShowCancel) {
            if (this.confirmData.cancelIsDaley) {
                this.scheduleOnce(() => {
                    this.btn_cancel.active = true;
                }, this.daleyTime);
            } else {
                this.btn_cancel.active = true;
            }
        }
    }

    click_confirm() {
        if (this.confirmData) {
            this.confirmData.confirmCall && this.confirmData.confirmCall();
        }
        vm.hide(this);
    }

    click_cancel() {
        if (this.confirmData) {
            this.confirmData.cancelCall && this.confirmData.cancelCall();
        }
        vm.hide(this);
    }

    onHidden() {
        this.confirmData = null;
    }
}
