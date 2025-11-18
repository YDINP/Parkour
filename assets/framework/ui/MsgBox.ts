import View from "./View";
import ccUtil from "../utils/ccUtil";

const { ccclass, property, requireComponent, playOnFocus } = cc._decorator;

@ccclass
export default class MsgBox extends cc.Component {

    static OK: number = 1;
    static CANCEL: number = 0;


    @property(cc.Node)
    btn_ok: cc.Node = null;
    @property(cc.Node)
    btn_cancel: cc.Node = null;


    defaultStrings: { [index: string]: string } = {};

    text: string[] = []

    messageBoxCallback: Function = null;

    label_ok: cc.Label = null;
    label_cancel: cc.Label = null;

    bgAnimation: cc.Animation;
    onLoad() {
        // this.getComponent(View).setDelegate(this);
        ccUtil.newButton(this.btn_ok, "MsgBox", "on_btn_ok_clicked", this.node);
        ccUtil.newButton(this.btn_cancel, "MsgBox", "on_btn_cancel_clicked", this.node);
    }

    onHidden() {
    }

    onShown(params) {
        this.messageBoxCallback = params.callback;
        Object.keys(params.text).forEach(k => {
            let label = ccUtil.find(k, this.node, cc.Label)
            let basestr = this.defaultStrings[k]
            if (basestr == null) {
                basestr = label.string;
                this.defaultStrings[k] = basestr
            }
            if (label) {
                label.string = cc.js.formatStr(basestr, ...params.text[k])
            } else {
                console.warn("label not found", k)
            }
        })
    }

    start() {

    }

    on_btn_ok_clicked() {
        if (this.messageBoxCallback)
            this.messageBoxCallback.call(null, MsgBox.OK)
        this.getComponent(View).hide();
    }

    on_btn_cancel_clicked() {
        if (this.messageBoxCallback)
            this.messageBoxCallback.call(null, MsgBox.CANCEL)
        this.getComponent(View).hide();
    }



    // update (dt) {}
}
