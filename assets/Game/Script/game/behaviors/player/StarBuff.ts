import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import { root } from "../../Game"
import Item from "../../objects/Item";

let { ccclass, property } = cc._decorator
@ccclass
export default class StarBuff extends cc.Component {

    // GenericBuff에서 전달받는 버프 데이터
    buffData: { startIndex?: number } = null;

    // 초기화 플래그 - lazy init 패턴
    private _initialized: boolean = false;

    onLoad() {
        this.schedule(this.tagUpdate, 0.01);  // 더 빠른 간격
    }

    idx: number = 0

    onEnable() {
        this._initialized = false;
        this.initializeIndex();  // 즉시 초기화 (라이브 startIndex 사용하므로 대기 불필요)
    }

    private initializeIndex() {
        if (this._initialized) return;

        // 플레이어 위치 기준으로 앞에 있는 아이템부터 시작
        let playerX = root.player.node.x;
        let layer = root.itemLayer;

        // startIndex부터 순회하면서 플레이어보다 앞(x가 큰)에 있는 첫 번째 아이템 찾기
        this.idx = layer.startIndex;
        for (let i = layer.startIndex; i < layer.endIndex; i++) {
            let node = layer.get(i);
            if (node && node.isValid && node.x >= playerX) {
                this.idx = i;
                break;
            }
        }

        this._initialized = true;

        // console.log(`[StarBuff] 초기화 완료: playerX=${playerX.toFixed(0)}, startIdx=${this.idx}`);

        // 즉시 첫 업데이트 실행
        this.tagUpdate();
    }



    tagUpdate() {
        // lazy initialization - buffData 할당 후 첫 호출 시 초기화
        if (!this._initialized) {
            this.initializeIndex();
            return; // initializeIndex에서 tagUpdate 호출됨
        }

        let node = root.itemLayer.get(this.idx)
        if (!node || !node.isValid) {
            if (this.idx < root.itemLayer.endIndex) {
                // console.log(`[StarBuff.tagUpdate] 노드 없음/무효: idx=${this.idx}, endIndex=${root.itemLayer.endIndex}`);
                this.idx++;
            }
            return;
        }
        let item = node.getComponent(Item)
        if (item && item.data.isBean) {
            //所有豆子变星星
            // console.log(`[StarBuff.tagUpdate] 콩→별 변환: idx=${this.idx}, name=${node.name}`);
            FxHelpher.play("map", "star_turn", node.getPosition())
            item.changeItem("item_004")
        } else {
            // console.log(`[StarBuff.tagUpdate] 콩 아님: idx=${this.idx}, name=${node.name}, isBean=${item?.data?.isBean}`);
        }
        this.idx++;
    }


    onDisable() {

    }

}