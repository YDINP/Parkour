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
        _adapter = new KakaoAdapter({ h5Id: H5_ID, serverType: SERVER_TYPE });
        console.log("[KakaoSDK] KakaoAdapter 생성:", { h5Id: H5_ID, serverType: SERVER_TYPE });
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

module.exports = {
    isKakao: isKakao,
    isConfigured: isConfigured,
    ensureInit: ensureInit,
    getRankings: getRankings,
    getMyRanking: getMyRanking,
    submitScore: submitScore,
    showAd: showAd,
    LEADERBOARD_ID: LEADERBOARD_ID
};
