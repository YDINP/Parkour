import ccUtil from "../../utils/ccUtil";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/scroll/ParallaxNode")
export default class ParallaxNode extends cc.Component {

    @property
    offset: cc.Vec2 = cc.v2(1, 1);

    @property(cc.Node)
    refrenceNode: cc.Node = null;

    refrecenOffset: cc.Vec2 = cc.Vec2.ZERO;

    size: cc.Size = cc.winSize;

    @property
    horizontal_repeat: boolean = true

    @property
    vertical_repeat: boolean = false

    @property
    inverted: boolean = false;

    dir: number = 1;

    @property
    padding: number = 0;

    onLoad() {
        this.dir = this.inverted ? -1 : 1;
    }
    //需要在将需要 复制的层放在组件所在节点的子节点下
    // 且该节点只能放在摄像机下 面  作为子节点 
    //camera ->this -> content
    start() {
        this.refrecenOffset = this.refrenceNode.getPosition();
        //copy three children
        let child = this.node.children[0]
        this.size = child.getContentSize();
        if (this.horizontal_repeat) {
            let c1 = cc.instantiate(child)
            let c2 = cc.instantiate(child)
            c1.parent = this.node;
            c2.parent = this.node;
            c1.x = -child.width
            c2.x = child.width
            child.width += this.padding;
        } else if (this.vertical_repeat) {
            let c1 = cc.instantiate(child)
            let c2 = cc.instantiate(child)
            c1.parent = this.node;
            c2.parent = this.node;
            c1.y = -child.height;
            c2.y = child.height;
            child.height += this.padding;
        }

    }

    // setBackground(backgroundUrl: string, callback) {
    //     this.node.children.forEach(v => {
    //         // let sp = v.getComponent(cc.Sprite);
    //         callback(v)
    //     });
    // }

    setBackground(backgroundUrl: string) {
        this.node.children.forEach(v => {
            let sp = v.getComponent(cc.Sprite);
            if (backgroundUrl == '') sp.spriteFrame = null;
            else
                ccUtil.setDisplay(sp, backgroundUrl)
        });

    }

    update() {
        if (this.horizontal_repeat) {
            this.node.x = this.dir * (this.refrenceNode.x - this.refrecenOffset.x) * this.offset.x;
            this.node.x = this.node.x % this.size.width
        }
        else if (this.vertical_repeat) {
            this.node.y = this.dir * (this.refrenceNode.y - this.refrecenOffset.y) * this.offset.y;
            this.node.y = this.node.y % this.size.height
        }
        // this.node.y = this.node.y % this.size.height
    }
}