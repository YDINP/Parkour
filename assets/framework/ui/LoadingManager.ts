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

        // 화면 크기에 맞게 loadingModal 크기 동적 설정
        this.updateLoadingSize();
    }

    /**
     * 화면 크기에 맞게 loadingModal 크기 업데이트
     */
    private updateLoadingSize() {
        if (this.loadingNode) {
            const width = Math.max(cc.winSize.width, cc.visibleRect.width) * 2;
            const height = Math.max(cc.winSize.height, cc.visibleRect.height) * 2;
            this.loadingNode.setContentSize(Math.max(width, 5000), Math.max(height, 5000));
            this.loadingNode.setPosition(0, 0);
        }
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
        if (!this.loadingNode) return;
        this.loadingNode.active = false;
        if (this.rotate) {
            this.loadingNode.pauseAllActions();
        }
        this.unschedule(this.dealyClose);
        console.log("loading exit----------")
    }

    /**
     * 심플 인디케이터 표시 (FriendMaker 스타일)
     * 타임아웃 없이 표시, hideIndicator()로 숨김
     */
    indicator() {
        if (!this.loadingNode) return;
        this.loadingNode.active = true;
        this.loadingNode.resumeAllActions();
        this.blockEventComp.enabled = true;
        this.unschedule(this.dealyClose);
        console.log("[Indicator] show");
    }

    /**
     * 인디케이터 숨기기
     */
    hideIndicator() {
        this.hide();
        console.log("[Indicator] hide");
    }

    onDestroy() {
        Loading = null;
    }

}
