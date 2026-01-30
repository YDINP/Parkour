/**
 * Hi5 SDK 광고 관리자
 * kapi 프로젝트 AdUtils.js 패턴 참조
 */
import Hi5 from "./Hi5";
import { Loading } from "../ui/LoadingManager";

// 기본 광고 타입 (Hi5 SDK 기본값 사용)
export const AdType = {
    TRIPLE_REWARD: { aid: "reward", key: "reward_triple" },      // 클리어 3배 획득
    REVIVE: { aid: "reward", key: "reward_revive" },             // 릴레이 영웅 소환
    HERO_SUMMON: { aid: "reward", key: "reward_hero" },          // 프렌즈 소환
    PET_HATCH: { aid: "reward", key: "reward_pet" },             // 펫 뽑기 고급 알
    HEART: { aid: "reward", key: "reward_heart" },               // 하트 획득
    DIAMOND: { aid: "reward", key: "reward_diamond" }            // 다이아 획득
};

class AdManagerClass {
    private callback: ((success: boolean) => void) | null = null;
    private hasCalledCallback: boolean = false;
    private isInitialized: boolean = false;
    private wasPausedBeforeAd: boolean = false;  // 광고 전 일시정지 상태 저장

    /**
     * 광고 매니저 초기화 - Hi5 메시지 핸들러 등록
     */
    init(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log("[AdManager] Initialized");
    }

    /**
     * 보상형 광고 시청 요청 (kapi AdUtils.showAdRewardVideo 패턴)
     * @param adType AdType 객체 (aid, key 포함)
     * @param callback 광고 결과 콜백 (success: boolean)
     */
    showRewardAd(adType: { aid: string, key: string }, callback: (success: boolean) => void): void {
        // 광고 전 일시정지 상태 저장
        this.wasPausedBeforeAd = cc.director.isPaused();
        console.log("[AdManager] showRewardAd:", adType.key, "wasPausedBeforeAd:", this.wasPausedBeforeAd);

        this.callback = callback;
        this.hasCalledCallback = false;

        // 로딩 UI 표시 (FriendMaker 스타일 인디케이터 - 타임아웃 없이 명시적 hide 필요)
        Loading.indicator();

        // 게임 일시정지 (이미 일시정지 상태가 아닌 경우에만)
        if (!this.wasPausedBeforeAd) {
            cc.director.pause();
        }

        // 음악 일시정지
        cc.audioEngine.pauseMusic();

        console.log("[AdManager] Calling Hi5.showAdCallback...");
        // Hi5 SDK showAdCallback 사용 (v1.0.12)
        try {
            Hi5.showAdCallback(adType, (data: any) => {
                console.log("[AdManager] Hi5 callback received:", data);
                this.handleAdResult(data);
            });
        } catch (error) {
            console.error("[AdManager] Exception in showAdCallback:", error);
            this.callRewardCallback(false);
        }
    }

    /**
     * 광고 결과 처리
     */
    private handleAdResult(data: any): void {
        console.log("[AdManager] Ad result:", data);

        // LoadingScene에서 전달한 success 값 사용
        const success = data && data.success === true;

        this.callRewardCallback(success);
    }

    /**
     * 광고 결과 콜백 (kapi AdUtils.callRewardAdCallback 패턴)
     */
    private callRewardCallback(success: boolean): void {
        // 인디케이터 숨기기
        Loading.hideIndicator();

        // 게임 재개 (광고 전에 일시정지 상태가 아니었던 경우에만)
        if (!this.wasPausedBeforeAd) {
            cc.director.resume();
        }

        // 음악 재개
        cc.audioEngine.resumeMusic();

        if (this.hasCalledCallback) {
            console.log("[AdManager] Callback already called");
            return;
        }

        if (this.callback) {
            this.callback(success);
            this.hasCalledCallback = true;
        }

        // 초기화
        this.callback = null;
    }
}

// 싱글톤 인스턴스
export const AdManager = new AdManagerClass();
