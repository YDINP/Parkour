const { ccclass, property, menu } = cc._decorator;

export var Loading: LoadingManager = null;

@ccclass
@menu("mimgame/UI/LoadingManager")
export default class LoadingManager extends cc.Component {

    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    loadingNode: cc.Node = null;
    loadingSprite: cc.Sprite = null;
    loadingText: cc.Label = null;
    blockEventComp: cc.BlockInputEvents = null;

    _callback: any = null;
    _target: any = null;

    @property
    rotate: boolean = true;

    onLoad() {
        this.loadingNode = cc.instantiate(this.prefab);
        this.blockEventComp = this.loadingNode.getComponent(cc.BlockInputEvents);
        this.loadingNode.parent = this.node;
        this.loadingSprite = this.loadingNode.getChildByName("loading").getComponent(cc.Sprite);
        this.loadingText = this.loadingNode.getComponentInChildren(cc.Label);
        this.hide();
        Loading = this;
        if (CC_DEBUG) {
            window['loading'] = this;
        }
        this.loadingNode.zIndex = 10000;
    }

    start() {
        if (this.rotate)
            this.loadingSprite.node.runAction(cc.rotateBy(4, 360).repeatForever());
    }

    dealyClose() {
        this.hide();
        if (this._callback) {
            this._callback.call(this._target)
        }
    }

    show(timeout, text = null, modal = true, callback = null, target = null) {
        if (!this.loadingNode) return
        this.loadingNode.active = true;
        this.loadingNode.resumeAllActions();
        this.blockEventComp.enabled = modal
        this._callback = callback
        this._target = target
        if (this.loadingText && text)
            this.loadingText.string = text;
        if (timeout > 0) {
            this.unschedule(this.dealyClose);
            this.scheduleOnce(this.dealyClose, timeout)
        }
        console.log("loading enter----------")
    }

    hide() {
        this.loadingNode.active = false;
        if (this.rotate) {
            this.loadingNode.pauseAllActions();

        }
        console.log("loading exit----------")
    }

    onDestroy() {
        Loading = null;
    }

}
