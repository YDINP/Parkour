import View from "./View";
import { MessageBox } from "./MessageBoxManager";

const { ccclass, property, executeInEditMode, playOnFocus } = cc._decorator;

@ccclass
export default class MessageBoxComponent extends cc.Component {

    @property(cc.Label)
    node_title: cc.Label = null;
    @property(cc.Label)
    node_content: cc.Label = null;

    @property(cc.Node)
    btn_ok: cc.Node = null;
    @property(cc.Node)
    btn_cancel: cc.Node = null;

    messageBoxCallback: Function = null;

    label_ok: cc.Label = null;
    label_cancel: cc.Label = null;

    @property(cc.Node)
    group_ok_cancel: cc.Node = null;

    @property(cc.Node)
    group_ok: cc.Node = null;

    onLoad() {
        this.label_ok = this.btn_ok.getChildByName("Label").getComponent(cc.Label)
        this.label_cancel = this.btn_cancel.getChildByName("Label").getComponent(cc.Label)
        this.getComponent(View).setDelegate(this);
    }

    onHidden() {
    }

    onShow(params) {
        this.node_title.string = params.title;
        this.node_content.string = params.content;
        this.messageBoxCallback = params.callback;
        if (params.extra) {
            this.label_ok.string = params.extra.okText
            this.label_cancel.string = params.extra.cancelText
        }
        if (params.buttons == MessageBox.OK_CANCEL) {
            //show two 
            this.group_ok_cancel.active = true;
            this.group_ok.active = false;
        } else {
            //show one 
            this.group_ok.active = true;
            this.group_ok_cancel.active = false;
        }
    }

    start() {

    }



    on_btn_ok_clicked() {
        if (this.messageBoxCallback)
            this.messageBoxCallback.call(null, MessageBox.OK)
        // this.getComponent(View).hide();
        vm.hide(this)
    }

    on_btn_cancel_clicked() {
        if (this.messageBoxCallback)
            this.messageBoxCallback.call(null, MessageBox.CANCEL)
        // this.getComponent(View).hide();
        vm.hide(this)
    }



    // update (dt) {}
}
