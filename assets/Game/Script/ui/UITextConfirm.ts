import mvcView from "../../../framework/ui/mvcView";

const { ccclass, property } = cc._decorator;

export interface TextConfirmInfo {
    title: string;
    content: string;
    confirmTxt: string;
    isShowCancel: boolean;
    cancelIsDaley: boolean;
    confirmCall: Function;
    cancelCall: Function;
}

@ccclass
export default class UITextConfirm extends mvcView {

    @property(cc.Node)
    btn_confirm: cc.Node = null;

    @property(cc.Node)
    btn_cancel: cc.Node = null;

    @property(cc.Label)
    lab_title: cc.Label = null;

    @property(cc.Label)
    lab_content: cc.Label = null;


    private confirmData: TextConfirmInfo = null;

    private daleyTime = 2;
    onLoad() {
        this.onClick(this.btn_confirm, this.click_confirm);
        this.onClick(this.btn_cancel, this.click_cancel);
        this.register(this.lab_title, () => this.confirmData.title);
        this.register(this.lab_content, () => this.confirmData.content);
    }

    onShow(data: TextConfirmInfo) {
        this.confirmData = data;
        this.initUI();
    }

    initUI() {
        this.lab_title.string = this.confirmData.title;
        this.lab_content.string = this.confirmData.content;
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

        let callback = this.confirmData.confirmCall;
        vm.hide(this);
        callback && callback();
    }

    click_cancel() {
        let callback = this.confirmData.cancelCall;
        vm.hide(this);
        callback && callback();
    }

    onHidden() {
        this.confirmData = null;
    }
}
