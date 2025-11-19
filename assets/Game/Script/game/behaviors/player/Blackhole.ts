import BuffSystem from "../../../../../framework/extension/buffs/BuffSystem";
import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import FizzBody, { FizzBodyType } from "../../../../../framework/fizzx/components/FizzBody";
import ccUtil from "../../../../../framework/utils/ccUtil";
import { root } from "../../Game";
import Player from "../../Player";
import Obstacle from "../../objects/Obstacle";

let { ccclass, property } = cc._decorator
@ccclass
export default class Blackhole extends cc.Component {

    player: Player = null;

    flyingBodies: FizzBody[] = []



    buffSystem: BuffSystem = null;

    onLoad() {
        this.player = this.getComponent(Player);
        this.schedule(this.tagUpdate, 0.03);
        this.buffSystem = this.getComponent(BuffSystem);
    }

    idx: number = 0

    blackHolePos: cc.Vec2;

    onEnable() {
        // play black hole 
        this.idx = root.obstacleLayer.startIndex;
        this.blackHolePos = cc.v2(cc.winSize.width / 2 * 3 / 4, 0)
        let buff = this.buffSystem.getBuff("blackhole")
        FxHelpher.play("screen", "blackHole&s=2&d=" + buff.timeLeft, this.blackHolePos)
    }

    tagUpdate() {
        let node = root.obstacleLayer.get(this.idx)
        if (node) {
            this.idx++;
            if (node.isValid) {
                let body = node.getComponent(FizzBody);
                if (body) {
                    // 블랙홀로 빨려들어가는 장애물은 충돌 무시 플래그 설정
                    let obstacle = node.getComponent(Obstacle);
                    if (obstacle) {
                        obstacle.isBeingSuckedByBlackhole = true;
                    }
                    // 충돌 그룹을 변경하여 플레이어와 충돌하지 않도록 함 (충돌 매트릭스에서 제외)
                    node.group = 'no_collision';
                    // Kinematic으로 설정하여 물리 시뮬레이션은 유지
                    body.bodyType = (FizzBodyType.Kinematic)
                    this.flyingBodies.push(body)
                    cc.tween(node).to(0.4, { scale: 0.2 }).start()
                    cc.tween(node).to(0.4, { opacity: 0 }).start()
                    cc.tween(node).to(0.4, { angle: 360 }).call(() => {
                        FxHelpher.play("map", "vanish", body.getPosition())
                        node.destroy();
                    }).start()
                }
            }
        }
    }

    update() {
        // get item nearby 
        // let pos = this.node.getPosition();
        let pos = root.mapNode.convertToNodeSpaceAR(cc.v2(cc.winSize.width * 5 / 6, cc.winSize.height / 2))
        for (let i = 0; i < this.flyingBodies.length; i++) {
            let body = this.flyingBodies[i]
            if (body.isValid) {
                let f = body.seek(pos, 2000)
                body.applyForce(f);
            } else {
                this.flyingBodies.splice(i--, 1)
            }
        }
    }


    onDisable() {
        for (let i = 0; i < this.flyingBodies.length; i++) {
            let body = this.flyingBodies[i];
            if (body.isValid) {
                body.stop(0.7);
            } else {
                this.flyingBodies.splice(i--, 1)
            }
        }
    }
}