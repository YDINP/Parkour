import Signal from "../../core/Signal";
import Platform from "../../extension/Platform";
import { LocalizationManager } from "../../Hi5/Localization/LocalizationManager";

let { ccclass, property, menu } = cc._decorator
@ccclass
@menu("mimgame/util/SubpackageLoader")
export default class SubpackageLoader extends cc.Component {
    @property(cc.Label)
    label_progress: cc.Label = null;

    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Button)
    btn_retry: cc.Button = null;


    @property(cc.Button)
    btn_close: cc.Button = null;

    onLoad() {
        this.btn_retry.node.on(cc.Node.EventType.TOUCH_END, this.click_retry, this);
        if (this.btn_close)
            this.btn_close.node.on(cc.Node.EventType.TOUCH_END, this.click_close, this);
    }

    onSuccess: Signal = new Signal();
    names: string[] = []

    hideOnFinish: boolean = true;

    onShown(names: any, hideOnFinish, callback, target) {
        this.hideOnFinish = hideOnFinish;
        this.onSuccess.clear();
        this.onSuccess.on(callback, target);
        this.names.splice(0);
        if (Array.isArray(names)) {
            this.names = names;
        } else if (typeof (names) == "string") {
            this.names.push(names);
        } else {
            console.error("[SubpackageLoader] fail to load : params error")
            return;
        }
        this.startLoad();
    }

    /**
     * 显示 当前下载 进度
     * @param name 子包名
     * @param percent  当前进度 x/100
     * @param c 下载字节数
     * @param t 总下载字节数 
     */
    showStatus(name, percent, c, t) {
        if (this.label_progress)
            this.label_progress.string = percent + "%"
        if (this.bar)
            this.bar.progress = percent / 100;
        if (this.label)
            this.label.string = LocalizationManager.getText("@loading");
            // this.label.string = "加载[" + name + "]中"
    }

    async startLoad() {
        this.btn_retry.node.active = false;
        this.btn_close.node.active = false;
        try {
            for (var i = 0; i < this.names.length; i++) {
                let name = this.names[i];
                await Platform.loadSubPackage(name, (p, c, t) => {
                    this.showStatus(name, p, c, t);
                })
            }
            this.onSuccess.fire(this);
            if (this.hideOnFinish) {
                vm.hide(this);
            }
        } catch (e) {
            console.error(e);
            if (this.label)
                this.label.string = LocalizationManager.getText("@text.data_exception");
                // this.label.string = "加载失败,请点击重试!"
            this.btn_retry.node.active = true;
            this.btn_close.node.active = true;
        }
    }

    cancel() {
        this.onSuccess.clear()
        vm.hide(this);
    }

    click_close() {
        vm.hide(this);
    }

    onHidden() {
        this.cancel()
    }

    click_retry() {
        this.btn_retry.node.active = false;
    }
}