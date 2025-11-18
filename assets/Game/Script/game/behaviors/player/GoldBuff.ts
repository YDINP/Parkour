import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import { FizzBodyType } from "../../../../../framework/fizzx/components/FizzBody";
import { root } from "../../Game";
import Obstacle from "../../objects/Obstacle";

let { ccclass, property } = cc._decorator
@ccclass
export default class GoldBuff extends cc.Component {

    onLoad() {
        this.schedule(this.tagUpdate, 0.05);
    }

    idx: number = 0

    onEnable() {
        this.idx = root.obstacleLayer.startIndex;
        this.tagUpdate();
    }

    pool: cc.Vec2[] = []

    tagUpdate() {
        let node = root.obstacleLayer.get(this.idx)
        if (!node || !node.isValid) {
            if (this.idx < root.obstacleLayer.endIndex) {
                this.idx++;
            }
            return;
        }
        let obstacle = node.getComponent(Obstacle)
        if (obstacle) {
            FxHelpher.play("map", "gold_turn", node.getPosition())
            // obstacle.turnToGold();
            obstacle.node.destroy();
            this.turnToCoins(obstacle);

        }
        this.idx++;
    }
    //todo 需要预先加载 一些银币
    turnToCoins(obstacle: Obstacle) {
        let wh = cc.v2(obstacle.body.hw, obstacle.body.hh);
        let pos = obstacle.body.getPosition();
        // let area = Shapes.area(obstacle.body);
        // let count = Math.min(wh.x * wh.y / 1000, 6);
        let size = obstacle.data.size;
        let px = 60, py = 60
        let startY = 30;
        for (let i = 0; i < size.width; i++) {
            for (let j = 0; j < size.height; j++) {
                let xy = cc.v2(pos.x + i * px - wh.x, pos.y + j * py - wh.y + startY)
                this.pool.push(xy);
            }
        }
    }

    update() {
        let p = this.pool.shift();
        if (p) {
            root.makeItem("gold", "gold_coin0", p.x, p.y);
        }

    }


    onDisable() {

    }
}