

const { ccclass, property, requireComponent, menu } = cc._decorator;

@ccclass
@menu("mimgame/deprecate/FrameSwitcher")
export default class FrameSwitcher extends cc.Component {

    @property([cc.SpriteFrame])
    frames: cc.SpriteFrame[] = []
    // LIFE-CYCLE CALLBACKS:
    @property(cc.Sprite)
    target: cc.Sprite = null;

    _index: number = 0

    @property
    randomOnLoad: boolean = false;

    onLoad() {
        if (this.target == null)
            this.target = this.getComponent(cc.Sprite);
        if (this.randomOnLoad)
            this.switchRandom()
    }

    switchRandom() {
        this.index = gUtil.randomInt(0, this.frames.length);
    }

    set index(k) {
        this.switch(k);
    }

    get index() {
        return this._index
    }

    switch(index) {
        let len = this.frames.length;
        let idx = Math.min(Math.max(0, index), len - 1);
        this.target.spriteFrame = this.frames[idx]
        this._index = idx;
    }

    start() {

    }

    // update (dt) {}
}
