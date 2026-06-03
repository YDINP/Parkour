/**
 * Hi5 SDK 광고 관리자
 * kapi 프로젝트 AdUtils.js 패턴 참조
 */
import Hi5 from "./Hi5";
import { Loading } from "../ui/LoadingManager";
// 카카오 광고 분기용 (vendored hi5-sdk 경유). require 로 지연 로드해 비카카오 환경 안전.
const kakaoSdk = require("./business/kakaoSdk");
const IndicatorManager = require("./control/indicatorManager");

declare const window: any;

// ── 광고 중 오디오 정지 유틸 (114 Hi5Ad 패턴) ───────────────────────────────
// 카카오 광고는 별도 창/포커스 전환(EVENT_HIDE/SHOW)을 유발 → CC2.x 엔진이 포커스 복귀 시
// 오디오를 자동 재개 → 광고 도중 게임 BGM/효과음이 되살아나는 버그(특히 iOS 광고 오버레이).
//
// 주의: CC 2.4.x 엔진에는 cc.audioEngine._onShow 가 없다(과거 가정 오류 → 패치가 죽은 코드였음).
//   실제 자동 재개는 _restore()(EVENT_SHOW 에 등록, _break 캐시분을 resume)가 담당하고,
//   resumeAll()/resumeMusic() 은 수동 재개 경로다. 핸들러 이름 의존을 버리고 이 재개 진입점들을
//   광고 중(__isWatchingAd) 모두 no-op 으로 막아야 iOS 에서 BGM 이 되살아나지 않는다.
//   (Device.bgm/효과음 모두 cc.audioEngine 경유 → pauseAll()+stopAllEffects() 로 정지 커버)
function patchAudioEngineOnShow(): void {
    const ae: any = cc.audioEngine as any;
    if (ae.__adResumeGuardPatched) return;
    ["resumeAll", "resumeMusic", "_restore"].forEach((n) => {
        if (typeof ae[n] !== "function") return;
        const orig = ae[n];
        ae[n] = function () {
            if (window.__isWatchingAd) return;  // 광고 중 자동/수동 재개 모두 차단
            return orig.apply(ae, arguments);
        };
    });
    ae.__adResumeGuardPatched = true;
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

        // 인디케이터: 광고 로드(createAd) 구간 동안 SDK-native 인디케이터(IndicatorManager) 표시.
        //   hi5-sdk 공식 cocos-loading-indicator 샘플 패턴 — show() → onStarted(표시 직전) hide() → finally hide().
        //   onStarted 시점에 정확히 내려가므로 네이티브 광고 표시 화면과 겹치지 않음(이전 더블 인디케이터 문제 해소).
        //   cc.director.pause() 보다 먼저 띄워야 스피너 tween 의 초기 프레임이 보장된다.
        IndicatorManager.show(null, null);

        // 게임 일시정지 (이미 일시정지 상태가 아닌 경우에만)
        if (!this.wasPausedBeforeAd) {
            cc.director.pause();
        }
        // 광고 중 오디오 정지 (음악+효과음 모두 + _onShow 자동 resume 차단)
        pauseAudioForAd();

        let earned = false;
        let indicatorHidden = false;
        const hideIndicator = () => {
            if (indicatorHidden) return;
            indicatorHidden = true;
            IndicatorManager.hide();
        };

        // 모든 종료 경로(.then 성공/미보상/실패, .catch 예외)에서 호출 → 오디오 재개 보장.
        //   결과 토스트는 카카오 SDK 공용 토스트(showKakaoToastPreset) 사용 — 프로젝트 자체 Toast 대체.
        //   preset: 'adSuccess'(성공) | 'adSkipped'(시청중단/미지급) | 'adLoadFail'(로드/표시 실패).
        const finish = (success: boolean, toastPreset?: string) => {
            hideIndicator();  // 안전망: onStarted 가 못 와도(로드 실패 등) 확실히 숨김
            if (!this.wasPausedBeforeAd) {
                cc.director.resume();
            }
            // 광고 종료 후 오디오 재개 (__isWatchingAd 해제 후 resumeAll)
            resumeAudioAfterAd();
            if (toastPreset) kakaoSdk.showToastPreset(toastPreset);
            try { callback(success); } catch (e) { console.warn("[AdManager] kakao callback 예외:", e); }
        };

        kakaoSdk.showAd("reward", {
            onStarted: () => { hideIndicator(); },   // 광고 표시 시작 → 커스텀 인디케이터를 네이티브 광고에 인계
            onEarned: () => { earned = true; }
        })
            .then((res: any) => {
                const rewarded = !!(res && res.success && (res.rewarded || earned));
                if (rewarded) {
                    finish(true, "adSuccess");                  // 보상 획득 후 광고창 닫힘
                } else if (res && res.success) {
                    finish(false, "adSkipped");                 // 시청했으나 미지급(중도종료)
                } else {
                    finish(false, "adLoadFail");                // 광고 로드/표시 실패
                }
            })
            .catch((e: any) => {
                console.warn("[AdManager] kakao reward 예외:", e);
                finish(false, "adLoadFail");
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
