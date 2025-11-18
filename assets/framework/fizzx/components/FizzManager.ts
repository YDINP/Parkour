import Fizz from "../fizz";
import FizzHelper from "./FizzHelper";
import FizzBody from "./FizzBody";
import Shapes, { ShapeType } from "../shapes";

const { ccclass, property, menu, executionOrder } = cc._decorator;

@ccclass
@menu("fizzx/FizzManager")
@executionOrder(-1)
export default class FizzManager extends cc.Component {

    static instance: FizzManager = null;

    @property(cc.TiledMap)
    tiledmap: cc.TiledMap = null;

    @property(cc.Graphics)
    graphics: cc.Graphics = null;

    @property
    gravity: cc.Vec2 = cc.v2(0, -1000);
    @property
    maxSpeed: number = 1000;

    @property
    debug: boolean = false;

    @property
    ignore_up_drag: boolean = true;

    _inited: boolean = false;

    onLoad() {
        FizzManager.instance = this;
        this.graphics = this.graphics || this.getComponent(cc.Graphics);
        if (this.graphics) {
            this.graphics.node.zIndex = 99999;
        }
        this.tiledmap = this.tiledmap || this.getComponent(cc.TiledMap);

        Fizz.ignore_up_drag = this.ignore_up_drag;
        window['fizz'] = Fizz;

    }

    onDestroy() {
        Fizz.cleanup();
        FizzManager.instance = null;
    }

    private _init() {
        let size = this.tiledmap.getMapSize();
        let tilesize = this.tiledmap.getTileSize();
        let w = size.width * tilesize.width;
        let h = size.height * tilesize.height
        Fizz.init(w, h, this.shouldCollide.bind(this));
        FizzHelper.initWithMap(w, h);
        Fizz.setGravity(this.gravity.x, this.gravity.y);
        Fizz.setMaxSpeed(this.maxSpeed);
    }

    init() {
        if (!this._inited) {
            this._init();
            this._inited = true;
        }
    }

    start() {
        this.init();
    }

    getCenter(node: cc.Node) {
        let rect = node.getBoundingBox()
        let c = node.parent.convertToWorldSpaceAR(rect.center)
        return this.node.convertToNodeSpaceAR(c);
    }

    private drawShape(body) {
        if (body.shape == ShapeType.rect) {
            let [x, y, hw, hh] = Shapes.bounds(body)
            if (body.enabled) {
                this.graphics.fillColor = cc.Color.ORANGE;
                this.graphics.fillColor.a = 120;
                this.graphics.fillRect(x - hw, y - hh, hw * 2, hh * 2);
            } else if (body.enabled == false) {
                this.graphics.rect(x - hw, y - hh, hw * 2, hh * 2);
                this.graphics.stroke();
            } else {
                this.graphics.fillColor = cc.Color.GREEN;
                this.graphics.fillColor.a = 120;
                this.graphics.fillRect(x - hw, y - hh, hw * 2, hh * 2);
            }
        } else if (body.shape == ShapeType.line) {
            this.graphics.moveTo(body.x, body.y)
            this.graphics.lineTo(body.x2, body.y2)
            this.graphics.stroke();
        }
    }

    lateUpdate() {
        Fizz.update(0.016);
        if (this.debug) {
            this.graphics.clear()
            Fizz.statics.forEach(v => this.drawShape(v))
            Fizz.dynamics.forEach(v => this.drawShape(v))
            Fizz.kinematics.forEach(v => this.drawShape(v))
        }
        // Fizz.statics.forEach(v=>{
        //     if(v.node)
        //         v.node.position = v
        // })
        // Fizz.kinematics.forEach(v=>v.node.position = v)
    }

    static getHitPoint(a: FizzBody, b: FizzBody, nx, ny) {
        let x = b.x + nx * b.hw
        let y = b.y + ny * b.hh;
        if (ny == 0) {
            if (b.hh < a.hh) {
                y = b.y;
            } else {
                y = a.y;
            }
            //不用计算精确位置
            // y = (max(a.min, b.min) + min(a.max, b.max)) / 2
        } else if (nx == 0) {
            if (b.hw < a.hw) {
                x == b.x;
            } else {
                x = a.x;
            }
            //不用计算精确位置
            // x = (max(a.min, b.min) + min(a.max, b.max)) / 2
        }
        return cc.v2(x, y);
    }


    shouldCollide(c1: FizzBody, c2: FizzBody) {
        let node1 = c1.node, node2 = c2.node;
        if (node1 == node2) return;
        if (node1 == null || node2 == null) return true;
        //@ts-ignore
        let collisionMatrix = cc.game.collisionMatrix;
        return collisionMatrix[node1.groupIndex][node2.groupIndex];
    }

}