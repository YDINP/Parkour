let { ccclass, property } = cc._decorator

// 화면 5개분 버퍼
const DESTROY_BUFFER_SCREENS = 5;

@ccclass
export default class SortedCursorLayer extends cc.Component {
    items: Map<number, cc.Node> = new Map();
    startIndex: number = 0;

    func_isInValid: Function;

    endIndex: number = 0;

    onLoad() {
    }

    update() {
        this.checkValidIndex();
    }


    checkValidIndex() {
        let item = this.get(this.startIndex);
        if (item) {
            if (!item.isValid) {
                this.items.delete(this.startIndex++)
                return;
            }
            if (item && item.parent) {
                // 화면 왼쪽 경계(-width/2) - 5개분 버퍼 = -5.5*width
                // 카메라 고정, 맵 이동 방식이므로 고정값 사용
                let lx = -cc.winSize.width / 2 - cc.winSize.width * DESTROY_BUFFER_SCREENS;
                // 아이템의 월드 x 좌표 (item.x + mapNode.x)
                let worldX = item.x + item.parent.parent.x;
                if (worldX < lx) {
                    item.destroy();
                    this.items.delete(this.startIndex++)
                }
            } else {
                this.items.delete(this.startIndex++)
            }
        }
    }

    push(node) {
        this.items.set(this.endIndex++, node)
    }

    get(idx) {
        return this.items.get(idx);
    }
}