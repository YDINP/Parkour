import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import FizzBody, { FizzBodyType } from "../../../../../framework/fizzx/components/FizzBody";
import { root } from "../../Game";
import ccUtil from "../../../../../framework/utils/ccUtil";
import Pet from "../../objects/Pet";

let { ccclass, property } = cc._decorator
@ccclass
export default class MagnetSuck extends cc.Component {

    body: FizzBody = null;

    flyingBodies: FizzBody[] = []

    // GenericBuff에서 전달받는 버프 데이터
    buffData: { startIndex?: number } = null;

    // 초기화 플래그 - lazy init 패턴
    private _initialized: boolean = false;

    onLoad() {
        this.body = this.getComponent(FizzBody);
        this.pet = this.getComponent(Pet)
    }

    start() {
        this.schedule(this.tagUpdate);
    }

    duration: number = 2;
    itemIndex: number = 0

    pet: Pet;

    onEnable() {
        // onEnable 시점에는 buffData가 아직 할당되지 않았을 수 있음
        // (addComponent 호출 중 onEnable이 먼저 실행되기 때문)
        // lazy initialization을 사용
        this._initialized = false;

        // flyingBodies 초기화 (이전 세션 데이터 제거)
        this.flyingBodies = [];

        if (this.pet) {
            this.pet.follower.target = null;
            this.pet.follower.offset = cc.visibleRect.center;
            this.pet.collect();
            this.pet.body.enabled = true;
        }
        FxHelpher.play("screen", "tip_cl", cc.v2(-cc.winSize.width * 0.25, 0))

        // 다음 프레임에 초기화 실행 (buffData 할당 후)
        this.scheduleOnce(() => {
            this.initializeIndex();
            this.tagUpdate(0, true);
        }, 0);
    }

    private initializeIndex() {
        if (this._initialized) return;

        // 플레이어 위치 기준으로 앞에 있는 아이템부터 시작
        let playerX = root.player.node.x;
        let layer = root.itemLayer;

        // startIndex부터 순회하면서 플레이어보다 앞(x가 큰)에 있는 첫 번째 아이템 찾기
        this.itemIndex = layer.startIndex;
        for (let i = layer.startIndex; i < layer.endIndex; i++) {
            let node = layer.get(i);
            if (node && node.isValid && node.x >= playerX) {
                this.itemIndex = i;
                break;
            }
        }

        this._initialized = true;

        console.log(`[MagnetSuck] 초기화 완료: playerX=${playerX.toFixed(0)}, startIdx=${this.itemIndex}`);
    }

    onDisable() {
        if (this.pet) {
            this.pet.run();
            this.pet.follower.reset();
            this.pet.body.enabled = false;
        }
        for (let i = 0; i < this.flyingBodies.length; i++) {
            let body = this.flyingBodies[i];
            if (body.isValid) {
                body.stop(0.7);
            } else {
                this.flyingBodies.splice(i--, 1)
            }
        }
    }

    doTag(bfind = true) {
        let node = root.itemLayer.get(this.itemIndex)
        if (node) {
            if (node.isValid) {
                let body = node.getComponent(FizzBody);
                if (body) {
                    body.bodyType = (FizzBodyType.Kinematic)
                    this.flyingBodies.push(body)
                    console.log(`[MagnetSuck.doTag] 아이템 태그됨: idx=${this.itemIndex}, name=${node.name}, flyingBodies.length=${this.flyingBodies.length}`);
                } else {
                    console.warn(`[MagnetSuck.doTag] FizzBody 없음: idx=${this.itemIndex}, name=${node.name}`);
                }
                this.itemIndex++;
                return true;
            } else {
                // 무효 노드는 항상 스킵
                this.itemIndex++;
            }
        } else {
            // 없는 노드는 항상 스킵
            this.itemIndex++;
        }
    }


    mark(b) {
        let ok = false;
        let c = 10
        do {
            ok = this.doTag(b);
            if (ok) break;
            c--;
            if (c <= 0) {
                return;
            }
        } while (true)
    }

    tagUpdate(dt, b) {
        this.mark(b);
        this.mark(b);
        this.mark(b);
    }

    private _updateLogCounter: number = 0;

    update() {
        // 펫의 월드 좌표
        let petWorldPos = ccUtil.getWorldPosition(this.node);

        // 1초마다 상태 로그 (60프레임 기준)
        this._updateLogCounter++;
        if (this._updateLogCounter >= 60) {
            this._updateLogCounter = 0;
            if (this.flyingBodies.length > 0) {
                console.log(`[MagnetSuck.update] flyingBodies=${this.flyingBodies.length}, petWorldPos=(${petWorldPos.x.toFixed(0)}, ${petWorldPos.y.toFixed(0)})`);
            }
        }

        for (let i = 0; i < this.flyingBodies.length; i++) {
            let body = this.flyingBodies[i]
            if (body.isValid) {
                // FizzBody.seek()는 로컬 좌표 기준으로 계산하므로
                // 펫의 월드 좌표를 아이템 부모의 로컬 좌표로 변환
                let itemParent = body.node.parent;
                let targetLocalPos = itemParent
                    ? itemParent.convertToNodeSpaceAR(petWorldPos)
                    : petWorldPos;
                let f = body.seek(targetLocalPos, 1660)
                body.applyForce(f);
            } else {
                this.flyingBodies.splice(i--, 1)
            }
        }
    }


}