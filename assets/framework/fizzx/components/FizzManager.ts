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

    private readonly FIXED_DT: number = 0.016; // ~60fps 기준 스텝 (클램프 상한 산정용)

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

    lateUpdate(dt: number) {
        // 물리 스텝: 실제 프레임 dt로 전진 → 60/90/120Hz 어느 주사율에서도 렌더 프레임과 1:1 동기.
        //   이전 고정스텝(accumulator)은 고주사율에서 일부 프레임 0스텝/일부 1스텝이 되어
        //   캐릭터가 멈췄다 튀는 진동(stutter)이 발생했음. 가변 dt로 교체해 부드럽게.
        //   상한 클램프(=2스텝치)로 탭전환/랙스파이크 시 위치 점프·터널링만 방지.
        let step = dt > 0 ? dt : this.FIXED_DT;
        if (step > this.FIXED_DT * 2) step = this.FIXED_DT * 2;
        Fizz.update(step);

        if (this.debug) {
            this.graphics.clear()
            Fizz.statics.forEach(v => this.drawShape(v))
            Fizz.dynamics.forEach(v => this.drawShape(v))
            Fizz.kinematics.forEach(v => this.drawShape(v))
        }
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