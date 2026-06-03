/**
 * 카카오 SDK 헬퍼 (CC 2.4.13, vendored hi5-sdk 1.6.13).
 *
 * Parkour(49FriendRunner)는 기존에 framework/Hi5/Hi5.ts(커스텀 postMessage 브릿지)로
 * hi5games 플랫폼과 통신한다. package.json 의 @TinycellCorp/hi5-sdk 의존성은 실제로는
 * 사용되지 않았다(커스텀 브릿지가 모든 SDK 호출을 대체). 카카오 플랫폼은 KakaoAdapter(`/platform`
 * 엔트리)가 필수인데, CC2 빌더는 import 한 곳이 없으면 platform 을 번들에서 누락시킨다.
 * 따라서 카카오 동작(광고/랭킹)을 위해 vendored hi5-sdk(.js)/hi5-sdk-platform(.js)을 require 한다.
 *
 * ⚠ 로드 순서: regenerator-runtime → hi5-sdk(index) → (lazy) hi5-sdk-platform.
 *   platform.js 는 module-load 시 new _Hi5SDK() 로 window.parent 에 접근하므로
 *   top-level require 금지(에디터/비-kakao 로드 시 씬 깨짐). 런타임 kakao 호스트에서만 lazy require.
 *
 * 설정값(카카오 어드민 발급):
 *   - H5_ID         : h5Id (20756)
 *   - SERVER_TYPE   : 'qa'  (QA 백엔드. 실서비스 전환 시 'live')
 *   - LEADERBOARD_ID: 'ranking'
 *
 * 비카카오 환경에서는 모든 함수가 안전하게 no-op/빈결과 반환 → hi5games/일반 웹에서도 안전.
 */

require("../Hi5Helper_2x/regenerator-runtime");
var sdk = require("../Hi5Helper_2x/hi5-sdk");

// === 카카오 어드민 발급값 ===
var H5_ID = "20756";
var SERVER_TYPE = "qa";
var LEADERBOARD_ID = "ranking";
// 화면 방향 — SDK start config 의 orientation 으로 전달(가로 게임).
//   SDK 기본값은 "portrait" 이고 어드민 미등록 시 세로로 떨어지므로, 코드에서 명시적으로 "landscape" 강제.
//   (어드민에 가로 등록돼 있어도 동일 값이라 충돌 없음.)
var ORIENTATION = "landscape";

var _adapter = null;
var _initPromise = null;
var _ready = false;

function isKakao() {
    try {
        if (sdk.detectPlatform && sdk.detectPlatform() === "kakao") return true;
        if (typeof location !== "undefined") {
            var h = (location.hostname || "").toLowerCase();
            if (/kakao/.test(h)) return true;
            var qs = location.search || "";
            if (/[?&](provider=kakao|kakaoH5Id=|h5Id=|code=)/i.test(qs)) return true;
        }
        if (typeof navigator !== "undefined" && /KAKAOTALK/i.test(navigator.userAgent || "")) return true;
    } catch (e) {}
    return false;
}

function isConfigured() {
    return !!H5_ID;
}

/** 카카오 어댑터 활성화 (멱등). 미설정/비카카오/모듈없음 → false. */
function ensureInit() {
    if (_ready) return Promise.resolve(true);
    if (_initPromise) return _initPromise;
    var kak = isKakao();
    if (!H5_ID || !kak || !sdk.async || !sdk.async.init) {
        console.log("[KakaoSDK] init 스킵 — H5_ID:" + !!H5_ID + " kakao:" + kak);
        return Promise.resolve(false);
    }
    // platform.js 는 여기서만 lazy require (런타임 kakao 호스트).
    var KakaoAdapter = null;
    try {
        KakaoAdapter = require("../Hi5Helper_2x/hi5-sdk-platform").KakaoAdapter;
    } catch (e) {
        console.warn("[KakaoSDK] hi5-sdk-platform require 실패:", e);
        return Promise.resolve(false);
    }
    try {
        _adapter = new KakaoAdapter({ h5Id: H5_ID, serverType: SERVER_TYPE, orientation: ORIENTATION });
        console.log("[KakaoSDK] KakaoAdapter 생성:", { h5Id: H5_ID, serverType: SERVER_TYPE, orientation: ORIENTATION });
    } catch (e) {
        console.warn("[KakaoSDK] KakaoAdapter 생성 실패:", e);
        return Promise.resolve(false);
    }
    _initPromise = sdk.async.init(_adapter, function () { return Promise.resolve(); })
        .then(function (res) {
            _ready = !!(res && res.success);
            console.log("[KakaoSDK] init 응답:", res, "→ ready=" + _ready);
            return _ready;
        })
        .catch(function (e) { console.warn("[KakaoSDK] init 예외:", e); return false; });
    return _initPromise;
}

