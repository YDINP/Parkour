import Switcher from "./Switcher";
import Signal from "../../core/Signal";


const { ccclass, property, menu } = cc._decorator;

enum CrossPadDir {
    Idle,
    Left,
    Right,
    Up,
    Down,
}

@ccclass
@menu("mimgame/Controller/CrossPad")
export default class CrossPad extends cc.Component {

    static Dir = CrossPadDir;
    switcher: Switcher;

    @property(cc.Node)
    left: cc.Node = null;
    @property(cc.Node)
    right: cc.Node = null;
    @property(cc.Node)
    up: cc.Node = null;
    @property(cc.Node)
    down: cc.Node = null;

    onTouchUp: Signal = new Signal();

    dirs: cc.Node[] = []

    start() {
        this.switcher = this.getComponentInChildren(Switcher);

        this.dirs = [this.left, this.right, this.up, this.down];
        for (var i = 0; i < 4; i++) {
            var dir = this.dirs[i];
            dir["dir"] = i + 1;
            dir.on(cc.Node.EventType.TOUCH_END, this.onTouchUpC, this);
            dir.on(cc.Node.EventType.TOUCH_START, this.onTouchDownC, this);
        }
    }

    onTouchDownC(event) {
        let dir = event.target["dir"];
        this.switcher.index = dir;
    }


    onTouchUpC(evt) {
        this.switcher.index = 0;
        let dir = event.target["dir"];
        if (dir == CrossPadDir.Left) {
            console.log("touch left ");
        } else if (dir == CrossPadDir.Right) {
            console.log("touch Right ");
        }
        this.onTouchUp.fire(dir);
    }

    // update (dt) {}
}
