import Signal from "../../core/Signal";

const { ccclass, property, menu, executeInEditMode, inspector } = cc._decorator;

@ccclass
@menu("mimgame/Controller/Switcher")
@executeInEditMode()
@inspector("packages://qcontroller/inspector/switcher.js")
export default class Switcher extends cc.Component {
    public children: cc.Node[] = null;

    onValueChanged: Signal = new Signal();


    @property()
    _childrenCount: number = 0;

    @property()
    private _currentIndex: number = 0;


    @property({ displayName: "Interactable" })
    interactable: boolean = false;

    @property({ displayName: "Current Value" })
    public get currentIndex(): number {
        return this._currentIndex;
    }

    get index() {
        return this.currentIndex;
    }

    @property(cc.Node)
    _currentChild: cc.Node = null;


    public set currentIndex(value: number) {
        value = cc.misc.clampf(value, 0, this.children.length - 1);
        value = Math.floor(value);
        this._select(value);
    }


    public set resizeToCurrent(v) {
        if (v) {
            this.node.setContentSize(this._currentChild.getContentSize());
        }
    }

    btn: cc.Button = null;

    set _checkInteractive(v) {
        if (v) {
            this.btn = this.getComponent(cc.Button);
            if (this.btn == null) {
                this.btn = this.addComponent(cc.Button);
                this.btn.target = this._currentChild;
                let evt = new cc.Component.EventHandler();
                evt.target = this.node;
                evt.component = "Switcher";
                evt.handler = "switch"
                this.btn.clickEvents.push(evt);
            }
        } else {
            if (this.btn) {
                this.btn.destroy();
            }
        }
    }


    onLoad() {

        // this._currentIndex = this.children.indexOf(this.currentActiveNode);
    }

    resetInEditor() {

    }

    start() {
        this.children = this.node.children;
        this._childrenCount = this.children.length;
        this._select(this.currentIndex);
        // this.resizeToCurrent = true;
        this._checkInteractive = this.interactable;
    }

    _select(index: number) {
        this._currentIndex = index;
        this._currentChild = this.children[index];
        for (let i = 0; i < this.children.length; i++) {
            const element = this.children[i];
            if (i == index) {
                element.active = true;
            } else {
                element.active = false;
            }
        }
    }

    switch() {
        this.index = (this.currentIndex + 1) % (this._childrenCount);
    }

    set index(index: number) {
        if (!this.children) {
            this._currentIndex = index;
        }
        if (this.currentIndex != index) {
            this._select(index);
            this.onValueChanged.fire(index);
        }
    }

}