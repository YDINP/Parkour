/**
 * Hi5 SDK 광고 관리자
 * kapi 프로젝트 AdUtils.js 패턴 참조
 */
import Hi5 from "./Hi5";

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
        console.log("[AdManager] showRewardAd:", adType.key);

        this.callback = callback;
        this.hasCalledCallback = false;

        // 게임 일시정지
        cc.director.pause();

        // 음악 일시정지
        cc.audioEngine.pauseMusic();

        // Hi5 SDK showAdCallback 사용 (v1.0.12)
        Hi5.showAdCallback(adType, (data: any) => {
            this.handleAdResult(data);
        });
    }

    /**
     * 광고 결과 처리
     */
    private handleAdResult(data: any): void {
        console.log("[AdManager] Ad result:", data);

        let success = false;

        if (data && data.status === 0) {
            const adType = data.type;
            if (adType === "userEarnedReward" || adType === "dismissed") {
                success = Hi5.lastShowAd === true;
            }
        }

        this.callRewardCallback(success);
    }

    /**
     * 광고 결과 콜백 (kapi AdUtils.callRewardAdCallback 패턴)
     */
    private callRewardCallback(success: boolean): void {
        // 게임 재개
        cc.director.resume();

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
