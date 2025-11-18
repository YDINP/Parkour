import ViewManager from "./ViewManager";
import { evt } from "../core/event";

const { ccclass, property, menu } = cc._decorator;

export interface IView {
    onShow?(...params)
    onShown?(...params)
    onHidden?()
    onAnimateShow?(callback: Function, target: any): cc.Tween;
    onAnimateHide?(callback: Function, target: any): cc.Tween;
}

@ccclass
@menu("mimgame/UI/View")
export default class View extends cc.Component {
    emit(e, msg) {
        evt.emit(msg)
    }

    name: string;

    @property
    isDialog: boolean = true;

    @property
    closeOnClick: boolean = false;

    private target: IView;

    @property
    opacity: number = 200;


    @property({ visible: true, displayName: "topMost" })
    private _topMost: boolean = false;


    private touchBlocker: cc.Node = null;

    /**相关联的prefab信息 */
    prefab: cc.Prefab = null;

    private _isHiding: boolean = false;

    @property
    hasAnimation: boolean = true;


    call(event, exp: string) {
        // eval(exp);
        g.execScript(exp);
    }

    setDelegate(target) {
        this.target = target;
    }

    emitEvent(e, exp: string) {
        evt.emit(exp);
    }

    /** 打开其它界面  */
    showUI(e, viewPath) {
        vm.show(viewPath)
    }

    onLoad() {
        let components = this.getComponents(cc.Component);
        for (var i = 0; i < components.length; i++) {
            let comp: any = components[i]
            if (comp != this) {
                if (comp.onShown || comp.onShow || comp.onHidden) {
                    this.target = comp;
                    break;
                }
            }
        }

        /** 点击背景退出弹窗 */
        if (this.isDialog) {
            if (this.closeOnClick) {
                this.node.on(cc.Node.EventType.TOUCH_END, this.hide, this);
                this.node.children[0] && this.node.children[0].addComponent(cc.BlockInputEvents);
            }
        }

    }

    start() {
        this.touchEnabled = true;
    }

    init(viewname: string) {
        this.name = viewname;
        let idx = viewname.lastIndexOf("/") + 1
        // idx = Math.max(0,idx);
        this.node.name = viewname.substr(idx)
    }

    private hideAnimationCallback() {
        this.node.active = this.visible;
        this._isHiding = false;
        ViewManager.instance.checkViewStacks();
    }



    onAnimateHide(callback, target) {
        return ViewManager.instance.playHideAnim(this.node, callback, target)
    }

    onAnimateShow(showFinishCallback, target) {
        return ViewManager.instance.playShowAnim(this.node, showFinishCallback, target);
    }

    /**
     * //如果 实现了view的animation那么需要 animation 去做隐藏
     * 否则会不会有animtion ，系统 将直接 设置 active 为false
     */
    doHideAnimation() {
        console.log("[View] hide:", this.name);
        this.node.active = true;
        this._isHiding = true;
        this._visible = false;
        if (this.hasAnimation) {
            if (this.target && this.target.onAnimateHide) {
                let tween = this.target.onAnimateHide(this.hideAnimationCallback, this)
                if (tween) {
                    tween.call(this.hideAnimationCallback.bind(this)).start()
                }
            } else {
                this.onAnimateHide(this.hideAnimationCallback, this)
            }
        } else {
            this.hideAnimationCallback();
        }
    }

    isInHideAnimation(): any {
        return this._isHiding
    }

    onHidden() {
        this._visible = false;
        if (this.target && this.target.onHidden)
            this.target.onHidden();
    }

    hide() {
        // super.hide()
        this.touchEnabled = false;
        vm.hide(this.node);
    }

    private _visible: boolean;

    get visible() { return this._visible; }


    set topMost(b) {
        if (this._topMost) this._topMost = b;
        this.node.zIndex = 9999;
    }

    get topMost() {
        return this._topMost;
    }


    get touchEnabled() {
        if (this.touchBlocker) {
            return !this.touchBlocker.active
        }
        return true;
    }

    set touchEnabled(b) {
        if (this.touchBlocker) {
            this.touchBlocker.active = !b
        }
    }



    private show_promise_resolve: any = null;
    private show_params: any = null;

    private showAnimationCallback() {
        if (!this.touchEnabled)
            this.touchEnabled = true;
        let ret = null;
        if (this.target && this.target.onShown) {
            try {
                ret = this.target.onShown(...this.show_params);
            } catch (err) {
                console.error(err)
            }
        }
        evt.emit(this.node.name + ".onShown", this, ret, this.show_params)
        evt.emit("View.onShown", this, ret, this.show_params);
        this.show_promise_resolve(this);
    }

    show(...params) {
        this.node.active = true;
        //reset zindex 
        if (this.topMost)
            this.node.zIndex = 9999;
        //确保在widget 更新结束后开始动画 ，
        return new Promise<View>((resolve, reject) => {
            this._visible = true;
            evt.emit("View.onShow", this, params);
            this.show_promise_resolve = resolve;
            this.show_params = params;
            if (this.hasAnimation) {
                if (this.target && this.target.onAnimateShow) {
                    let tween = this.target.onAnimateShow(this.showAnimationCallback, this)
                    if (tween) {
                        tween.call(this.showAnimationCallback.bind(this)).start()
                    }
                } else {
                    this.onAnimateShow(this.showAnimationCallback, this)
                }
            } else {
                // this.showAnimationCallback();
                this.scheduleOnce(this.showAnimationCallback)
            }
            if (this.target && this.target.onShow) {
                try {
                    this.target.onShow(...params);
                } catch (err) {
                    console.error(err)
                }
            }
        })
    }
}