/** 전체 랭킹 → [{playerId, rank, score, nickname}] (실패 시 []) */
function getRankings(seasonSeq, beginRank, endRank) {
    var opts = { leaderboardId: LEADERBOARD_ID, seasonSeq: seasonSeq || 0, beginRank: beginRank || 1, endRank: endRank || 50 };
    return ensureInit().then(function (ok) {
        if (!ok) return [];
        return sdk.async.getRankings(opts).then(function (res) {
            if (!res || !res.success || !res.page) return [];
            return (res.page.rankingInfos || []).map(function (e) {
                return { playerId: e.playerId, rank: e.rank, score: e.score, nickname: (e.property && e.property.nickname) || "" };
            });
        }).catch(function (e) { console.warn("[KakaoSDK] getRankings 예외:", e); return []; });
    });
}

/** 내 랭킹 → {playerId, rank, score, nickname} (없으면 null) */
function getMyRanking(seasonSeq) {
    var opts = { leaderboardId: LEADERBOARD_ID, seasonSeq: seasonSeq || 0 };
    return ensureInit().then(function (ok) {
        if (!ok) return null;
        return sdk.async.getMyRanking(opts).then(function (res) {
            if (!res || !res.success || !res.ranking) return null;
            var r = res.ranking;
            return { playerId: r.playerId, rank: r.rank, score: r.score, nickname: (r.property && r.property.nickname) || "" };
        }).catch(function (e) { console.warn("[KakaoSDK] getMyRanking 예외:", e); return null; });
    });
}

/** 점수 제출. 성공 여부 boolean. */
function submitScore(score) {
    return ensureInit().then(function (ok) {
        if (!ok) return false;
        return sdk.async.submitScoreAsync({ leaderboardId: LEADERBOARD_ID, score: score })
            .then(function (res) { return !!(res && res.success); })
            .catch(function (e) { console.warn("[KakaoSDK] submitScore 예외:", e); return false; });
    });
}

/**
 * 광고 표시 (전면/리워드).
 * key: 'interstitial'(전면) | 'reward'(리워드). adUnit ID 는 KakaoAdapter 내부 DEFAULT_KAKAO_AD_UNITS 사용.
 * @returns {Promise<{success:boolean, rewarded?:boolean, error?:string, errorCode?:string}>}
 * @param {Function|{onEarned?:Function, onStarted?:Function}} [callbacks]
 *   - Function: 리워드 보상 획득 콜백(onEarned)으로 취급 (하위호환).
 *   - Object: { onEarned, onStarted }. onStarted 는 광고 로드 완료 후 실제 표시 직전 호출됨
 *     → 로딩 인디케이터를 네이티브 광고 표시 시점에 정확히 넘겨줄 때 사용.
 */
function showAd(key, callbacks) {
    var k = key || "interstitial";
    return ensureInit().then(function (ok) {
        if (!ok || !_adapter || typeof _adapter.showAd !== "function") {
            return { success: false, error: "not-ready" };
        }
        // 함수면 onEarned 단일 콜백, 객체면 {onEarned,onStarted} 그대로 전달 (KakaoAdapter.showAd 가 양형 모두 지원).
        return _adapter.showAd(k, callbacks)
            .then(function (res) { return res || { success: false }; })
            .catch(function (e) { console.warn("[KakaoSDK] showAd 예외:", e); return { success: false, error: String(e) }; });
    });
}

// 프리셋 기본 문구 (sdk.KAKAO_TOAST_MESSAGES 우선, 없으면 이 fallback).
var _TOAST_FALLBACK = {
    dataFee: "Wi-Fi가 아닌 환경에서는 데이터 요금이 발생할 수 있어요",
    adLoadFail: "광고를 불러올 수 없어요. 잠시 후 다시 시도해주세요",
    adSkipped: "광고를 끝까지 시청해야 보상을 받을 수 있어요",
    adSuccess: "보상 시청이 완료되어 보상을 지급했어요"
};

/**
 * 공용 카카오 토스트 (자체 렌더링 — 캔버스 기준 배치).
 *   window.__showKakaoToast(뷰포트 기준) 대신, 게임 캔버스 영역의 가로 중앙 + 하단 bottomPct 위치에 배치.
 *   → 카카오 웹뷰가 세로/레터박스여도 토스트가 게임 화면 안에 보이도록 보강. 캔버스 없으면 뷰포트 기준 fallback.
 * @param {string} text
 * @param {object} [options] fontSize/color/bg/radius/bottomPct/durationMs/maxWidth
 */
