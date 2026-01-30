import View from "./View";
import { evt } from "../core/event";
import Device from "../core/Device";
import { Loading } from "./LoadingManager";
import actionUtil from "../utils/actionUtil";
import { LocalizationManager } from "../Hi5/Localization/LocalizationManager";

const { ccclass, property, menu } = cc._decorator;

var TAG: string = "[ViewManager]"
@ccclass
@menu("mimgame/UI/ViewManager")
export default class ViewManager extends cc.Component {

    static instance: ViewManager;

    @property
    baseDir: string = "Prefabs/UI/"

    _views: { [index: string]: View } = {}

    // 
    @property(cc.Node)
    modal: cc.Node = null;

    @property({ type: cc.AudioClip })
    audio_show: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    audio_hide: cc.AudioClip = null;

    targetModalOpacity = 0;

    modalTouchBlocker: cc.BlockInputEvents = null;


    onLoad() {
        ViewManager.instance = this;
        window["vm"] = this;
        this.modal.active = true;
        this.modalTouchBlocker = this.modal.getComponent(cc.BlockInputEvents);
        this.modalTouchBlocker.enabled = false;

        // 가로가 긴 기기 대응: modal 크기를 화면에 맞게 설정
        this.updateModalSize();
    }

    /**
     * Modal 배경 크기를 화면 크기에 맞게 업데이트
     * 가로가 긴 기기에서도 전체 화면을 덮도록 함
     */
    private updateModalSize() {
        if (this.modal) {
            // 화면보다 충분히 크게 설정 (2배, 최소 3000)
            const width = Math.max(cc.winSize.width, cc.visibleRect.width) * 2;
            const height = Math.max(cc.winSize.height, cc.visibleRect.height) * 2;
            this.modal.setContentSize(Math.max(width, 3000), Math.max(height, 3000));
        }
    }

    get allViews() {
        if (this._views == null) {
            return []
        }
        return Object.keys(this._views).map(k => this._views[k])
    }

    onEnable() {

    }

    onDestroy() {
        for (var key in this._views) {
            delete this._views[key];
        }
        ViewManager.instance = null;
    }

    start() {

    }
    private getVisibleDialog() {
        let viewStacks = Object.keys(this._views).map(k => this._views[k]).sort((a, b) => b.node.zIndex - a.node.zIndex)
        return viewStacks.find(v => v.isDialog && v.node.active)
    }

    public hasVisibleDialog() {
        for (var name in this._views) {
            let view = this._views[name]
            if (view.isDialog) {
                if (this.isVisible(name)) {
                    return true
                }
            }
        }
        return false;
    }

    public isVisible(viewname) {
        let view = null;
        if (typeof (viewname) == "string")
            view = this._views[viewname]
        else
            view = viewname;
        if (view) {
            return view.node.active;
        }
        return false
    }

    view(name) {
        return this._views[name]
    }

    private attachViewComp(existingView: cc.Node): View {
        let viewComp = null;
        if (viewComp == null || viewComp == undefined) {
            viewComp = existingView.getComponent(View);
            if (viewComp == null) {
                viewComp = existingView.addComponent(View);
                viewComp.init(existingView.name);
            }
            this._views[viewComp.name] = viewComp;
        }
        return viewComp;
    }

    private showView(view: View, ...params) {
        this.modalTouchBlocker.enabled = view.isDialog;
        if (this.hasVisibleDialog() || view.isDialog) {
            this.modalTouchBlocker.enabled = true;
        }
        if (this.modalTouchBlocker.enabled) {
            this.targetModalOpacity = view.opacity;
        }
        this.updateZIndex(view);
        this.audio_show && Device.playEffect(this.audio_show);
        LocalizationManager.localizeNode(view.node);
        return view.show(...params);
    }

    update() {
        this.modal.opacity = cc.misc.lerp(this.modal.opacity, this.targetModalOpacity, 0.1);
    }

    showFromPrefab(prefab: cc.Prefab, prefabPath: string, ...params) {
        let view = this._views[prefabPath];
        if (view == null) {
            let node = cc.instantiate(prefab)
            if (node == null) {
                throw new Error("Error Occurs While Creating View:" + prefabPath);
            }
            view = node.getComponent(View)
            if (view == null) {
                view = node.addComponent(View);
                view.isDialog = true;
            }
            view.prefab = prefab;
            let widget = view.getComponent(cc.Widget);
            if (widget)
                widget.target = cc.find("Canvas")
            view.init(prefabPath);
            this._views[prefabPath] = view;
            if (view.isDialog) {
                this.node.addChild(node, 1000);
            } else {
                this.node.addChild(node, 1000);
            }
        }
        this.node.color.setA(255);
        console.log(TAG, "show view:" + prefabPath)
        return this.showView(view, ...params);
    }

    showFromPrefabPath(prefabPath: string, ...params) {
        let view = this._views[prefabPath]
        if (view == null || view == undefined) {
            let beforeTime = new Date().getTime();
            Loading && Loading.show(5)
            return new Promise<View>((resolve, reject) => {
                cc.loader.loadRes(prefabPath, cc.Prefab, (e, prefab: cc.Prefab) => {
                    Loading && Loading.hide();
                    console.log(TAG, prefabPath + " loaded in " + (new Date().getTime() - beforeTime) + "ms")
                    this.showFromPrefab(prefab, prefabPath, ...params).then(resolve)
                })
            })
        } else {
            this.showView(view, ...params);
        }
    }

