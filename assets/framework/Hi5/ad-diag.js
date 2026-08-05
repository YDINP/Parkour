/*
 * ad-diag.js — 카카오 광고 진단 오버레이 로그 모듈 (CC2 / 벤더 hi5-sdk 프로젝트용)
 * ─────────────────────────────────────────────────────────────────────────────
 * 좌측상단 로그 오버레이(kakao-log-overlay)에 광고 호출/성공/실패(코드)를 출력한다.
 * SDK 오버레이가 활성이면 그쪽(window.__showKakaoLogOverlay)에 통합 출력,
 * 비활성이지만 디버그 플래그가 켜져 있으면 자체 폴백 패널로 출력한다.
 * Live 일반 유저(플래그 없음)는 양쪽 다 no-op → 안전.
 *
 * 활성 조건(아래 중 하나): ?logOverlay=true 쿼리 / localStorage KAKAO_LOG_OVERLAY='1'
 *                          / window.__kakaoLogOverlayEnabled===true
 *  ⚠ 쿼리는 카카오 OAuth redirect 후 소실되므로, 게임 부팅 초입에서
 *     logOverlay=true 감지 시 localStorage 로 영속화하는 코드를 별도로 둘 것(레시피 참조).
 *
 * 사용:
 *   var adDiag = require('<상대경로>/ad-diag');
 *   adDiag.log('ad_call',    { key: key, plat: adDiag.platform(adapterOrSdk) });
 *   adDiag.log('ad_success', { key: key, rewarded: rewarded });
 *   adDiag.log('ad_fail',    { key: key, code: res && (res.errorCode || res.error) });
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
    function isOn() {
        try {
            // Live(gameplay.game.kakao.com)에선 QA/dev 테스트 플래그(localStorage/쿼리)가 남아 있어도
            // 오버레이를 강제 OFF — 일반 유저 노출 방지. qa-/dev- 는 접두 때문에 매칭 제외(디버깅 유지).
            if (typeof location !== 'undefined' && /(^|\.)gameplay\.game\.kakao\.com$/i.test(location.hostname || '')) return false;
            if (typeof window !== 'undefined' && window.__kakaoLogOverlayEnabled === true) return true;
            if (typeof location !== 'undefined' && /[?&]logOverlay=true\b/i.test(location.search || '')) return true;
            if (typeof localStorage !== 'undefined' && localStorage.getItem('KAKAO_LOG_OVERLAY') === '1') return true;
        } catch (e) {}
        return false;
    }

    function fallback(type, body) {
        if (typeof document === 'undefined' || !document.body) return;
        var id = 'hi5-ad-log-overlay';
        var c = document.getElementById(id);
        if (!c) {
            c = document.createElement('div');
            c.id = id;
            c.style.cssText = 'position:fixed;top:8px;left:8px;z-index:99999;pointer-events:none;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;line-height:1.3;color:#fff;max-width:70vw;word-break:break-all;';
            document.body.appendChild(c);
        }
        var bodyStr = '';
        try { if (body && typeof body === 'object' && Object.keys(body).length) bodyStr = ' ' + JSON.stringify(body); } catch (e) {}
        var d = new Date();
        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        var item = document.createElement('div');
        item.textContent = '[' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '] ' + String(type) + bodyStr;
        item.style.cssText = 'background:rgba(0,0,0,0.65);padding:2px 6px;border-radius:3px;margin-top:2px;';
        c.appendChild(item);
        while (c.childElementCount > 12 && c.firstChild) c.removeChild(c.firstChild);
        setTimeout(function () { if (item.parentNode) item.parentNode.removeChild(item); }, 8000);
    }

    function log(type, body) {
        try { if (typeof window !== 'undefined' && window.__showKakaoLogOverlay) { window.__showKakaoLogOverlay(type, body || {}); return; } } catch (e) {}
        if (isOn()) { try { fallback(type, body); } catch (e) {} }
    }

    // resolveUnitId 가 실제 유닛 ID 선택에 쓰는 판정과 동일하게 'android'|'ios'|'web' 반환.
    // ctx: KakaoAdapter 인스턴스(_hf 보유) 또는 hi5-sdk 모듈(detectPlatform 보유).
    function platform(ctx) {
        try {
            var hf = ctx && ctx._hf;
            if (hf && hf.Web && hf.Web.detectPlatform) {
                var p = hf.Web.detectPlatform();
                if (p) { if (p.isIOS) return 'ios'; if (p.isAndroid) return 'android'; return 'web'; }
            }
            if (ctx && typeof ctx.detectPlatform === 'function') { var s = ctx.detectPlatform(); if (s) return s; }
        } catch (e) {}
        return 'na';
    }

    var M = { isOn: isOn, log: log, platform: platform };
    if (typeof module !== 'undefined' && module.exports) module.exports = M;
    if (typeof window !== 'undefined') window.__adDiag = M;
})();
