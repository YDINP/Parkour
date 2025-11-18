let { ccclass, property } = cc._decorator

let lx: number = 0;
let ly: number = 0;
let rx: number = 0;
let ry: number = 0;

@ccclass
export default class SortedCursorLayer extends cc.Component {
    items: Map<number, cc.Node> = new Map();
    startIndex: number = 0;

    func_isInValid: Function;

    endIndex: number = 0;

    onLoad() {
        if (lx == 0 || rx == 0) {
            let w = cc.winSize.width;
            let h = cc.winSize.height;
            lx = -w / 2;
            rx = w / 2;
            ly = -h / 2;
            ry = h / 2;
        }
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
                let x = item.x + item.parent.parent.x + item.width / 2;
                if (x < lx) {
                    item.destroy();
                    this.items.delete(this.startIndex++)
                }
            } else {
                this.items.delete(this.startIndex++)
            }
            // if (this.func_isInValid && this.func_isInValid(item)) {
            //     this.startIndex++;
            // }
        }
    }

    push(node) {
        this.items.set(this.endIndex++, node)
    }

    get(idx) {
        return this.items.get(idx);
    }
}