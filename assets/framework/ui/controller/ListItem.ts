/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/6/6
 * @doc List Item Component.
 * Note:
 *      1. This component must be used with List component.
 * @end
 ******************************************/
const { ccclass, property, disallowMultiple, menu, executionOrder } = cc._decorator;

import ListView from './ListView';

enum SelectedType {
    NONE = 0,
    TOGGLE = 1,
    SWITCH = 2,
}

@ccclass
@disallowMultiple()
@menu('Custom Components/List Item')
@executionOrder(-5001)          // Execute before List
export default class ListItem extends cc.Component {
    // Icon
    @property({ type: cc.Sprite, tooltip: CC_DEV && 'Icon' })
    icon: cc.Sprite = null;
    // Title
    @property({ type: cc.Node, tooltip: CC_DEV && 'Title' })
    title: cc.Node = null;
    // Selection mode
    @property({
        type: cc.Enum(SelectedType),
        tooltip: CC_DEV && 'Selection Mode'
    })
    selectedMode: SelectedType = SelectedType.NONE;
    // Selected flag
    @property({
        type: cc.Node, tooltip: CC_DEV && 'Selected Flag',
        visible() { return this.selectedMode > SelectedType.NONE }
    })
    selectedFlag: cc.Node = null;
    // Selected SpriteFrame
    @property({
        type: cc.SpriteFrame, tooltip: CC_DEV && 'Selected SpriteFrame',
        visible() { return this.selectedMode == SelectedType.SWITCH }
    })
    selectedSpriteFrame: cc.SpriteFrame = null;
    // Unselected SpriteFrame
    _unselectedSpriteFrame: cc.SpriteFrame = null;
    // Adaptive size
    @property({
        tooltip: CC_DEV && 'Adaptive Size (width or height)',
    })
    adaptiveSize: boolean = false;
    // Selected state
    _selected: boolean = false;
    set selected(val: boolean) {
        this._selected = val;
        if (!this.selectedFlag)
            return;
        switch (this.selectedMode) {
            case SelectedType.TOGGLE:
                this.selectedFlag.active = val;
                break;
            case SelectedType.SWITCH:
                let sp: cc.Sprite = this.selectedFlag.getComponent(cc.Sprite);
                if (sp)
                    sp.spriteFrame = val ? this.selectedSpriteFrame : this._unselectedSpriteFrame;
                break;
        }
    }
    get selected() {
        return this._selected;
    }
    // Button component
    private _btnCom: any;
    get btnCom() {
        if (!this._btnCom)
            this._btnCom = this.node.getComponent(cc.Button);
        return this._btnCom;
    }
    // Dependent List component
    public list: ListView;
    // Whether events are registered
    private _eventReg = false;
    // Sequence id
    public listId: number;

    onLoad() {
        // // If no button component, selectedFlag is invalid
        // if (!this.btnCom)
        //     this.selectedMode == SelectedType.NONE;
        // Save corresponding data when selection mode is enabled
        if (this.selectedMode == SelectedType.SWITCH) {
            let com: cc.Sprite = this.selectedFlag.getComponent(cc.Sprite);
            this._unselectedSpriteFrame = com.spriteFrame;
        }
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.SIZE_CHANGED, this._onSizeChange, this);
    }

    _registerEvent() {
        if (!this._eventReg) {
            if (this.btnCom && this.list.selectedMode > 0) {
                this.btnCom.clickEvents.unshift(this.createEvt(this, 'onClickThis'));
            }
            if (this.adaptiveSize) {
                this.node.on(cc.Node.EventType.SIZE_CHANGED, this._onSizeChange, this);
            }
            this._eventReg = true;
        }
    }

    _onSizeChange() {
        this.list._onItemAdaptive(this.node);
    }
    /**
     * Create event
     * @param {cc.Component} component Component script
     * @param {string} handlerName Handler function name
     * @param {cc.Node} node Node where component is located (defaults to component.node if not provided)
     * @returns cc.Component.EventHandler
     */
    createEvt(component: cc.Component, handlerName: string, node: cc.Node = null) {
        if (!component.isValid)
            return;// Some async loaded nodes may already be destroyed
        component['comName'] = component['comName'] || component.name.match(/\<(.*?)\>/g).pop().replace(/\<|>/g, '');
        let evt = new cc.Component.EventHandler();
        evt.target = node || component.node;
        evt.component = component['comName'];
        evt.handler = handlerName;
        return evt;
    }

    showAni(aniType: number, callFunc: Function, del: boolean) {
        let acts: any[];
        switch (aniType) {
            case 0: // Disappear upward
                acts = [
                    cc.scaleTo(.2, .7),
                    cc.moveBy(.3, 0, this.node.height * 2),
                ];
                break;
            case 1: // Disappear rightward
                acts = [
                    cc.scaleTo(.2, .7),
                    cc.moveBy(.3, this.node.width * 2, 0),
                ];
                break;
            case 2: // Disappear downward
                acts = [
                    cc.scaleTo(.2, .7),
                    cc.moveBy(.3, 0, this.node.height * -2),
                ];
                break;
            case 3: // Disappear leftward
                acts = [
                    cc.scaleTo(.2, .7),
                    cc.moveBy(.3, this.node.width * -2, 0),
                ];
                break;
            default: // Default: shrink and disappear
                acts = [
                    cc.scaleTo(.3, .1),
                ];
                break;
        }
        if (callFunc || del) {
            acts.push(cc.callFunc(() => {
                if (del) {
                    this.list._delSingleItem(this.node);
                    for (let n: number = this.list.displayData.length - 1; n >= 0; n--) {
                        if (this.list.displayData[n].id == this.listId) {
                            this.list.displayData.splice(n, 1);
                            break;
                        }
                    }
                }
                callFunc();
            }));
        }
        this.node.runAction(cc.sequence(acts));
    }

    onClickThis() {
        this.list.selectedId = this.listId;
    }

}