function showToast(text, options) {
    try {
        if (!text || typeof document === "undefined" || !document.body) return;
        var o = options || {};
        var bg = o.bg || "rgba(0,0,0,0.85)";
        var color = o.color || "#ffffff";
        var fontSize = o.fontSize != null ? o.fontSize : 14;
        var radius = o.radius != null ? o.radius : 12;
        var bottomPct = o.bottomPct != null ? o.bottomPct : 12;
        var durationMs = o.durationMs != null ? o.durationMs : 3000;
        var maxWidth = o.maxWidth != null ? o.maxWidth : 600;

        // 부모: 게임 컨테이너(cc.game.container)에 붙이면 Cocos 가 적용한 회전(rotate(90deg))을 그대로 상속한다.
        //   → 세로 웹뷰에서 게임만 가로로 회전돼도 토스트가 게임과 같은 방향/위치로 표시됨.
        //   transform 걸린 컨테이너는 absolute 자식의 컨테이닝 블록이 되므로 좌표가 컨테이너(=게임 화면) 기준.
        //   컨테이너 없으면 body + fixed(뷰포트 기준) fallback.
        var parent = document.body, posMode = "fixed";
        try {
            if (typeof cc !== "undefined" && cc.game && cc.game.container) { parent = cc.game.container; posMode = "absolute"; }
        } catch (e) {}

        var t = document.createElement("div");
        t.className = "kakao-toast-cc";
        t.textContent = text;
        t.style.cssText =
            "position:" + posMode + ";left:50%;bottom:" + bottomPct + "%;transform:translateX(-50%);" +
            "box-sizing:border-box;display:flex;align-items:center;justify-content:center;" +
            "padding:10px 18px;max-width:min(calc(100% - 32px)," + maxWidth + "px);white-space:nowrap;text-align:center;" +
            "font-size:" + fontSize + "px;line-height:1.3;color:" + color + ";background:" + bg + ";" +
            "border-radius:" + radius + "px;z-index:100000;pointer-events:none;opacity:0;transition:opacity 0.3s ease;";
        parent.appendChild(t);
        // 텍스트가 max-width 초과 시 줄바꿈 fallback.
        if (t.scrollWidth > t.clientWidth + 1) { t.style.whiteSpace = "normal"; t.style.wordBreak = "keep-all"; }

        var raf = (typeof requestAnimationFrame === "function") ? requestAnimationFrame : function (cb) { return setTimeout(cb, 16); };
        raf(function () { raf(function () { t.style.opacity = "1"; }); });
        setTimeout(function () { t.style.opacity = "0"; }, Math.max(0, durationMs - 300));
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, durationMs + 50);
    } catch (e) { console.warn("[KakaoSDK] showToast 예외:", e); }
}

/**
 * 프리셋 토스트 — 'dataFee' | 'adLoadFail' | 'adSkipped' | 'adSuccess'.
 * 문구는 sdk.KAKAO_TOAST_MESSAGES[preset] 우선, 없으면 내부 fallback.
 */
function showToastPreset(preset, options) {
    try {
        var msgs = (sdk && sdk.KAKAO_TOAST_MESSAGES) || _TOAST_FALLBACK;
        var text = msgs[preset] || _TOAST_FALLBACK[preset];
        if (text) showToast(text, options);
    } catch (e) { console.warn("[KakaoSDK] showToastPreset 예외:", e); }
}

// 템플릿이 정의한 전역 토스트 훅을 캔버스 기준 구현으로 교체.
//   → 데이터요금 안내(스플래시 종료 시 _showDataFeeToast → window.__showKakaoToast)도 캔버스 기준 배치 적용.
//   kakaoSdk 는 부팅 시 LoadingScene 에서 require 되어 스플래시 종료(_actuallyHide) 전에 교체됨.
try {
    if (typeof window !== "undefined") window.__showKakaoToast = showToast;
} catch (e) {}

module.exports = {
    isKakao: isKakao,
    isConfigured: isConfigured,
    ensureInit: ensureInit,
    getRankings: getRankings,
    getMyRanking: getMyRanking,
    submitScore: submitScore,
    showAd: showAd,
    showToast: showToast,
    showToastPreset: showToastPreset,
    TOAST_MESSAGES: (sdk && sdk.KAKAO_TOAST_MESSAGES) || null,
    LEADERBOARD_ID: LEADERBOARD_ID
};
