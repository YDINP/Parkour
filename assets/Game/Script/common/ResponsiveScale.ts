const { ccclass, property } = cc._decorator;

import { ResolutionInfo } from "./ResolutionManager";

/**
 * ResponsiveScale - 반응형 스케일 컴포넌트
 * 
 * 디자인 화면비를 기준으로 가로비율이 줄어드는 경우에만 스케일 조정
 * (가로모드 전용 게임)
 * 
 * 사용법:
 *   1. 에디터에서 w, h 값 설정 (디자인 해상도)
 *   2. 또는 코드에서 setNodeSize(width, height) 호출
 */
@ccclass
export default class ResponsiveScale extends cc.Component {

    @property({ tooltip: "디자인 기준 너비 (0이면 노드 초기 width 사용)" })
    w: number = 0;

    @property({ tooltip: "디자인 기준 높이 (0이면 노드 초기 height 사용)" })
    h: number = 0;

    private designRatio: number = 0;

    onLoad() {
        // 디자인 크기 초기화
        if (this.w === 0 || this.h === 0) {
            this.w = this.node.width;
            this.h = this.node.height;
            
            if (this.w <= 0 || this.h <= 0) {
                console.error(`[ResponsiveScale] ${this.node.name}: 노드 크기가 0입니다. 에디터에서 w, h를 설정하세요.`);
                return;
            }
            
            console.log(`[ResponsiveScale] ${this.node.name}: 디자인 크기 자동 설정 (${this.w}x${this.h})`);
        }
        
        // 디자인 화면비 계산 (가로/세로)
        this.designRatio = this.w / this.h;
        
        this.updateScale();
        cc.director.on('resolution:changed', this.onResolutionChanged, this);
    }

    onDestroy() {
        cc.director.off('resolution:changed', this.onResolutionChanged, this);
    }

    private onResolutionChanged(info: ResolutionInfo) {
        this.updateScale();
    }

    private updateScale() {
        if (this.w <= 0 || this.h <= 0) {
            console.warn(`[ResponsiveScale] ${this.node.name}: 디자인 크기 미설정, 스케일 적용 생략`);
            return;
        }
        
        const canvasSize = cc.view.getCanvasSize();
        
        // Canvas 크기 검증
        if (canvasSize.width <= 0 || canvasSize.height <= 0) {
            console.error(`[ResponsiveScale] Canvas 크기 비정상: ${canvasSize.width}x${canvasSize.height}, scale=1로 폴백`);
            this.node.scale = 1;
            return;
        }
        
        // 현재 캔버스 화면비 (가로/세로)
        const canvasRatio = canvasSize.width / canvasSize.height;
        
        let scale = 1;
        
        // 캔버스 화면비가 디자인보다 작으면 (가로가 상대적으로 좁으면) 축소
        if (canvasRatio < this.designRatio) {
            scale = canvasRatio / this.designRatio;
        }
        
        console.log(`[ResponsiveScale] ${this.node.name}: designRatio(${this.designRatio.toFixed(3)}) canvasRatio(${canvasRatio.toFixed(3)}) → scale: ${scale.toFixed(3)}`);
        
        this.node.scale = scale;
    }

    /**
     * 디자인 크기 설정 및 즉시 스케일 적용
     */
    setNodeSize(width: number, height: number) {
        this.w = width;
        this.h = height;
        this.designRatio = width / height;
        this.updateScale();
    }
}