    // preload(prefabPath: string) {
    //     let view = this._views[prefabPath]
    //     if (view == null || view == undefined) {
    //         cc.loader.loadRes(prefabPath, cc.Prefab, (e, prefab: cc.Prefab) => {
    //             console.log(TAG, "preload view" + prefabPath)
    //             let node = cc.instantiate(prefab)
    //             view = node.getComponent(View);
    //             let widget = view.getComponent(cc.Widget);
    //             if (widget)
    //                 widget.target = cc.find("Canvas")
    //             view.init(prefabPath);
    //             this._views[prefabPath] = view;
    //             // this.scheduleOnce(_=>node.active = false,0);
    //             if (view.isDialog) {
    //                 this.node.addChild(node, 1000);
    //             } else {
    //                 this.node.addChild(node, 1000);
    //             }
    //             view.hide();
    //         })
    //     } else {
    //     }
    // }

    // will enableTouch next show up
    disableTouch(viewNode) {
        let view = viewNode.getComponent(View)
        if (view) {
            view.touchEnabled = false;
        }
    }

    enableTouch(viewNode) {
        let view = viewNode.getComponent(View)
        if (view) {
            view.touchEnabled = true;
        }
    }


    show(view, ...params) {
        // disable current view 's touch 
        // let isDialog = false;
        // if (view instanceof cc.Component) {
        //     let v = view.getComponent(View)
        //     isDialog = v.isDialog;
        // }
        for (var i = 0; i < this.node.childrenCount; i++) {
            let v = this.node.children[i]
            let vview = v.getComponent(View);
            if (vview) {
                if (vview.topMost) {
                    v.zIndex = 9999;
                } else {
                    v.zIndex = i * 2;
                }
            } else {
                // if (Loading && v == Loading.loadingNode) {
                //     v.zIndex = 99999;
                // } else {
                //     v.zIndex = i;
                // }
            }
        }
        if (typeof (view) == "string") {
            if (view.indexOf(this.baseDir) == -1) {
                view = this.baseDir + view;
            }
            return this.showFromPrefabPath(view, ...params);
        }
        else {
            if (view == null || view == undefined) return;
            if (view.node) view = view.node;
            let v = this.attachViewComp(view)
            return this.showView(v, ...params);
        }
    }

    updateZIndex(view: View) {
        if (!view.topMost) {
            if (view.isDialog) {
                view.node.zIndex = 1000;
                this.modal.zIndex = 999;
            }
        }
    }

    hide(viewname) {
        if (typeof (viewname) != "string") {
            // get view name 
            if (viewname == null || viewname == undefined) return;
            let v = this.attachViewComp(viewname)
            viewname = v.name;
        }
        if (viewname.indexOf(this.baseDir) == -1) {
            viewname = this.baseDir + viewname;
        }
        let view = this._views[viewname]
        if (view != null && view != undefined) {
            if (view.node.active == false) return;
            view.node.active = false;
            if (view.isDialog) {
                this.targetModalOpacity = 0;
                this.modalTouchBlocker.enabled = false;
            }
            if (this.hasVisibleDialog()) {
                this.modalTouchBlocker.enabled = true;
                this.targetModalOpacity = view.opacity;
            }
            view.doHideAnimation();
            view.onHidden();
            this.audio_hide && Device.playEffect(this.audio_hide);
            evt.emit(view.node.name + ".onHidden")
            evt.emit("View.onHidden", view);
        }
    }

    checkViewStacks() {
        let dialog = this.getVisibleDialog()
        if (dialog) {
            this.modalTouchBlocker.enabled = true;
            this.targetModalOpacity = dialog.opacity;
            this.updateZIndex(dialog);
        } else {
            this.modalTouchBlocker.enabled = false;
            this.targetModalOpacity = 0;
        }
    }

    private static _hideFunc: Function = null;

    public static setHideFunc(func: ((node: cc.Node, callback?: Function, target?: any) => Promise<any> | any)) {
        this._hideFunc = func;
    }

    playHideAnim(viewNode, endCallback: Function, endCallbackTarget?) {
        if (ViewManager._hideFunc) {
            let ret = ViewManager._hideFunc(viewNode, endCallback, endCallbackTarget)
            if (ret instanceof Promise) {
                ret.then(v => endCallback.call(endCallbackTarget))
            }
        } else {
            //sorry 
            console.warn("[ViewManager]invoke [setHideFunc] to register hide-animation first ")
            endCallback.call(endCallbackTarget);
        }
    }


    private static _showFunc: Function = null;

    public static setShowFunc(func: ((node: cc.Node, callback?: Function, target?: any) => Promise<any> | any)) {
        /**
         * 注意打开UI的动画函数不可第一帧不可以更改scale.否则会影响 CCWidget 
         */
        this._showFunc = func;
    }

    playShowAnim(viewNode, endCallback: Function, endCallbackTarget?) {
        if (ViewManager._showFunc) {
            let ret = ViewManager._showFunc(viewNode, endCallback, endCallbackTarget)
            if (ret instanceof Promise) {
                ret.then(v => endCallback.call(endCallbackTarget))
            }
        } else {
            console.warn("[ViewManager]invoke [setShowFunc] to register show-animation first")
            endCallback.call(endCallbackTarget);
        }
    }


    hideAll() {
        for (var viewname in this._views) {
            // let view = this._views[viewname]
            this.hide(viewname);
        }
    }

}
