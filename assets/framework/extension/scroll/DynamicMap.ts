import { LocalizationManager } from "../../Hi5/Localization/LocalizationManager";
import Signal from "../../core/Signal";
import ccUtil from "../../utils/ccUtil";

const { ccclass, property, menu } = cc._decorator;

enum Direction {
    Horizontal,//left to right
    Vertical // bottom to top
}

@ccclass
@menu("mimgame/scroll/DynamicMap")
export default class DynamicMap extends cc.Component {

    curSeg: cc.Node;
    nextSeg: cc.Node = null
    segIdx: number = -1;
    @property(cc.Prefab)
    segments: cc.Prefab[] = []
    // 从哪里开始创建 
    @property({ displayName: 'start' })
    cursor: number = -1;

    //是否是无尽
    isInfinite: boolean = false;

    @property({ type: cc.Enum(Direction) })
    dir: Direction = Direction.Horizontal;

    signal: Signal = new Signal();

    isEnd: boolean = false;

    running: boolean = false;

    isLoadOnce: boolean = false;

    onLoad() { }
    onDestroy() {
        this.signal.clear()
    }
    start() {
        if (this.dir == Direction.Horizontal) {
            if (this.cursor < 0) {
                this.cursor = cc.visibleRect.width;
            }
        } else {
            if (this.cursor < 0)
                this.cursor = cc.visibleRect.height;
        }
    }

    /**bLoadAll 是否一次性加载地图 */
    begin(bLoadAll) {
        this.running = true;
        this.isLoadOnce = bLoadAll;
        //레벨 생성 시작
        console.warn("레벨 생성 시작")
        let segcount = this.segments.length;
        if (bLoadAll) {
            for (var i = 0; i < segcount + 1; i++) {
                this.curSeg = this.createNextSeg();
            }
        } else {
            if (this.curSeg == null) {
                this.curSeg = this.createNextSeg();
            }
        }
    }

    addSements(...prefabs: cc.Prefab[]) {
        this.segments.push(...prefabs);
    }

    _addToSeg() {
        //get random prefab
        // this.levels.push(prefab);
    }

    next() {
        // this._addToSeg();
    }

    createNextSeg() {
        let idx = this.segIdx + 1
        if (idx > this.segments.length - 1) {
            if (this.isInfinite) {
                this.next();
            } else {
                //레벨 없음
                console.log("레벨 세그먼트 없음")
                this.isEnd = true;
                this.signal.fire("end", this.cursor)
                return;
            }
        }

        this.segIdx = cc.misc.clampf(idx, 0, this.segments.length - 1);
        let prefab = this.segments[this.segIdx]
        console.warn("create next level:", prefab.name);
        // let node = cc.instantiate(prefab);
        let node = LocalizationManager.instantiatePrefab(prefab);
        // let roadType = this.levels_roadAvatar[this.levelIndex]
        if (node == null) {
            console.error("create segment failed:", this.segments, this.segIdx)
            return null;
        }
        if (this.dir == Direction.Horizontal) {
            node.setPosition(this.cursor, 0);
            this.cursor += node.width - 8;
        } else {
            node.setPosition(0, this.cursor);
            this.cursor += node.height - 8;
        }
        this.signal.fire("newSegCreated", node);
        //删除
        this.segments.shift();
        this.segIdx -= 1
        node.name = prefab.name;
        node.setParent(this.node);
        return node
    }

    /**在camera 左边 - 가로가 긴 기기 대응: 버퍼 추가 */
    isOutOfCameraLeft(node) {
        let camera = cc.Camera.main;
        // var rect = node.getBoundingBoxToWorld();
        var rect = ccUtil.getWorldBoundingBox(node);
        var p = camera.getWorldToCameraPoint(cc.v2(rect.xMax, 0), cc.Vec2.ZERO);
        // 버퍼를 추가하여 화면 밖으로 충분히 나간 후 제거 (화면 너비의 50%)
        const buffer = cc.winSize.width * 0.5;
        if (p.x < -buffer) {
            return true
        }
        return false
    };

    update() {
        if (this.isLoadOnce) return;
        if (!this.running) return;
        for (let i = 0; i < this.node.childrenCount; i++) {
            const child = this.node.children[i]
            if (this.curSeg == child) continue;
            if (this.nextSeg == child) continue;
            let b = this.isOutOfCameraLeft(child);
            if (b) {
                console.warn("remove segment")
                this.signal.fire('removeSeg', child)
                child.destroy();
            }
        }
        if (this.isEnd) return;
        //vertical  check 
        // let h = cc.visibleRect.height;
        // let p = cc.Camera.main.getCameraToWorldPoint(cc.v2(0, h), cc.Vec2.ZERO);

        //horizentl check - 가로가 긴 기기 대응: 미리 생성

        let end
        let segEnd
        // 버퍼를 추가하여 미리 생성 (화면 너비의 50%)
        const buffer = cc.winSize.width * 0.5;
        if (this.dir == Direction.Horizontal) {
            let w = cc.visibleRect.width;
            end = cc.Camera.main.getCameraToWorldPoint(cc.v2(w + buffer, 0), cc.Vec2.ZERO).x
            // segEnd = this.curSeg.getBoundingBoxToWorld().xMax;
            segEnd = ccUtil.getWorldBoundingBox(this.curSeg).xMax;
        } else {
            let h = cc.visibleRect.height;
            end = cc.Camera.main.getCameraToWorldPoint(cc.v2(0, h + buffer), cc.Vec2.ZERO).y;
            // segEnd = this.curSeg.getBoundingBoxToWorld().yMax;
            segEnd = ccUtil.getWorldBoundingBox(this.curSeg).yMax;
        }

        if (segEnd - end <= 10) {
            if (this.nextSeg == null) {
                //create next 
                this.nextSeg = this.createNextSeg()
            }
        }
        if (segEnd - end <= 0) {
            //enter next 
            // console.log("enter next level");
            this.curSeg = this.nextSeg
            this.nextSeg = null;
        }
        // check bounding

    }
}