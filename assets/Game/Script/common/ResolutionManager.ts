/**
 * ResolutionManager - 반응형 해상도 관리자
 *
 * 다양한 디바이스(태블릿/패드/서피스/폴드)에 대응하는 해상도 관리
 *
 * 사용법:
 *   ResolutionManager.init(); // 게임 시작 시 호출
 *   ResolutionManager.applyToCanvas(canvas); // 각 씬의 Canvas에 적용
 */

const { ccclass } = cc._decorator;

export enum DeviceType {
    PHONE = "phone",           // 일반 폰 (16:9 이상)
    TABLET = "tablet",         // 태블릿 (4:3 ~ 16:10)
    FOLDABLE = "foldable",     // 폴더블 (펼침 상태, ~1.2:1)
    FOLDABLE_CLOSED = "foldable_closed" // 폴더블 (접힘 상태, ~2.5:1)
}

export interface ResolutionInfo {
    width: number;
    height: number;
    ratio: number;
    deviceType: DeviceType;
    isLandscape: boolean;
}

@ccclass
export default class ResolutionManager {
    private static _instance: ResolutionManager = null;
    private static _resolutionInfo: ResolutionInfo = null;

    /**
     * 해상도 관리자 초기화
     */
    static init(): void {
        this._resolutionInfo = this.detectResolution();
        console.log('[ResolutionManager] 초기화:', this._resolutionInfo);

        // 화면 크기 변경 감지
        cc.view.setResizeCallback(() => {
            this._resolutionInfo = this.detectResolution();
            console.log('[ResolutionManager] 해상도 변경:', this._resolutionInfo);
            cc.director.emit('resolution:changed', this._resolutionInfo);
        });
    }

    /**
     * 현재 해상도 정보 반환
     */
    static get info(): ResolutionInfo {
        if (!this._resolutionInfo) {
            this._resolutionInfo = this.detectResolution();
        }
        return this._resolutionInfo;
    }

    /**
     * 현재 디바이스 타입 반환
     */
    static get deviceType(): DeviceType {
        return this.info.deviceType;
    }

    /**
     * 해상도 감지 및 디바이스 타입 결정
     */
    private static detectResolution(): ResolutionInfo {
        const frameSize = cc.view.getFrameSize();
        const width = Math.max(frameSize.width, frameSize.height);
        const height = Math.min(frameSize.width, frameSize.height);
        const ratio = width / height;
        const isLandscape = frameSize.width > frameSize.height;

        let deviceType: DeviceType;

        if (ratio >= 2.0) {
            // 매우 긴 화면 (폴더블 접힘, 21:9 폰)
            deviceType = DeviceType.FOLDABLE_CLOSED;
        } else if (ratio >= 1.7) {
            // 일반 폰 (16:9 ~ 19.5:9)
            deviceType = DeviceType.PHONE;
        } else if (ratio >= 1.4) {
            // 태블릿 (16:10, 3:2)
            deviceType = DeviceType.TABLET;
        } else {
            // 폴더블 펼침 또는 4:3 태블릿
            deviceType = ratio < 1.3 ? DeviceType.FOLDABLE : DeviceType.TABLET;
        }

        return { width, height, ratio, deviceType, isLandscape };
    }

    /**
     * Canvas에 반응형 설정 적용
     * SHOW_ALL 전략: fitWidth=true, fitHeight=true
     */
    static applyToCanvas(canvas: cc.Canvas): void {
        if (!canvas) {
            console.warn('[ResolutionManager] Canvas가 null입니다.');
            return;
        }

        // SHOW_ALL 전략 적용
        canvas.fitWidth = true;
        canvas.fitHeight = true;

        console.log(`[ResolutionManager] Canvas 설정 적용: fitWidth=true, fitHeight=true`);
    }

    /**
     * 현재 씬의 Canvas에 자동 적용
     */
    static applyToCurrentScene(): void {
        const canvas = cc.Canvas.instance;
        if (canvas) {
            this.applyToCanvas(canvas);
        }
    }

    /**
     * 디바이스 타입에 따른 UI 스케일 반환
     */
    static getUIScale(): number {
        switch (this.deviceType) {
            case DeviceType.TABLET:
            case DeviceType.FOLDABLE:
                return 1.2; // 태블릿/폴더블에서 UI 약간 확대
            case DeviceType.FOLDABLE_CLOSED:
                return 0.9; // 접힌 폴더블에서 UI 약간 축소
            default:
                return 1.0;
        }
    }

    /**
     * Safe Area 여백 계산 (노치/펀치홀 대응)
     */
    static getSafeAreaMargin(): { top: number; bottom: number; left: number; right: number } {
        // 기본 여백 (필요시 플랫폼별 조정)
        const margin = { top: 0, bottom: 0, left: 0, right: 0 };

        // 긴 화면 디바이스는 좌우 여백 추가
        if (this.info.ratio >= 2.0) {
            margin.left = 40;
            margin.right = 40;
        }

        return margin;
    }

    /**
     * 디바이스 정보 문자열 반환 (디버깅용)
     */
    static getDebugInfo(): string {
        const info = this.info;
        return `[${info.deviceType}] ${info.width}x${info.height} (${info.ratio.toFixed(2)})`;
    }
}
