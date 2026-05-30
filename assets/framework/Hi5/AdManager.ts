/**
 * Hi5 SDK 광고 관리자
 * kapi 프로젝트 AdUtils.js 패턴 참조
 */
import Hi5 from "./Hi5";
import { Loading } from "../ui/LoadingManager";
import { Toast } from "../ui/ToastManager";
import { LocalizationManager } from "./Localization/LocalizationManager";
// 카카오 광고 분기용 (vendored hi5-sdk 경유). require 로 지연 로드해 비카카오 환경 안전.
const kakaoSdk = require("./business/kakaoSdk");
const IndicatorManager = require("./control/indicatorManager");

declare const window: any;

// ── 광고 중 오디오 정지 유틸 (114 Hi5Ad 패턴) ───────────────────────────────
// 카카오 광고는 별도 창/포커스 전환을 유발해 CC2.x 엔진의 cc.audioEngine._onShow가
// 자동으로 resumeAll()을 호출 → 광고 도중 게임 BGM/효과음이 다시 재생되는 버그가 있음.
// pauseMusic()만으로는 효과음(playEffect)이 멈추지 않고, 포커스 복귀 시 음악도 되살아남.
// 따라서 _onShow를 광고 중 no-op으로 monkey-patch하고, pauseAll()+stopAllEffects()로
// 음악·효과음을 모두 정지한다. (Device.bgm/효과음 모두 cc.audioEngine 경유 → 단일 정지로 커버)
function patchAudioEngineOnShow(): void {
    const ae: any = cc.audioEngine as any;
    if (ae.__onShowPatched) return;
    const orig = ae._onShow ? ae._onShow.bind(ae) : null;
    if (!orig) return;
    ae._onShow = function () {
        if (window.__isWatchingAd) return;  // 광고 중에는 자동 resume 차단
        orig();
    };
    ae.__onShowPatched = true;
}

function pauseAudioForAd(): void {
    patchAudioEngineOnShow();
    window.__isWatchingAd = true;
    cc.audioEngine.pauseAll();
    cc.audioEngine.stopAllEffects();
}

function resumeAudioAfterAd(): void {
    window.__isWatchingAd = false;
    cc.audioEngine.resumeAll();
}

/** 토스트 (i18n @key). LocalizationManager 미초기화 시 키 문자열 노출. */
function adToast(key: string): void {
    try {
        const msg = LocalizationManager.getText(key);
        if (Toast) Toast.make(msg);
    } catch (e) { console.warn("[AdManager] adToast 실패:", e); }
}

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

        // ── 카카오 분기 ──────────────────────────────────────────────
        // 카카오 환경에서는 커스텀 Hi5 postMessage 브릿지 대신 vendored KakaoAdapter 사용.
        //   indicator on → showAd('reward') → indicator off → 결과별 토스트 3종.
        //   (a) 성공+보상 → ad_reward_earned + 지급(true)
        //   (b) 성공+미보상(중도종료) → ad_reward_aborted + 미지급(false)
        //   (c) 실패(로드/표시)        → ad_load_failed + 미지급(false)
        try {
            if (kakaoSdk && kakaoSdk.isKakao && kakaoSdk.isKakao()) {
                this.showKakaoRewardAd(callback);
                return;
            }
        } catch (e) {
            console.warn("[AdManager] kakao 분기 판단 예외:", e);
        }
        // ─────────────────────────────────────────────────────────────

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
     * 카카오 리워드 광고 (vendored KakaoAdapter).
     * indicator show → kakaoSdk.showAd('reward') → 모든 종료 경로에서 indicator hide + 토스트.
     */
    private showKakaoRewardAd(callback: (success: boolean) => void): void {
        console.log("[AdManager] showKakaoRewardAd (kakao 분기)");

        // 게임 일시정지 (이미 일시정지 상태가 아닌 경우에만)
        if (!this.wasPausedBeforeAd) {
            cc.director.pause();
        }
        // 광고 중 오디오 정지 (음악+효과음 모두 + _onShow 자동 resume 차단)
        pauseAudioForAd();

        // 인디케이터 표시 (코드 렌더 스피너 — 프리팹 의존 0)
        IndicatorManager.show(null, null);

        let earned = false;
        // 모든 종료 경로(.then 성공/미보상/실패, .catch 예외)에서 호출 → 오디오 재개 보장
        const finish = (success: boolean, toastKey?: string) => {
            IndicatorManager.hide();
            if (!this.wasPausedBeforeAd) {
                cc.director.resume();
            }
            // 광고 종료 후 오디오 재개 (__isWatchingAd 해제 후 resumeAll)
            resumeAudioAfterAd();
            if (toastKey) adToast(toastKey);
            try { callback(success); } catch (e) { console.warn("[AdManager] kakao callback 예외:", e); }
        };

        kakaoSdk.showAd("reward", () => { earned = true; })
            .then((res: any) => {
                const rewarded = !!(res && res.success && (res.rewarded || earned));
                if (rewarded) {
                    finish(true, "@ad_reward_earned");          // 보상 획득 후 광고창 닫힘
                } else if (res && res.success) {
                    finish(false, "@ad_reward_aborted");        // 시청했으나 미지급
                } else {
                    finish(false, "@ad_load_failed");           // 광고 로드/표시 실패
                }
            })
            .catch((e: any) => {
                console.warn("[AdManager] kakao reward 예외:", e);
                finish(false, "@ad_load_failed");
            });
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
