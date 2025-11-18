let { ccclass, property } = cc._decorator
@ccclass
export default class BlinkRed extends cc.Component {

    topSp: cc.Sprite = null;
    times: number;
    duration: number;

    onLoad() {
        let node = new cc.Node();
        this.topSp = node.addComponent(cc.Sprite);

        node.color = cc.Color.RED;
        let originSprite = this.getComponent(cc.Sprite);
        if (originSprite == null) {
            originSprite = this.getComponentInChildren(cc.Sprite);
        }
        this.topSp.spriteFrame = originSprite.spriteFrame;
        node.parent = originSprite.node;
        node.setAnchorPoint(originSprite.node.getAnchorPoint());
        this.topSp.dstBlendFactor = 1;

    }

    start() {

    }

    onEnable() {
        this.topSp.node.active = true;
        this.topSp.node.runAction(cc.blink(this.duration, this.times))
        this.unschedule(this.disable);
        this.schedule(this.disable, this.duration)
    }

    disable() {
        this.topSp.node.active = false;
        this.enabled = false;
    }

}