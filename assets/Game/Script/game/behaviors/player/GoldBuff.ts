import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import { FizzBodyType } from "../../../../../framework/fizzx/components/FizzBody";
import { root } from "../../Game";
import Obstacle from "../../objects/Obstacle";

let { ccclass, property } = cc._decorator
@ccclass
export default class GoldBuff extends cc.Component {

    // GenericBuff에서 전달받는 버프 데이터
    buffData: { startIndex?: number } = null;

    // 초기화 플래그 - lazy init 패턴
    private _initialized: boolean = false;

    onLoad() {
        this.schedule(this.tagUpdate, 0.02);  // 더 빠른 간격
    }

    idx: number = 0

    onEnable() {
        this._initialized = false;
        this.pool = [];
        this.initializeIndex();  // 즉시 초기화 (라이브 startIndex 사용하므로 대기 불필요)
    }

    private initializeIndex() {
        if (this._initialized) return;

        // 플레이어 위치 기준으로 앞에 있는 장애물부터 시작
        let playerX = root.player.node.x;
        let layer = root.obstacleLayer;

        // startIndex부터 순회하면서 플레이어보다 앞(x가 큰)에 있는 첫 번째 장애물 찾기
        this.idx = layer.startIndex;
        for (let i = layer.startIndex; i < layer.endIndex; i++) {
            let node = layer.get(i);
            if (node && node.isValid && node.x >= playerX) {
                this.idx = i;
                break;
            }
        }

        this._initialized = true;

        console.log(`[GoldBuff] 초기화 완료: playerX=${playerX.toFixed(0)}, startIdx=${this.idx}`);

        // 즉시 첫 업데이트 실행
        this.tagUpdate();
    }

    pool: cc.Vec2[] = []

    tagUpdate() {
        // lazy initialization - buffData 할당 후 첫 호출 시 초기화
        if (!this._initialized) {
            this.initializeIndex();
            return; // initializeIndex에서 tagUpdate 호출됨
        }

        let node = root.obstacleLayer.get(this.idx)
        if (!node || !node.isValid) {
            if (this.idx < root.obstacleLayer.endIndex) {
                this.idx++;
            }
            return;
        }

        // 범위 체크: 플레이어 위치 + 화면 1.5개 너비 이내만 변환
        let playerX = root.player.node.x;
        let maxRange = cc.winSize.width * 1.5;
        if (node.x > playerX + maxRange) {
            return; // 범위 밖 - 대기 (플레이어가 가까이 올 때까지)
        }

        let obstacle = node.getComponent(Obstacle)
        if (obstacle) {
            FxHelpher.play("map", "gold_turn", node.getPosition())
            this.turnToCoins(obstacle);
            obstacle.node.destroy();
        }
        this.idx++;
    }
    //todo 需要预先加载 一些银币
    turnToCoins(obstacle: Obstacle) {
        let wh = cc.v2(obstacle.body.hw, obstacle.body.hh);
        let pos = obstacle.body.getPosition();
        let size = obstacle.data.size;
        let px = 60, py = 60
        let startY = 30;
        console.log(`[GoldBuff.turnToCoins] size=${size.width}x${size.height}, pos=(${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})`);
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
            console.log(`[GoldBuff.update] 코인 생성: (${p.x.toFixed(0)}, ${p.y.toFixed(0)}), pool 남음=${this.pool.length}`);
            root.makeItem("gold", "gold_coin0", p.x, p.y);
        }
    }


    onDisable() {

    }
}