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
        // 가로가 긴 기기 대응: 배경 복사 개수를 늘림 (5개: -2, -1, 0, 1, 2)
        let child = this.node.children[0]
        this.size = child.getContentSize();
        if (this.horizontal_repeat) {
            // 화면 너비에 맞게 복사본 개수 계산 (최소 5개)
            const screenWidth = cc.winSize.width;
            const copyCount = Math.max(4, Math.ceil(screenWidth / child.width) * 2);
            const halfCount = Math.floor(copyCount / 2);

            for (let i = 1; i <= halfCount; i++) {
                let cLeft = cc.instantiate(child);
                let cRight = cc.instantiate(child);
                cLeft.parent = this.node;
                cRight.parent = this.node;
                cLeft.x = -child.width * i;
                cRight.x = child.width * i;
            }
            child.width += this.padding;
        } else if (this.vertical_repeat) {
            // 세로도 동일하게 확장
            const screenHeight = cc.winSize.height;
            const copyCount = Math.max(4, Math.ceil(screenHeight / child.height) * 2);
            const halfCount = Math.floor(copyCount / 2);

            for (let i = 1; i <= halfCount; i++) {
                let cBottom = cc.instantiate(child);
                let cTop = cc.instantiate(child);
                cBottom.parent = this.node;
                cTop.parent = this.node;
                cBottom.y = -child.height * i;
                cTop.y = child.height * i;
            }
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