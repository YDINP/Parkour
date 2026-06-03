'use strict';

var __defProp$4 = Object.defineProperty;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
class _Hi5SDK {
  constructor() {
    __publicField$4(this, "isIframe");
    __publicField$4(this, "cachedSafeArea", null);
    this.isIframe = window !== window.parent;
    if (this.isIframe) {
      this.setupMessageListener();
      this.requestSafeArea();
    }
  }
  /**
   * Safe Area Insets 조회
   */
  getSafeArea() {
    if (this.isIframe) {
      return this.cachedSafeArea || { top: 0, right: 0, bottom: 0, left: 0 };
    } else {
      if (window.__hi5Platform) {
        return window.__hi5Platform.getSafeArea();
      }
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
  }
  /**
   * 로딩 진행도 업데이트
   */
  updateLoadingProgress(progress) {
    if (this.isIframe) {
      window.parent.postMessage(
        {
          tohi5action: "UPDATE_LOADING_PROGRESS",
          data: progress
        },
        "*"
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("hi5:loadingProgress", { detail: progress })
      );
    }
  }
  /**
   * Safe Area 요청 (iframe 모드)
   */
  requestSafeArea() {
    window.parent.postMessage(
      {
        tohi5action: "GET_SAFE_AREA",
        data: {}
      },
      "*"
    );
  }
  /**
   * postMessage 리스너 설정 (iframe 모드)
   */
  setupMessageListener() {
    window.addEventListener("message", (event) => {
      const { fromhi5action, data } = event.data;
      if (fromhi5action === "SAFE_AREA_INSETS") {
        this.cachedSafeArea = data.insets;
      }
    });
  }
}
const Hi5SDK = new _Hi5SDK();

function isAdCapable(adapter) {
  return adapter.hasCapability("ad") && typeof adapter.showAd === "function";
}
function isIAPCapable(adapter) {
  return adapter.hasCapability("iap") && typeof adapter.purchase === "function";
}
function isDataStorageCapable(adapter) {
  return adapter.hasCapability("data") && typeof adapter.getItem === "function";
}
function isSafeAreaCapable(adapter) {
  return adapter.hasCapability("safeArea") && typeof adapter.getSafeArea === "function";
}
function isRankCapable(adapter) {
  return adapter.hasCapability("rank") && typeof adapter.submitScore === "function";
}
function isShareCapable(adapter) {
  return adapter.hasCapability("share") && typeof adapter.shareText === "function";
}
function isLifecycleCapable(adapter) {
  return adapter.hasCapability("lifecycle") && typeof adapter.gameStart === "function";
}
function isBannerCapable(adapter) {
  return adapter.hasCapability("banner") && typeof adapter.requestBanner === "function";
}
function isUserAccountCapable(adapter) {
  return adapter.hasCapability("userAccount") && typeof adapter.getUser === "function";
}
function isLeaderboardCapable(adapter) {
  return adapter.hasCapability("leaderboard") && typeof adapter.submitLeaderboardScore === "function";
}
function isLogCapable(adapter) {
  return adapter.hasCapability("log") && typeof adapter.sendLog === "function";
}
function unsupported(adapterId, cap) {
  return {
    success: false,
    error: `Capability '${cap}'\uC740(\uB294) '${adapterId}' \uD50C\uB7AB\uD3FC\uC5D0\uC11C \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`
  };
}

const _factories = [];
let _activeAdapter = null;
function registerAdapter(factory) {
  const existingIndex = _factories.findIndex((f) => f.id === factory.id);
  if (existingIndex >= 0) {
    _factories[existingIndex] = factory;
  } else {
    _factories.push(factory);
  }
  _factories.sort((a, b) => {
    var _a, _b;
    return ((_a = a.priority) != null ? _a : 100) - ((_b = b.priority) != null ? _b : 100);
  });
}
function listAdapters() {
  return _factories.map((f) => f.id);
}
function selectAdapter(options) {
  for (const factory of _factories) {
    try {
      if (factory.detect()) {
        return factory.create(options);
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error(
    `[Platform Registry] \uB9E4\uCE6D\uB418\uB294 \uC5B4\uB311\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. StandaloneAdapter\uAC00 \uB4F1\uB85D\uB418\uC5B4 \uC788\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694. \uB4F1\uB85D\uB41C \uC5B4\uB311\uD130: [${listAdapters().join(", ")}]`
  );
}
function selectAdapterExcept(excludeIds, options) {
  for (const factory of _factories) {
    if (excludeIds.includes(factory.id)) continue;
    try {
      if (factory.detect()) {
        return factory.create(options);
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}
function setActiveAdapter(adapter) {
  _activeAdapter = adapter;
}
function getActiveAdapter() {
  if (!_activeAdapter) {
    throw new Error("[Platform Registry] \uD65C\uC131 \uC5B4\uB311\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. init()\uC744 \uBA3C\uC800 \uD638\uCD9C\uD558\uC138\uC694.");
  }
  return _activeAdapter;
}
function hasActiveAdapter() {
  return _activeAdapter !== null;
}

const LOG_LEVEL_PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};
let _currentLogLevel = "WARN";
function setLogLevel(level) {
  _currentLogLevel = level;
}
function shouldLog(level) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[_currentLogLevel];
}
const logger = {
  debug(...args) {
    if (shouldLog("DEBUG")) {
      console.log("[Hi5 Async]", ...args);
    }
  },
  info(...args) {
    if (shouldLog("INFO")) {
      console.log("[Hi5 Async]", ...args);
    }
  },
  warn(...args) {
    if (shouldLog("WARN")) {
      console.warn("[Hi5 Async]", ...args);
    }
  },
  error(...args) {
    if (shouldLog("ERROR")) {
      console.error("[Hi5 Async]", ...args);
    }
  }
};

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$9 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function mapAdErrorCode(code) {
  const known = ["unfilled", "adblock", "adCooldown", "adsDisabledBasicLaunch", "other"];
  for (let i = 0; i < known.length; i++) {
    if (known[i] === code) return known[i];
  }
  return "other";
}
const SDK_SCRIPT_URL$1 = "https://sdk.crazygames.com/crazygames-sdk-v3.js";
const SDK_WRAPPER_ENGINE = "cocos";
const SDK_WRAPPER_VERSION = "2.0.0";
let _scriptLoadPromise$1 = null;
function isInterstitialKey(keyOrRawId) {
  const lower = keyOrRawId.toLowerCase();
  return lower.indexOf("interstitial") === 0 || lower.indexOf("inter_") === 0 || lower.indexOf("midgame") === 0;
}
function loadCrazyGamesScript() {
  var _a;
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("CrazyGames: window/document \uBBF8\uC874\uC7AC (\uBE0C\uB77C\uC6B0\uC800 \uC678 \uD658\uACBD)"));
  }
  if ((_a = window.CrazyGames) == null ? void 0 : _a.SDK) {
    return Promise.resolve();
  }
  if (_scriptLoadPromise$1) {
    return _scriptLoadPromise$1;
  }
  _scriptLoadPromise$1 = new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = SDK_SCRIPT_URL$1;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => {
      _scriptLoadPromise$1 = null;
      reject(new Error("CrazyGames JS SDK \uB85C\uB4DC \uC2E4\uD328 (\uB124\uD2B8\uC6CC\uD06C \uD655\uC778 \uD544\uC694)"));
    };
    document.head.appendChild(tag);
  });
  return _scriptLoadPromise$1;
}
const BANNER_DIMENSIONS = {
  leaderboard: { width: 728, height: 90 },
  medium: { width: 300, height: 250 },
  mobile: { width: 320, height: 50 },
  main: { width: 468, height: 60 },
  largeMobile: { width: 320, height: 100 }
};
function mapBannerErrorCode(code) {
  const known = [
    "bannersDisabledBasicLaunch",
    "unfilled",
    "missingId",
    "notVisible",
    "noAvailableSizes",
    "notCreated",
    "videoAdPlaying",
    "invalidSize",
    "bannerCooldown",
    "maxRefreshReached",
    "bannersDisabledMobileApp"
  ];
  for (let i = 0; i < known.length; i++) {
    if (known[i] === code) return known[i];
  }
  return "other";
}
function errCode(err) {
  if (err && typeof err === "object" && typeof err.code === "string") return err.code;
  return void 0;
}
function errMsg(err) {
  if (err && typeof err === "object") {
    if (typeof err.message === "string" && err.message) return err.message;
    if (typeof err.code === "string") return err.code;
  }
  return String(err);
}
function toPlatformUser(u) {
  return {
    dangerousUserId: u.__dangerousUserId,
    username: u.username,
    profilePictureUrl: u.profilePictureUrl
  };
}
function toLeaderboardEntry(e) {
  var _a, _b;
  return {
    rank: e.rank,
    score: e.score,
    username: (_b = (_a = e.username) != null ? _a : e.name) != null ? _b : "",
    profilePictureUrl: e.profilePictureUrl,
    isPlayer: e.self === true || e.isPlayer === true
  };
}
function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function bytesToBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function encryptLeaderboardScore(score, encryptionKeyB64, sdk) {
  return __async$9(this, null, function* () {
    const lb = sdk.leaderboards;
    if (lb && typeof lb.encryptScore === "function") {
      return yield lb.encryptScore(score, encryptionKeyB64);
    }
    if (typeof sdk.user.encryptScore === "function") {
      return yield sdk.user.encryptScore(score, encryptionKeyB64);
    }
    const subtle = typeof crypto !== "undefined" ? crypto.subtle : void 0;
    if (!subtle || typeof crypto.getRandomValues !== "function") {
      throw new Error("Web Crypto(subtle) \uBBF8\uC9C0\uC6D0 \uD658\uACBD\uC5D0\uC11C\uB294 \uC810\uC218 \uC554\uD638\uD654\uB97C \uC218\uD589\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
    }
    const keyBytes = base64ToBytes(encryptionKeyB64);
    const key = yield subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(String(score));
    const ct = new Uint8Array(yield subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
    const combined = new Uint8Array(iv.length + ct.length);
    combined.set(iv, 0);
    combined.set(ct, iv.length);
    return bytesToBase64(combined);
  });
}
class CrazyGamesAdapter {
  constructor() {
    __publicField$3(this, "id", "crazygames");
    __publicField$3(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      "data",
      "lifecycle",
      "banner",
      "userAccount",
      "leaderboard"
    ]));
    /**
     * CrazyGames는 `adError`(adblock 포함)에서 보상 지급을 금지하므로 grantOnAdblock 기본값 false.
     * (SDK 전역 기본값은 true. 게임이 명시적으로 켜면 그대로 적용됨.)
     */
    __publicField$3(this, "defaultGrantOnAdblock", false);
    __publicField$3(this, "_initialized", false);
    __publicField$3(this, "_sdk", null);
    /** addAuthListener로 등록한 래퍼 콜백 매핑 (해제 시 동일 참조 필요) */
    __publicField$3(this, "_authListeners", /* @__PURE__ */ new Map());
  }
  hasCapability(cap) {
    return this.capabilities.has(cap);
  }
  isInitialized() {
    return this._initialized;
  }
  /**
   * CrazyGames SDK 초기화.
   * 1. CDN 스크립트 동적 로드
   * 2. window.CrazyGames.SDK.init() 호출
   * 3. game.loadingStart() — loading() 콜백 — game.loadingStop() 으로 로딩 라이프사이클 통보
   * 멱등성: 이미 초기화된 경우 즉시 반환.
   */
  init(loading, _options) {
    return __async$9(this, null, function* () {
      var _a;
      if (this._initialized) {
        return { success: true };
      }
      try {
        yield loadCrazyGamesScript();
        const sdk = (_a = window.CrazyGames) == null ? void 0 : _a.SDK;
        if (!sdk) {
          return {
            success: false,
            error: "CrazyGames SDK \uB85C\uB4DC \uD6C4\uC5D0\uB3C4 window.CrazyGames.SDK \uBBF8\uC874\uC7AC"
          };
        }
        yield sdk.init({
          wrapper: {
            engine: SDK_WRAPPER_ENGINE,
            sdkVersion: SDK_WRAPPER_VERSION
          }
        });
        if (sdk.environment === "disabled") {
          return {
            success: false,
            error: `CrazyGames SDK \uD658\uACBD 'disabled' \u2014 \uBE44-CrazyGames \uB3C4\uBA54\uC778\uC5D0\uC11C \uAC15\uC81C \uD65C\uC131\uD654\uB428. host=${window.location.host}`
          };
        }
        this._sdk = sdk;
        logger.info(`CrazyGames SDK \uCD08\uAE30\uD654 \uC644\uB8CC (env=${sdk.environment})`);
        sdk.game.loadingStart();
        try {
          yield loading();
        } finally {
          sdk.game.loadingStop();
        }
        this._initialized = true;
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `CrazyGames init \uC2E4\uD328: ${errorMessage}` };
      }
    });
  }
  // ============================================
  // AdCapable
  //   CrazyGames 광고 = type 기반 ('midgame' | 'rewarded')
  //   매핑 정책: 광고 키 prefix로 결정 (isInterstitialKey)
  //     - 'interstitial' / 'inter_' / 'midgame' 시작 → 'midgame' (전면)
  //     - 그 외 (reward_* 등) → 'rewarded' (리워드)
  //   onEarned 콜백은 type === 'rewarded'일 때만 호출.
  // ============================================
  showAd(keyOrRawId, onEarnedOrCallbacks) {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) {
        return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      }
      const callbacks = typeof onEarnedOrCallbacks === "function" ? { onEarned: onEarnedOrCallbacks } : onEarnedOrCallbacks != null ? onEarnedOrCallbacks : {};
      const type = isInterstitialKey(keyOrRawId) ? "midgame" : "rewarded";
      return new Promise((resolve) => {
        let started = false;
        sdk.ad.requestAd(type, {
          adStarted: () => {
            var _a;
            started = true;
            logger.debug(`CrazyGames \uAD11\uACE0 \uC2DC\uC791 (type=${type})`);
            try {
              (_a = callbacks.onStarted) == null ? void 0 : _a.call(callbacks);
            } catch (err) {
              logger.warn(`onStarted \uCF5C\uBC31 \uC5D0\uB7EC: ${err}`);
            }
          },
          adError: (error) => {
            logger.warn(`CrazyGames \uAD11\uACE0 \uC5D0\uB7EC (code=${error.code}): ${error.message}`);
            const errorCode = mapAdErrorCode(error.code);
            resolve({
              success: false,
              error: `${error.code}: ${error.message}`,
              errorCode
            });
          },
          adFinished: () => {
            logger.debug(`CrazyGames \uAD11\uACE0 \uC885\uB8CC (type=${type}, started=${started})`);
            const rewarded = type === "rewarded";
            if (callbacks.onEarned && rewarded) {
              try {
                callbacks.onEarned({ key: keyOrRawId });
              } catch (err) {
                logger.warn(`onEarned \uCF5C\uBC31 \uC5D0\uB7EC: ${err}`);
              }
            }
            resolve({ success: true, rewarded });
          }
        });
      });
    });
  }
  // ============================================
  // DataStorageCapable
  //   CrazyGames data API는 localStorage 호환 (string only).
  //   Hi5 호환을 위해 JSON 직렬화/역직렬화 적용.
  // ============================================
  getItem(key, defaultValue) {
    const sdk = this._sdk;
    if (!sdk) return defaultValue;
    try {
      const raw = sdk.data.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      return defaultValue;
    }
  }
  setItem(key, value, _submit = true) {
    const sdk = this._sdk;
    if (!sdk) return;
    try {
      sdk.data.setItem(key, JSON.stringify(value));
    } catch (err) {
      logger.warn(`CrazyGames setItem \uC2E4\uD328 (key=${key}): ${err}`);
    }
  }
  saveData() {
  }
  removeItem(key) {
    var _a;
    (_a = this._sdk) == null ? void 0 : _a.data.removeItem(key);
  }
  clear() {
    var _a;
    (_a = this._sdk) == null ? void 0 : _a.data.clear();
  }
  /**
   * AdBlock 감지 (CrazyGames SDK 위임).
   * 초기화 전 호출되면 false 반환 (안전 fallback).
   */
  hasAdblock() {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return false;
      try {
        return yield sdk.ad.hasAdblock();
      } catch (err) {
        logger.warn(`CrazyGames hasAdblock \uC2E4\uD328: ${err}`);
        return false;
      }
    });
  }
  // ============================================
  // LifecycleCapable
  //   gameStart/End → CrazyGames의 gameplayStart/Stop으로 매핑
  //   (loadingStart/Stop은 init() 내부에서 자동 처리)
  // ============================================
  gameStart() {
    var _a;
    (_a = this._sdk) == null ? void 0 : _a.game.gameplayStart();
  }
  gameEnd() {
    var _a;
    (_a = this._sdk) == null ? void 0 : _a.game.gameplayStop();
  }
  happytime() {
    var _a;
    (_a = this._sdk) == null ? void 0 : _a.game.happytime();
  }
  // ============================================
  // BannerCapable
  //   정적 배너 5종 + 반응형. 컨테이너당 30초 쿨다운, 사이즈당 세션 120회 한도(SDK가 강제).
  //   활성 게임플레이 중 표시 금지 — 호출 위치는 게임 책임.
  // ============================================
  requestBanner(containerId, size) {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      const dim = BANNER_DIMENSIONS[size];
      if (!dim) {
        return { success: false, error: `\uC54C \uC218 \uC5C6\uB294 \uBC30\uB108 \uC0AC\uC774\uC988: ${size}`, errorCode: "invalidSize" };
      }
      try {
        yield sdk.banner.requestBanner({ id: containerId, width: dim.width, height: dim.height });
        return { success: true };
      } catch (err) {
        const code = errCode(err);
        logger.warn(`CrazyGames \uBC30\uB108 \uC694\uCCAD \uC2E4\uD328 (id=${containerId}, code=${code}): ${errMsg(err)}`);
        return { success: false, error: errMsg(err), errorCode: code ? mapBannerErrorCode(code) : "other" };
      }
    });
  }
  requestResponsiveBanner(containerId) {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      try {
        yield sdk.banner.requestResponsiveBanner(containerId);
        return { success: true };
      } catch (err) {
        const code = errCode(err);
        logger.warn(`CrazyGames \uBC18\uC751\uD615 \uBC30\uB108 \uC694\uCCAD \uC2E4\uD328 (id=${containerId}, code=${code}): ${errMsg(err)}`);
        return { success: false, error: errMsg(err), errorCode: code ? mapBannerErrorCode(code) : "other" };
      }
    });
  }
  clearBanner(containerId) {
    var _a;
    try {
      (_a = this._sdk) == null ? void 0 : _a.banner.clearBanner(containerId);
    } catch (err) {
      logger.warn(`CrazyGames clearBanner \uC2E4\uD328 (id=${containerId}): ${err}`);
    }
  }
  clearAllBanners() {
    var _a;
    try {
      (_a = this._sdk) == null ? void 0 : _a.banner.clearAllBanners();
    } catch (err) {
      logger.warn(`CrazyGames clearAllBanners \uC2E4\uD328: ${err}`);
    }
  }
  // ============================================
  // UserAccountCapable
  //   CrazyGames user 모듈 위임. __dangerousUserId → dangerousUserId 리네임.
  //   메서드 호출은 250ms 간격 rate limit (SDK가 강제) — 게임이 의식할 것.
  // ============================================
  isUserAccountAvailable() {
    var _a;
    try {
      return ((_a = this._sdk) == null ? void 0 : _a.user.isUserAccountAvailable) === true;
    } catch (e) {
      return false;
    }
  }
  getUser() {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return null;
      try {
        const u = yield sdk.user.getUser();
        return u ? toPlatformUser(u) : null;
      } catch (err) {
        logger.warn(`CrazyGames getUser \uC2E4\uD328: ${err}`);
        return null;
      }
    });
  }
  showAuthPrompt() {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      try {
        const u = yield sdk.user.showAuthPrompt();
        return { success: true, user: toPlatformUser(u) };
      } catch (err) {
        return { success: false, error: errMsg(err) };
      }
    });
  }
  getUserToken() {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      try {
        const token = yield sdk.user.getUserToken();
        return { success: true, token };
      } catch (err) {
        return { success: false, error: errMsg(err) };
      }
    });
  }
  showAccountLinkPrompt() {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      try {
        const res = yield sdk.user.showAccountLinkPrompt();
        return { success: true, linked: (res == null ? void 0 : res.response) === "yes" };
      } catch (err) {
        return { success: false, error: errMsg(err) };
      }
    });
  }
  addAuthListener(listener) {
    const sdk = this._sdk;
    if (!sdk) return;
    if (this._authListeners.has(listener)) return;
    const wrapped = (u) => {
      try {
        listener(u ? toPlatformUser(u) : null);
      } catch (err) {
        logger.warn(`auth \uB9AC\uC2A4\uB108 \uCF5C\uBC31 \uC5D0\uB7EC: ${err}`);
      }
    };
    this._authListeners.set(listener, wrapped);
    try {
      sdk.user.addAuthListener(wrapped);
    } catch (err) {
      this._authListeners.delete(listener);
      logger.warn(`CrazyGames addAuthListener \uC2E4\uD328: ${err}`);
    }
  }
  removeAuthListener(listener) {
    var _a;
    const wrapped = this._authListeners.get(listener);
    if (!wrapped) return;
    this._authListeners.delete(listener);
    try {
      (_a = this._sdk) == null ? void 0 : _a.user.removeAuthListener(wrapped);
    } catch (err) {
      logger.warn(`CrazyGames removeAuthListener \uC2E4\uD328: ${err}`);
    }
  }
  getSystemInfo() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const sdk = this._sdk;
    if (!sdk) return null;
    try {
      const si = sdk.user.systemInfo;
      if (!si) return null;
      return {
        countryCode: si.countryCode,
        locale: si.locale,
        device: { type: (_b = (_a = si.device) == null ? void 0 : _a.type) != null ? _b : "desktop" },
        os: { name: (_d = (_c = si.os) == null ? void 0 : _c.name) != null ? _d : "", version: (_f = (_e = si.os) == null ? void 0 : _e.version) != null ? _f : "" },
        browser: { name: (_h = (_g = si.browser) == null ? void 0 : _g.name) != null ? _h : "", version: (_j = (_i = si.browser) == null ? void 0 : _i.version) != null ? _j : "" },
        applicationType: (_k = si.applicationType) != null ? _k : "web"
      };
    } catch (err) {
      logger.warn(`CrazyGames systemInfo \uC811\uADFC \uC2E4\uD328: ${err}`);
      return null;
    }
  }
  listFriends(options) {
    return __async$9(this, null, function* () {
      var _a, _b, _c, _d, _e;
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      if (typeof sdk.user.listFriends !== "function") {
        return { success: false, error: "CrazyGames SDK\uAC00 listFriends\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 (SDK \uBC84\uC804 \uD655\uC778)" };
      }
      if (!options || options.page < 1 || options.size <= 0 || options.size > 50) {
        return { success: false, error: "page\uB294 1\uBD80\uD130, size\uB294 1~50 \uC0AC\uC774\uC5EC\uC57C \uD569\uB2C8\uB2E4" };
      }
      try {
        const res = yield sdk.user.listFriends(options);
        const friends = ((_a = res == null ? void 0 : res.friends) != null ? _a : []).map((f) => ({
          id: f.id,
          username: f.username,
          profilePictureUrl: f.profilePictureUrl
        }));
        return {
          success: true,
          page: {
            friends,
            page: (_b = res == null ? void 0 : res.page) != null ? _b : options.page,
            size: (_c = res == null ? void 0 : res.size) != null ? _c : options.size,
            hasMore: (_d = res == null ? void 0 : res.hasMore) != null ? _d : false,
            total: (_e = res == null ? void 0 : res.total) != null ? _e : friends.length
          }
        };
      } catch (err) {
        return { success: false, error: errMsg(err) };
      }
    });
  }
  // ============================================
  // LeaderboardCapable
  //   점수는 어드민 발급 encryptionKey로 AES-GCM 암호화 후 제출. 검증은 백엔드에서.
  //   submitScore 네임스페이스가 SDK 버전마다 다를 수 있어 leaderboards → user 순으로 탐색.
  // ============================================
  submitLeaderboardScore(score, encryptionKey) {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      let encryptedScore;
      try {
        encryptedScore = yield encryptLeaderboardScore(score, encryptionKey, sdk);
      } catch (err) {
        return { success: false, error: `\uC810\uC218 \uC554\uD638\uD654 \uC2E4\uD328: ${errMsg(err)}` };
      }
      try {
        const lb = sdk.leaderboards;
        if (lb && typeof lb.submitScore === "function") {
          yield lb.submitScore({ encryptedScore, score });
        } else if (typeof sdk.user.submitScore === "function") {
          yield sdk.user.submitScore({ encryptedScore, score });
        } else {
          return {
            success: false,
            error: "CrazyGames SDK\uC5D0 \uB9AC\uB354\uBCF4\uB4DC submitScore\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4 (SDK \uBC84\uC804/\uC124\uC815 \uD655\uC778 \uD544\uC694)"
          };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: errMsg(err) };
      }
    });
  }
  getLeaderboardEntries(options) {
    return __async$9(this, null, function* () {
      var _a;
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      const lb = sdk.leaderboards;
      if (!lb || typeof lb.getLeaderboard !== "function") {
        return { success: false, error: "CrazyGames SDK\uAC00 \uB9AC\uB354\uBCF4\uB4DC \uC870\uD68C\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" };
      }
      try {
        const res = yield lb.getLeaderboard(options);
        return { success: true, entries: ((_a = res == null ? void 0 : res.entries) != null ? _a : []).map(toLeaderboardEntry) };
      } catch (err) {
        return { success: false, error: errMsg(err) };
      }
    });
  }
  getPlayerLeaderboardEntry() {
    return __async$9(this, null, function* () {
      const sdk = this._sdk;
      if (!sdk) return { success: false, error: "CrazyGames SDK \uBBF8\uCD08\uAE30\uD654" };
      const lb = sdk.leaderboards;
      if (!lb || typeof lb.getPlayerEntry !== "function") {
        return { success: false, error: "CrazyGames SDK\uAC00 \uD50C\uB808\uC774\uC5B4 \uC5D4\uD2B8\uB9AC \uC870\uD68C\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" };
      }
      try {
        const e = yield lb.getPlayerEntry();
        return { success: true, entry: e ? toLeaderboardEntry(e) : null };
      } catch (err) {
        return { success: false, error: errMsg(err) };
      }
    });
  }
}
registerAdapter({
  id: "crazygames",
  priority: 50,
  // hi5(100)보다 먼저 검사
  detect: () => {
    if (typeof window === "undefined") return false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("isCrazyGames") === "true") return true;
      if (params.get("useLocalSdk") === "true") return true;
      if (params.has("crazygames")) return true;
    } catch (e) {
    }
    try {
      const origins = window.location.ancestorOrigins;
      if (origins) {
        for (let i = 0; i < origins.length; i++) {
          if (String(origins[i]).includes("crazygames.com")) return true;
        }
      }
    } catch (e) {
    }
    try {
      if (window.location.host.indexOf("crazygames.com") !== -1) return true;
    } catch (e) {
    }
    if (window.CrazyGames !== void 0) return true;
    return false;
  },
  create: () => new CrazyGamesAdapter()
});

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$8 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const STORAGE_PREFIX = "hi5sdk:standalone:";
class StandaloneAdapter {
  constructor() {
    __publicField$2(this, "id", "standalone");
    __publicField$2(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      // mock
      "data",
      "lifecycle"
    ]));
    __publicField$2(this, "_initialized", false);
  }
  hasCapability(cap) {
    return this.capabilities.has(cap);
  }
  isInitialized() {
    return this._initialized;
  }
  init(loading, _options) {
    return __async$8(this, null, function* () {
      if (this._initialized) {
        return { success: true };
      }
      try {
        yield loading();
        this._initialized = true;
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    });
  }
  // ============================================
  // AdCapable (mock)
  // ============================================
  showAd(_keyOrRawId, onEarned) {
    return __async$8(this, null, function* () {
      if (onEarned) onEarned({ type: "mock" });
      return { success: true, rewarded: true };
    });
  }
  // ============================================
  // DataStorageCapable (localStorage)
  // ============================================
  getItem(key, defaultValue) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      return defaultValue;
    }
  }
  setItem(key, value, _submit = true) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
    }
  }
  removeItem(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
    }
  }
  clear() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(STORAGE_PREFIX) === 0) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
    }
  }
  saveData() {
  }
  // ============================================
  // LifecycleCapable (no-op)
  // ============================================
  gameStart() {
  }
  gameEnd() {
  }
}
registerAdapter({
  id: "standalone",
  priority: 1e3,
  // 가장 마지막에 검사
  detect: () => true,
  // 항상 매칭 (fallback)
  create: () => new StandaloneAdapter()
});

function detectPlatform() {
  if (new URLSearchParams(location.search).has("standalone")) {
    return "web";
  }
  const ua = navigator.userAgent;
  if (/AppsInToss|TossApp/i.test(ua)) {
    return "toss";
  }
  if (location.ancestorOrigins) {
    const origins = Array.from(location.ancestorOrigins);
    if (origins.some((origin) => origin.includes("hi5games"))) {
      return "hi5";
    }
    if (origins.some((origin) => origin.includes("crazygames.com"))) {
      return "crazygames";
    }
  }
  if (typeof window.CrazyGames !== "undefined") {
    return "crazygames";
  }
  const uaLower = ua.toLowerCase();
  if (uaLower.includes("android")) {
    return "android";
  }
  if (uaLower.includes("iphone") || uaLower.includes("ipad")) {
    return "ios";
  }
  return "web";
}
function isStandalone() {
  return detectPlatform() === "web";
}

var __defProp$1 = Object.defineProperty;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$7 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Hi5Adapter {
  constructor(hi5) {
    __publicField$1(this, "id", "hi5");
    __publicField$1(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      "iap",
      "data",
      "rank",
      "share",
      "safeArea",
      "vibration",
      "lifecycle"
    ]));
    __publicField$1(this, "_hi5");
    __publicField$1(this, "_initialized", false);
    __publicField$1(this, "_gameData", null);
    __publicField$1(this, "_lastPurchaseProductId", null);
    __publicField$1(this, "_listeners", /* @__PURE__ */ new Map());
    __publicField$1(this, "_pendingResolvers", /* @__PURE__ */ new Map());
    this._hi5 = hi5;
  }
  hasCapability(cap) {
    return this.capabilities.has(cap);
  }
  isInitialized() {
    return this._initialized;
  }
  /**
   * Hi5 SDK 초기화.
   * 멱등성: 이미 초기화된 경우 즉시 success 반환.
   */
  init(loading, options) {
    return __async$7(this, null, function* () {
      if (this._initialized) {
        logger.warn("\uC774\uBBF8 \uCD08\uAE30\uD654\uB428. \uAC74\uB108\uB700.");
        return { success: true };
      }
      if (options == null ? void 0 : options.logLevel) {
        setLogLevel(options.logLevel);
      }
      this._initialized = true;
      try {
        const gameDataPromise = this._once("GAME_DATA");
        this._hi5.Init_SDK((eventData) => {
          this._handleEvent(eventData);
        }, {});
        if (options == null ? void 0 : options.onPurchase) {
          this._on("BUY_ITEM", (data) => {
            var _a, _b;
            const status = (_a = data.data) == null ? void 0 : _a.status;
            const eventData = (_b = data.data) == null ? void 0 : _b.event;
            if (status === 0 && (eventData == null ? void 0 : eventData.type) === "success" && (eventData == null ? void 0 : eventData.data)) {
              const receipt = eventData.data;
              const purchaseData = __spreadValues$1({
                productId: this._lastPurchaseProductId || receipt.displayName || "",
                orderId: receipt.orderId,
                amount: receipt.amount,
                currency: receipt.currency,
                displayAmount: receipt.displayAmount
              }, receipt);
              options.onPurchase(purchaseData);
              this._lastPurchaseProductId = null;
            }
          });
        }
        logger.info("\uAC8C\uC784 \uB85C\uB529 \uC2DC\uC791...");
        yield loading();
        logger.info("\uAC8C\uC784 \uB85C\uB529 \uC644\uB8CC");
        this._hi5.LoadEnd();
        if (isStandalone()) {
          logger.debug("Standalone \uBAA8\uB4DC \uAC10\uC9C0, GAME_DATA \uC218\uB3D9 \uD2B8\uB9AC\uAC70");
          this._handleEvent({ fromhi5action: "GAME_DATA", data: {} });
        }
        yield gameDataPromise;
        if (isStandalone()) {
          logger.info("\uCD08\uAE30\uD654 \uC644\uB8CC (Standalone \uBAA8\uB4DC)");
        } else {
          logger.info("\uCD08\uAE30\uD654 \uC644\uB8CC (Hi5 \uD50C\uB7AB\uD3FC)");
        }
        return { success: true };
      } catch (error) {
        this._initialized = false;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("\uCD08\uAE30\uD654 \uC2E4\uD328:", errorMessage);
        return { success: false, error: errorMessage };
      }
    });
  }
  // ============================================
  // Internal: Event System
  // ============================================
  _handleEvent(eventData) {
    logger.debug("\uC774\uBCA4\uD2B8 \uC218\uC2E0:", JSON.stringify(eventData));
    const action = eventData.fromhi5action;
    if (!action) return;
    if (action === "GAME_DATA") {
      this._gameData = eventData;
      logger.debug("GAME_DATA \uC800\uC7A5 \uC644\uB8CC");
    }
    const listeners = this._listeners.get(action);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(eventData);
        } catch (err) {
          logger.error(`${action} \uB9AC\uC2A4\uB108 \uC2E4\uD589 \uC911 \uC5D0\uB7EC:`, err);
        }
      });
    }
    this._resolvePending(action, eventData);
  }
  _resolvePending(action, data) {
    const toResolve = [];
    this._pendingResolvers.forEach((resolver, key) => {
      if (key.startsWith(action + "_")) {
        if (resolver.timeout) clearTimeout(resolver.timeout);
        resolver.resolve(data);
        toResolve.push(key);
      }
    });
    toResolve.forEach((key) => this._pendingResolvers.delete(key));
  }
  _on(action, listener) {
    if (!this._listeners.has(action)) {
      this._listeners.set(action, /* @__PURE__ */ new Set());
    }
    this._listeners.get(action).add(listener);
  }
  _off(action, listener) {
    var _a;
    (_a = this._listeners.get(action)) == null ? void 0 : _a.delete(listener);
  }
  _once(action, timeoutMs) {
    return new Promise((resolve, reject) => {
      const key = `${action}_${Date.now()}_${Math.random()}`;
      const timeout = timeoutMs ? setTimeout(() => {
        this._pendingResolvers.delete(key);
        reject(new Error(`[Hi5 Async] ${action} \uC774\uBCA4\uD2B8 \uD0C0\uC784\uC544\uC6C3 (${timeoutMs}ms)`));
      }, timeoutMs) : void 0;
      this._pendingResolvers.set(key, { resolve, reject, timeout });
    });
  }
  _waitFor(action, condition, timeoutMs) {
    return new Promise((resolve, reject) => {
      let timeout;
      const listener = (data) => {
        if (condition(data)) {
          this._off(action, listener);
          if (timeout) clearTimeout(timeout);
          resolve(data);
        }
      };
      this._on(action, listener);
      if (timeoutMs) {
        timeout = setTimeout(() => {
          this._off(action, listener);
          reject(new Error(`[Hi5 Async] ${action} \uC774\uBCA4\uD2B8 \uD0C0\uC784\uC544\uC6C3 (${timeoutMs}ms)`));
        }, timeoutMs);
      }
    });
  }
  // ============================================
  // Internal: Resolver Helpers
  // ============================================
  _resolveAd(keyOrRawId) {
    var _a, _b, _c;
    const ads = (_c = (_b = (_a = this._gameData) == null ? void 0 : _a.data) == null ? void 0 : _b.platform_data) == null ? void 0 : _c.ads;
    if (!ads) {
      return { success: false, error: "GAME_DATA\uAC00 \uC544\uC9C1 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4." };
    }
    if (keyOrRawId in ads) {
      return {
        success: true,
        ad: { key: keyOrRawId, rawId: ads[keyOrRawId].aid, info: ads[keyOrRawId] }
      };
    }
    for (const [key, adInfo] of Object.entries(ads)) {
      if (adInfo.aid === keyOrRawId) {
        return {
          success: true,
          ad: { key, rawId: adInfo.aid, info: adInfo }
        };
      }
    }
    return { success: false, error: `\uAD11\uACE0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: ${keyOrRawId}` };
  }
  _resolveProduct(keyOrRawId) {
    var _a, _b, _c;
    const products = (_c = (_b = (_a = this._gameData) == null ? void 0 : _a.data) == null ? void 0 : _b.platform_data) == null ? void 0 : _c.products;
    if (!products) {
      return { success: false, error: "GAME_DATA\uAC00 \uC544\uC9C1 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4." };
    }
    if (keyOrRawId in products) {
      return {
        success: true,
        product: { key: keyOrRawId, rawId: products[keyOrRawId].pid, info: products[keyOrRawId] }
      };
    }
    for (const [key, productInfo] of Object.entries(products)) {
      if (productInfo.pid === keyOrRawId) {
        return {
          success: true,
          product: { key, rawId: productInfo.pid, info: productInfo }
        };
      }
    }
    return { success: false, error: `\uC0C1\uD488\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: ${keyOrRawId}` };
  }
  // ============================================
  // AdCapable
  // ============================================
  /**
   * Hi5 platform_data.ads에 등록된 광고 키 목록 반환.
   * GAME_DATA 미수신 상태면 빈 배열.
   */
  listKnownAdKeys() {
    var _a, _b, _c;
    const ads = (_c = (_b = (_a = this._gameData) == null ? void 0 : _a.data) == null ? void 0 : _b.platform_data) == null ? void 0 : _c.ads;
    return ads ? Object.keys(ads) : [];
  }
  showAd(keyOrRawId, onEarnedOrCallbacks) {
    return __async$7(this, null, function* () {
      var _a, _b;
      const callbacks = typeof onEarnedOrCallbacks === "function" ? { onEarned: onEarnedOrCallbacks } : onEarnedOrCallbacks != null ? onEarnedOrCallbacks : {};
      const onEarned = callbacks.onEarned;
      const onStarted = callbacks.onStarted;
      try {
        const result = this._resolveAd(keyOrRawId);
        if (!result.success) {
          logger.error(result.error);
          return { success: false, error: result.error };
        }
        const { key, rawId, info } = result.ad;
        logger.info(`\uAD11\uACE0 \uB85C\uB4DC \uC2DC\uC791: ${key} (rawId: ${rawId})`);
        this._hi5.loadAd(info);
        const loadResult = yield this._waitFor("LOAD_AD", (data) => data.data !== void 0);
        const loadStatus = (_a = loadResult.data) == null ? void 0 : _a.status;
        if (loadStatus !== 0) {
          const error = `\uAD11\uACE0 \uB85C\uB4DC \uC2E4\uD328 (status: ${loadStatus})`;
          logger.error(error);
          return { success: false, error };
        }
        logger.info(`\uAD11\uACE0 \uB85C\uB4DC \uC131\uACF5: ${key} (rawId: ${rawId})`);
        this._hi5.showAd(info);
        logger.debug(`\uAD11\uACE0 \uD45C\uC2DC \uC694\uCCAD: ${key} (rawId: ${rawId})`);
        const dismissCondition = (data) => {
          var _a2, _b2;
          const type = (_a2 = data.data) == null ? void 0 : _a2.type;
          const status = (_b2 = data.data) == null ? void 0 : _b2.status;
          logger.debug(`waitFor \uC870\uAC74 \uCCB4\uD06C: type=${type}, status=${status}`);
          return type === "dismissed" || type === "" && status !== 0;
        };
        let earned = false;
        const sideListener = (data) => {
          var _a2;
          logger.debug("SHOW_AD \uC774\uBCA4\uD2B8 \uC218\uC2E0:", JSON.stringify(data));
          const type = (_a2 = data.data) == null ? void 0 : _a2.type;
          if (type === "show" && onStarted) {
            try {
              onStarted();
            } catch (err) {
              logger.warn(`onStarted \uCF5C\uBC31 \uC5D0\uB7EC: ${err}`);
            }
          } else if (type === "userEarnedReward") {
            earned = true;
            logger.info(`\uBCF4\uC0C1 \uD68D\uB4DD: ${key}`);
            if (onEarned) {
              try {
                onEarned(data.data);
              } catch (err) {
                logger.warn(`onEarned \uCF5C\uBC31 \uC5D0\uB7EC: ${err}`);
              }
            }
          }
        };
        this._on("SHOW_AD", sideListener);
        try {
          logger.debug("dismissed \uC774\uBCA4\uD2B8 \uB300\uAE30 \uC911...");
          const dismissResult = yield this._waitFor("SHOW_AD", dismissCondition);
          logger.debug("SHOW_AD \uC774\uBCA4\uD2B8 \uC218\uC2E0:", JSON.stringify(dismissResult));
          this._hi5.ShowAdEnd(info);
          const dismissStatus = (_b = dismissResult.data) == null ? void 0 : _b.status;
          if (dismissStatus !== 0) {
            const error = `\uAD11\uACE0 \uD45C\uC2DC \uC2E4\uD328 (status: ${dismissStatus})`;
            logger.error(error);
            return { success: false, error };
          }
          logger.info(`\uAD11\uACE0 \uC644\uB8CC: ${key} (rewarded: ${earned})`);
          return { success: true, rewarded: earned };
        } finally {
          this._off("SHOW_AD", sideListener);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`\uAD11\uACE0 \uC2E4\uD328: ${keyOrRawId}`, errorMessage);
        return { success: false, error: errorMessage };
      }
    });
  }
  // ============================================
  // IAPCapable
  // ============================================
  getProducts() {
    var _a;
    return ((_a = this._hi5.PlatFormData) == null ? void 0 : _a.products) || {};
  }
  getProduct(productKey) {
    var _a, _b;
    const product = (_b = (_a = this._hi5.PlatFormData) == null ? void 0 : _a.products) == null ? void 0 : _b[productKey];
    if (product) {
      return { success: true, product };
    }
    return { success: false, error: `\uC0C1\uD488\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC74C: ${productKey}` };
  }
  purchase(keyOrRawId) {
    return __async$7(this, null, function* () {
      var _a;
      try {
        const productResult = this._resolveProduct(keyOrRawId);
        if (!productResult.success) {
          logger.error(productResult.error);
          return { success: false, error: productResult.error };
        }
        const { key, rawId, info } = productResult.product;
        logger.info(`\uC0C1\uD488 \uAD6C\uB9E4 \uC2DC\uC791: ${key} (rawId: ${rawId})`);
        this._lastPurchaseProductId = key;
        this._hi5.purchaseProduct(info);
        logger.debug("BUY_ITEM \uC774\uBCA4\uD2B8 \uB300\uAE30 \uC911...");
        const result = yield this._waitFor("BUY_ITEM", (data) => {
          var _a2;
          const status2 = (_a2 = data.data) == null ? void 0 : _a2.status;
          logger.debug(`BUY_ITEM \uC774\uBCA4\uD2B8 \uC218\uC2E0: status=${status2}`);
          return data.data !== void 0;
        });
        this._hi5.purchaseEnd(info);
        const status = (_a = result.data) == null ? void 0 : _a.status;
        if (status !== 0) {
          const error = `\uAD6C\uB9E4 \uC2E4\uD328 (status: ${status})`;
          logger.error(error);
          return { success: false, error };
        }
        logger.info("\uAD6C\uB9E4 \uC644\uB8CC");
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("\uAD6C\uB9E4 \uC2E4\uD328:", errorMessage);
        return { success: false, error: errorMessage };
      }
    });
  }
  // ============================================
  // DataStorageCapable
  // ============================================
  getItem(key, defaultValue) {
    return this._hi5.getItem(key, defaultValue);
  }
  setItem(key, value, submit = true) {
    this._hi5.setItem(key, value, submit);
  }
  saveData() {
    this._hi5.SaveData();
  }
  // ============================================
  // SafeAreaCapable
  // ============================================
  getSafeArea() {
    return this._hi5.getSafeArea();
  }
  // ============================================
  // RankCapable
  // ============================================
  submitScore(score) {
    this._hi5.submitScore(score);
  }
  showRank() {
    this._hi5.showRank();
  }
  // ============================================
  // ShareCapable
  // ============================================
  shareText(message) {
    this._hi5.shareText(message);
  }
  shareAppLink(appname, uri) {
    this._hi5.shareAppLink(appname, uri);
  }
  // ============================================
  // VibrationCapable
  // ============================================
  vibration() {
    this._hi5.vibration();
  }
  // ============================================
  // LifecycleCapable
  // ============================================
  gameStart() {
    this._hi5.GameStart();
  }
  gameEnd() {
    this._hi5.GameEnd();
  }
  // ============================================
  // Hi5 인스턴스 직접 접근 (escape hatch)
  // ============================================
  /**
   * Hi5 raw 인스턴스 반환.
   * 어댑터가 노출하지 않는 메서드(ShowHelp, ShowMainMenu 등)에 접근할 때 사용.
   */
  getRawHi5() {
    return this._hi5;
  }
}

const KAKAO_SERVER_BRIDGES = {
  dev: "https://cube-infodesk-zinny3.kakaogames.com/v2/h5",
  qa: "https://qa-gc-infodesk-zinny3.kakaogames.com/v2/h5",
  live: "https://gc-infodesk-zinny3.kakaogames.com/v2/h5"
};
const SDK_SCRIPT_URL = "https://gameplay.game.kakao.com/sdk/h5/kakaogames-h5-sdk-1.1.0.js";
let _scriptLoadPromise = null;
function loadKakaoSdkScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Kakao: window/document \uBBF8\uC874\uC7AC (\uBE0C\uB77C\uC6B0\uC800 \uC678 \uD658\uACBD)"));
  }
  if (window.HF) return Promise.resolve();
  if (_scriptLoadPromise) return _scriptLoadPromise;
  _scriptLoadPromise = new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = SDK_SCRIPT_URL;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => {
      _scriptLoadPromise = null;
      reject(new Error("Kakao H5 SDK \uB85C\uB4DC \uC2E4\uD328 (\uB124\uD2B8\uC6CC\uD06C \uD655\uC778 \uD544\uC694)"));
    };
    document.head.appendChild(tag);
  });
  return _scriptLoadPromise;
}
function promisifyKakaoCall(fn, params) {
  return new Promise((resolve, reject) => {
    try {
      fn(params, (response) => resolve(response));
    } catch (err) {
      reject(err);
    }
  });
}
function promisifyKakaoCb(fn) {
  return new Promise((resolve, reject) => {
    try {
      fn((response) => resolve(response));
    } catch (err) {
      reject(err);
    }
  });
}
function asAsyncResult(res) {
  var _a, _b;
  if (res == null ? void 0 : res.isSuccess) return { success: true };
  return {
    success: false,
    error: `Kakao SDK error (code=${(_a = res == null ? void 0 : res.code) != null ? _a : "unknown"}): ${(_b = res == null ? void 0 : res.message) != null ? _b : ""}`.trim()
  };
}
function kakaoErrMsg(err) {
  if (err instanceof Error && err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch (e) {
    return String(err);
  }
}

var __async$6 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function kakaoStart(hf, config) {
  return __async$6(this, null, function* () {
    try {
      const response = yield promisifyKakaoCall(
        hf.Application.start.bind(hf.Application),
        config
      );
      return asAsyncResult(response);
    } catch (err) {
      return {
        success: false,
        error: `kakaoStart failed: ${kakaoErrMsg(err)}`
      };
    }
  });
}
function kakaoIsLoggedIn(hf) {
  try {
    return hf.Player.isLoggedIn();
  } catch (e) {
    return false;
  }
}
function kakaoCurrentPlayer(hf) {
  try {
    if (!kakaoIsLoggedIn(hf)) {
      return null;
    }
    return hf.Player.currentPlayer();
  } catch (e) {
    return null;
  }
}

let _installed$1 = false;
function installKakaoDesktopOauthBridge() {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  if (_installed$1) return true;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const isMobile = /Android|iPhone|iPad/i.test(ua);
  if (isMobile) {
    logger.debug("[Kakao desktopBridge] \uBAA8\uBC14\uC77C UA \u2014 intent:// \uC6B0\uD68C \uBE44\uD65C\uC131 (\uB124\uC774\uD2F0\uBE0C \uCC98\uB9AC)");
    return false;
  }
  function extractFallback(url) {
    if (typeof url !== "string" || url.indexOf("intent:") !== 0) return null;
    const m = url.match(/S\.browser_fallback_url=([^;]+)/);
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]);
    } catch (e) {
      return m[1];
    }
  }
  function rerouteIfIntent(url) {
    const fb = extractFallback(url);
    if (!fb) return url;
    logger.info(`[Kakao desktopBridge] intent:// \uCC28\uB2E8 \u2192 web OAuth\uB85C \uC6B0\uD68C: ${fb}`);
    return fb;
  }
  try {
    const proto = Object.getPrototypeOf(window.location);
    const desc = Object.getOwnPropertyDescriptor(proto, "href") || Object.getOwnPropertyDescriptor(window.location, "href");
    if (desc && desc.set && desc.configurable) {
      const origSet = desc.set;
      Object.defineProperty(proto, "href", Object.assign({}, desc, {
        set: function(value) {
          return origSet.call(this, rerouteIfIntent(value));
        }
      }));
      logger.debug("[Kakao desktopBridge] href setter \uD328\uCE58 \uC131\uACF5");
    } else {
      logger.debug("[Kakao desktopBridge] href setter \uD328\uCE58 \uC2A4\uD0B5 (descriptor not configurable)");
    }
  } catch (e) {
    logger.debug(`[Kakao desktopBridge] href setter \uD328\uCE58 \uC2E4\uD328: ${String(e)}`);
  }
  try {
    const origAssign = window.location.assign.bind(window.location);
    window.location.assign = function(url) {
      return origAssign(rerouteIfIntent(url));
    };
  } catch (e) {
    logger.debug(`[Kakao desktopBridge] assign \uD328\uCE58 \uC2E4\uD328: ${String(e)}`);
  }
  try {
    const origReplace = window.location.replace.bind(window.location);
    window.location.replace = function(url) {
      return origReplace(rerouteIfIntent(url));
    };
  } catch (e) {
    logger.debug(`[Kakao desktopBridge] replace \uD328\uCE58 \uC2E4\uD328: ${String(e)}`);
  }
  try {
    const origOpen = window.open.bind(window);
    window.open = function(url, ...rest) {
      const rerouted = url == null ? url : rerouteIfIntent(url);
      return origOpen(rerouted, ...rest);
    };
  } catch (e) {
    logger.debug(`[Kakao desktopBridge] open \uD328\uCE58 \uC2E4\uD328: ${String(e)}`);
  }
  document.addEventListener("click", function(e) {
    const target = e.target;
    const a = target && typeof target.closest === "function" ? target.closest("a") : null;
    if (!a || !a.href) return;
    const fb = extractFallback(a.href);
    if (fb) {
      e.preventDefault();
      e.stopPropagation();
      logger.info(`[Kakao desktopBridge] <a intent://> \uD074\uB9AD \uCC28\uB2E8 \u2192 web OAuth: ${fb}`);
      window.location.href = fb;
    }
  }, true);
  window.__kakaoIntentReroute = function(intentUrl) {
    const fb = extractFallback(intentUrl);
    if (fb) {
      logger.info(`[Kakao desktopBridge] \uC218\uB3D9 \uC6B0\uD68C: ${fb}`);
      window.location.href = fb;
      return fb;
    }
    logger.warn("[Kakao desktopBridge] \uC218\uB3D9 \uC6B0\uD68C \uC2E4\uD328 \u2014 browser_fallback_url \uCD94\uCD9C \uBD88\uAC00");
    return null;
  };
  _installed$1 = true;
  logger.info("[Kakao desktopBridge] intent:// \u2192 web OAuth \uC6B0\uD68C \uBE0C\uB9BF\uC9C0 \uD65C\uC131 (window.__kakaoIntentReroute \uD3F4\uBC31 \uC0AC\uC6A9 \uAC00\uB2A5)");
  return true;
}

const QA_HOST = "qa-openapi-zinny3.game.kakao.com";
const CUBE_HOST = "cube-openapi-zinny3.game.kakao.com";
let _installed = false;
function _redirect(url) {
  if (typeof url !== "string") return url;
  if (url.indexOf(QA_HOST) < 0) return url;
  return url.replace(QA_HOST, CUBE_HOST);
}
function installQaApiToCubeRedirect() {
  var _a;
  if (_installed) return;
  if (typeof window === "undefined") return;
  try {
    const origFetch = (_a = window.fetch) == null ? void 0 : _a.bind(window);
    if (origFetch) {
      window.fetch = function(input, init) {
        if (typeof input === "string") {
          const next = _redirect(input);
          if (next !== input) {
            logger.info(`[Kakao hostRedirect] fetch: ${input} \u2192 ${next}`);
            return origFetch(next, init);
          }
        } else if (input instanceof URL) {
          const next = _redirect(input.toString());
          if (next !== input.toString()) {
            logger.info(`[Kakao hostRedirect] fetch(URL): ${input} \u2192 ${next}`);
            return origFetch(next, init);
          }
        } else if (input && typeof input.url === "string") {
          const req = input;
          const next = _redirect(req.url);
          if (next !== req.url) {
            logger.info(`[Kakao hostRedirect] fetch(Request): ${req.url} \u2192 ${next}`);
            return origFetch(new Request(next, req), init);
          }
        }
        return origFetch(input, init);
      };
    }
  } catch (e) {
    logger.warn(`[Kakao hostRedirect] fetch \uD328\uCE58 \uC2E4\uD328: ${String(e)}`);
  }
  try {
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      const urlStr = typeof url === "string" ? url : url.toString();
      const next = _redirect(urlStr);
      if (next !== urlStr) {
        logger.info(`[Kakao hostRedirect] XHR ${method}: ${urlStr} \u2192 ${next}`);
        return origOpen.call(this, method, next, ...rest);
      }
      return origOpen.call(this, method, url, ...rest);
    };
  } catch (e) {
    logger.warn(`[Kakao hostRedirect] XHR \uD328\uCE58 \uC2E4\uD328: ${String(e)}`);
  }
  _installed = true;
  logger.info(`[Kakao hostRedirect] activated \u2014 ${QA_HOST} \u2192 ${CUBE_HOST}`);
}

var __async$5 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function kakaoShareSend(hf, param) {
  return __async$5(this, null, function* () {
    try {
      const response = yield promisifyKakaoCall(hf.Share.send.bind(hf.Share), param);
      return asAsyncResult(response);
    } catch (err) {
      return {
        success: false,
        error: kakaoErrMsg(err)
      };
    }
  });
}

var __async$4 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const DEFAULT_LEADERBOARD_ID = "ranking";
const DEFAULT_SEASON_SEQ = 0;
function kakaoSubmitScore(hf, options) {
  return __async$4(this, null, function* () {
    var _a;
    try {
      const params = {
        leaderboardId: (_a = options.leaderboardId) != null ? _a : DEFAULT_LEADERBOARD_ID,
        score: options.score
      };
      const res = yield promisifyKakaoCall(
        hf.Leaderboard.submitScore.bind(hf.Leaderboard),
        params
      );
      return asAsyncResult(res);
    } catch (err) {
      return { success: false, error: kakaoErrMsg(err) };
    }
  });
}
function kakaoAccumulateScore(hf, options) {
  return __async$4(this, null, function* () {
    var _a;
    try {
      const params = {
        leaderboardId: (_a = options.leaderboardId) != null ? _a : DEFAULT_LEADERBOARD_ID,
        score: options.score
      };
      const res = yield promisifyKakaoCall(
        hf.Leaderboard.accumulateScore.bind(hf.Leaderboard),
        params
      );
      return asAsyncResult(res);
    } catch (err) {
      return { success: false, error: kakaoErrMsg(err) };
    }
  });
}
function kakaoSetProperties(hf, properties) {
  return __async$4(this, null, function* () {
    if ("nickname" in properties) {
      return {
        success: false,
        error: "`nickname`\uC740 Kakao \uC608\uC57D\uC5B4\uB85C \uC0AC\uC6A9 \uBD88\uAC00\uD569\uB2C8\uB2E4"
      };
    }
    try {
      const res = yield promisifyKakaoCall(
        hf.Leaderboard.setProperties.bind(hf.Leaderboard),
        properties
      );
      return asAsyncResult(res);
    } catch (err) {
      return { success: false, error: kakaoErrMsg(err) };
    }
  });
}
function kakaoMyRanking(hf, options) {
  return __async$4(this, null, function* () {
    var _a, _b, _c, _d, _e;
    try {
      const params = {
        leaderboardId: (_a = options.leaderboardId) != null ? _a : DEFAULT_LEADERBOARD_ID,
        seasonSeq: (_b = options.seasonSeq) != null ? _b : DEFAULT_SEASON_SEQ
      };
      const res = yield promisifyKakaoCall(
        hf.Leaderboard.myRanking.bind(hf.Leaderboard),
        params
      );
      if (!res.isSuccess) {
        return {
          success: false,
          error: `Kakao SDK error (code=${(_c = res == null ? void 0 : res.code) != null ? _c : "unknown"}): ${(_d = res == null ? void 0 : res.message) != null ? _d : ""}`.trim()
        };
      }
      const content = res.content;
      if (content == null || typeof content.playerId !== "string" || typeof content.rank !== "number" || typeof content.score !== "number" || typeof content.highscore !== "number" || typeof content.cardinality !== "number") {
        return { success: true, ranking: null };
      }
      const ranking = {
        playerId: content.playerId,
        rank: content.rank,
        score: content.score,
        highscore: content.highscore,
        cardinality: content.cardinality,
        property: (_e = content.property) != null ? _e : {}
      };
      return { success: true, ranking };
    } catch (err) {
      return { success: false, error: kakaoErrMsg(err) };
    }
  });
}
function kakaoRankings(hf, options) {
  return __async$4(this, null, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
      const params = {
        leaderboardId: (_a = options.leaderboardId) != null ? _a : DEFAULT_LEADERBOARD_ID,
        seasonSeq: (_b = options.seasonSeq) != null ? _b : DEFAULT_SEASON_SEQ,
        beginRank: options.beginRank,
        endRank: options.endRank
      };
      const res = yield promisifyKakaoCall(
        hf.Leaderboard.rankings.bind(hf.Leaderboard),
        params
      );
      if (!res.isSuccess) {
        return {
          success: false,
          error: `Kakao SDK error (code=${(_c = res == null ? void 0 : res.code) != null ? _c : "unknown"}): ${(_d = res == null ? void 0 : res.message) != null ? _d : ""}`.trim()
        };
      }
      const content = (_e = res.content) != null ? _e : {};
      const rankingInfos = ((_f = content.rankingInfos) != null ? _f : []).map(
        (entry) => {
          var _a2;
          return {
            rank: entry.rank,
            playerId: entry.playerId,
            score: entry.score,
            property: (_a2 = entry.property) != null ? _a2 : {}
          };
        }
      );
      const page = {
        seasonSeq: (_g = content.seasonSeq) != null ? _g : DEFAULT_SEASON_SEQ,
        totalPlayerCount: (_h = content.totalPlayerCount) != null ? _h : 0,
        rankingInfos
      };
      return { success: true, page };
    } catch (err) {
      return { success: false, error: kakaoErrMsg(err) };
    }
  });
}

var __async$3 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function kakaoSendLog(hf, type, body) {
  return __async$3(this, null, function* () {
    try {
      const params = { type, body: body != null ? body : {} };
      const response = yield promisifyKakaoCall(hf.Log.send.bind(hf.Log), params);
      return asAsyncResult(response);
    } catch (err) {
      return {
        success: false,
        error: kakaoErrMsg(err)
      };
    }
  });
}

var __async$2 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function isKakaoTalkInApp() {
  if (typeof navigator === "undefined") return false;
  return /KAKAOTALK/i.test(navigator.userAgent || "");
}
function kakaoSoundVolume(hf) {
  return __async$2(this, null, function* () {
    var _a, _b;
    if (!isKakaoTalkInApp()) return 0;
    try {
      const response = yield promisifyKakaoCb(hf.KakaoTalk.soundState.bind(hf.KakaoTalk));
      if (response == null ? void 0 : response.isSuccess) {
        return (_b = (_a = response.content) == null ? void 0 : _a.volume) != null ? _b : 0;
      }
      return 0;
    } catch (err) {
      return 0;
    }
  });
}
function kakaoHaptic(hf, options) {
  if (!isKakaoTalkInApp()) return;
  try {
    hf.KakaoTalk.haptic(options);
  } catch (err) {
  }
}

var __async$1 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function kakaoShowAd(hf, options) {
  return __async$1(this, null, function* () {
    var _a;
    const { unitId, isReward, callbacks, key } = options;
    try {
      const createRes = yield promisifyKakaoCall(
        hf.Ad.createAd.bind(hf.Ad),
        { unitId, isReward }
      );
      if (!createRes.isSuccess) {
        return {
          success: false,
          error: `createAd \uC2E4\uD328 (code=${createRes.code}): ${createRes.message}`,
          errorCode: "unfilled"
        };
      }
      if (callbacks == null ? void 0 : callbacks.onStarted) {
        try {
          callbacks.onStarted();
        } catch (_) {
        }
      }
      const showRes = yield promisifyKakaoCall(
        hf.Ad.show.bind(hf.Ad),
        { unitId }
      );
      if (!showRes.isSuccess) {
        return {
          success: false,
          error: `show \uC2E4\uD328 (code=${showRes.code}): ${showRes.message}`,
          errorCode: "other"
        };
      }
      const rewarded = isReward && ((_a = showRes.content) == null ? void 0 : _a.isRewarded) === true;
      if (rewarded) {
        if (callbacks == null ? void 0 : callbacks.onEarned) {
          try {
            callbacks.onEarned({ key, isRewarded: true });
          } catch (_) {
          }
        }
      }
      return { success: true, rewarded };
    } catch (err) {
      return {
        success: false,
        error: kakaoErrMsg(err),
        errorCode: "other"
      };
    }
  });
}

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const DEFAULT_INTERSTITIAL_PREFIXES = ["interstitial", "inter_", "midgame"];
const DEFAULT_KAKAO_AD_UNITS = {
  // ───── 전면(midgame, 비보상형) ─────
  /** 전면 결과창 (기본 전면). `showAd('interstitial')` 의 기본 대상. */
  interstitial: { android: "DAN-ruHgApIXXPWWSOO0", ios: "DAN-aDL9z3VW5ahULFo7" },
  interstitial_result: { android: "DAN-ruHgApIXXPWWSOO0", ios: "DAN-aDL9z3VW5ahULFo7" },
  /** 전면 캐릭터 저장 */
  interstitial_save: { android: "DAN-ruHgApIXXPWWSOO0", ios: "DAN-aDL9z3VW5ahULFo7" },
  /** 전면 ap 소모 */
  interstitial_ap: { android: "DAN-ruHgApIXXPWWSOO0", ios: "DAN-aDL9z3VW5ahULFo7" },
  // ───── 보상(rewarded) ─────
  /** 보상 아이템 사용 (기본 보상). `showAd('reward')` 의 기본 대상. */
  reward: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  reward_item: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 이어하기 */
  reward_continue: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 출석보상 한 번 더 */
  reward_daily_bonus: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 꾸미기 옷 획득 */
  reward_outfit: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 버프 사용 — ⚠️ xlsx 원본에서 iOS도 동일 unitId로 기재되어 있음 (오기 가능, 카카오게임즈에 확인 필요) */
  reward_buff: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 부활하기 */
  reward_revive: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 아이템 획득 */
  reward_item_gain: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 무료 재화 획득 */
  reward_currency: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 보상 2배 획득 */
  reward_double: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 ap 충전 */
  reward_ap_charge: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 시간 단축 */
  reward_time_skip: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 펫 소환 */
  reward_pet: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" }
};
const DEFAULT_KAKAO_SHARE_TEMPLATE = "showoff01";
const DEFAULT_VIBRATION_HAPTIC = "ImpactMedium";
class KakaoAdapter {
  constructor(options) {
    __publicField(this, "id", "kakao");
    __publicField(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      "rank",
      "share",
      "vibration",
      "lifecycle",
      "userAccount",
      "log",
      "data"
    ]));
    __publicField(this, "_initialized", false);
    __publicField(this, "_hf", null);
    __publicField(this, "_options");
    // 유저 정보 캐시 — init() 직후 채워지고 refreshUserCache()로 갱신 가능
    __publicField(this, "_cachedKakaoPlayer", null);
    __publicField(this, "_cachedUser", null);
    // 리더보드 조회 결과 캐시 (rankingsCacheTTLMs > 0 일 때만 사용)
    __publicField(this, "_rankingsCache", /* @__PURE__ */ new Map());
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (!options || !options.h5Id) {
      throw new Error("KakaoAdapter: h5Id\uB294 \uD544\uC218\uC785\uB2C8\uB2E4");
    }
    this._options = {
      h5Id: options.h5Id,
      market: (_a = options.market) != null ? _a : "gameWeb",
      appVersion: (_b = options.appVersion) != null ? _b : "1.0.0",
      serverType: (_c = options.serverType) != null ? _c : "dev",
      // 기본 unit ID(전면/리워드)에 사용자 매핑을 덮어쓰기로 머지
      adUnits: __spreadValues(__spreadValues({}, DEFAULT_KAKAO_AD_UNITS), (_d = options.adUnits) != null ? _d : {}),
      interstitialPrefixes: (_e = options.interstitialPrefixes) != null ? _e : DEFAULT_INTERSTITIAL_PREFIXES,
      shareTemplateCode: (_f = options.shareTemplateCode) != null ? _f : DEFAULT_KAKAO_SHARE_TEMPLATE,
      disableDesktopOauthBridge: (_g = options.disableDesktopOauthBridge) != null ? _g : false,
      redirectQaApiToCube: (_h = options.redirectQaApiToCube) != null ? _h : false,
      rankingsCacheTTLMs: (_i = options.rankingsCacheTTLMs) != null ? _i : 0
    };
  }
  hasCapability(cap) {
    return this.capabilities.has(cap);
  }
  isInitialized() {
    return this._initialized;
  }
  /**
   * Kakao SDK 스크립트 로드 → `HF.Application.start` 호출 → 게임 리소스 로딩.
   *
   * 카카오톡 내 실행 시 자동 로그인 흐름에서 페이지 redirect 후 재진입할 수 있으므로,
   * 게임은 페이지 로드 콜백에서 매번 init을 호출하는 형태로 구현해야 합니다 (멱등성 보장).
   */
  init(loading, _options) {
    return __async(this, null, function* () {
      if (this._initialized) return { success: true };
      try {
        yield loadKakaoSdkScript();
        const hf = window.HF;
        if (!hf) {
          return { success: false, error: "Kakao SDK \uB85C\uB4DC \uD6C4\uC5D0\uB3C4 window.HF \uBBF8\uC874\uC7AC" };
        }
        this._hf = hf;
        if (!this._options.disableDesktopOauthBridge) {
          installKakaoDesktopOauthBridge();
        }
        if (this._options.redirectQaApiToCube) {
          installQaApiToCubeRedirect();
        }
        const startResult = yield kakaoStart(hf, {
          h5Id: this._options.h5Id,
          market: this._options.market,
          appVersion: this._options.appVersion,
          serverType: this._options.serverType,
          orientation: this._options.orientation,
          runtime: { search: typeof location !== "undefined" ? location.search : "" }
        });
        if (!startResult.success) {
          return startResult;
        }
        this._populateUserCache(hf);
        logger.info(
          `Kakao SDK \uCD08\uAE30\uD654 \uC644\uB8CC (h5Id=${this._options.h5Id}, serverType=${this._options.serverType}` + (this._cachedKakaoPlayer ? `, player=${this._cachedKakaoPlayer.playerNickname}` : ", \uBE44\uB85C\uADF8\uC778") + `)`
        );
        yield loading();
        this._initialized = true;
        try {
          const hide = typeof window !== "undefined" ? window.__hideKakaoSplash : null;
          if (typeof hide === "function") hide();
        } catch (e) {
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: `Kakao init \uC2E4\uD328: ${kakaoErrMsg(error)}` };
      }
    });
  }
  /** SDK의 currentPlayer로부터 캐시를 채움. 비로그인이면 null. */
  _populateUserCache(hf) {
    try {
      if (!kakaoIsLoggedIn(hf)) {
        this._cachedKakaoPlayer = null;
        this._cachedUser = null;
        return;
      }
      const player = kakaoCurrentPlayer(hf);
      this._cachedKakaoPlayer = player;
      this._cachedUser = player ? {
        dangerousUserId: player.playerId,
        username: player.playerNickname,
        profilePictureUrl: ""
      } : null;
    } catch (err) {
      logger.warn(`Kakao \uC720\uC800 \uCE90\uC2DC \uCC44\uC6B0\uAE30 \uC2E4\uD328: ${kakaoErrMsg(err)}`);
      this._cachedKakaoPlayer = null;
      this._cachedUser = null;
    }
  }
  /**
   * 캐시된 유저 정보를 강제로 SDK에서 다시 가져옵니다. 로그인 상태 변경이 의심될 때 호출.
   * (카카오는 로그아웃 시 페이지 새로고침이라 보통 init 1회 캐시로 충분)
   */
  refreshUserCache() {
    if (!this._hf) return;
    this._populateUserCache(this._hf);
  }
  /** init 시점에 채워진 캐시 유저 정보를 동기 반환. 비로그인/미초기화 시 null. */
  getCachedUser() {
    return this._cachedUser;
  }
  /** init 시점에 채워진 캐시 Kakao 풀데이터(playerId/idpProfile/firstLoginTime 등). */
  getCachedKakaoPlayer() {
    return this._cachedKakaoPlayer;
  }
  // ============================================
  // AdCapable
  //   Kakao 광고는 `createAd` 사전 호출 → `show` 패턴.
  //   ad.ts 모듈이 두 단계를 합쳐서 처리하고, isRewarded 결과로 onEarned 호출 여부를 결정.
  //   광고 키 prefix(interstitial/inter_/midgame)는 비보상형으로 매핑.
  // ============================================
  resolveUnitId(keyOrRawId) {
    var _a, _b;
    const entry = this._options.adUnits[keyOrRawId];
    if (entry === void 0) {
      return keyOrRawId;
    }
    if (typeof entry === "string") return entry;
    const hf = this._hf;
    if (hf) {
      try {
        const { isIOS, isAndroid } = hf.Web.detectPlatform();
        if (isIOS) return entry.ios;
        if (isAndroid) return entry.android;
      } catch (e) {
      }
    }
    return (_b = (_a = entry.android) != null ? _a : entry.ios) != null ? _b : keyOrRawId;
  }
  isInterstitialKey(keyOrRawId) {
    const lower = keyOrRawId.toLowerCase();
    return this._options.interstitialPrefixes.some((p) => lower.indexOf(p) === 0);
  }
  showAd(keyOrRawId, onEarnedOrCallbacks) {
    return __async(this, null, function* () {
      const hf = this._hf;
      if (!hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const callbacks = typeof onEarnedOrCallbacks === "function" ? { onEarned: onEarnedOrCallbacks } : onEarnedOrCallbacks != null ? onEarnedOrCallbacks : {};
      const isRewardKey = !this.isInterstitialKey(keyOrRawId);
      const unitId = this.resolveUnitId(keyOrRawId);
      try {
        return yield kakaoShowAd(hf, {
          unitId,
          isReward: isRewardKey,
          callbacks,
          key: keyOrRawId
        });
      } catch (err) {
        return { success: false, error: kakaoErrMsg(err), errorCode: "other" };
      }
    });
  }
  // ============================================
  // RankCapable (Kakao Leaderboard)
  //   submitScore: 단순 sync. submitScoreAsync 등은 옵셔널 확장.
  // ============================================
  submitScore(score) {
    if (!this._hf) return;
    this._invalidateRankingsCache();
    kakaoSubmitScore(this._hf, { score }).catch(() => {
    });
  }
  /** Kakao에는 별도 랭킹 UI 화면이 없습니다. 게임이 `getRankings`로 직접 UI 구성. */
  showRank() {
    logger.warn("Kakao \uC5B4\uB311\uD130\uB294 showRank\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. getRankings\uB85C \uC9C1\uC811 UI\uB97C \uAD6C\uC131\uD558\uC138\uC694.");
  }
  submitScoreAsync(options) {
    return __async(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const result = yield kakaoSubmitScore(this._hf, options);
      if (result.success) this._invalidateRankingsCache(options.leaderboardId);
      return result;
    });
  }
  accumulateScore(options) {
    return __async(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const result = yield kakaoAccumulateScore(this._hf, options);
      if (result.success) this._invalidateRankingsCache(options.leaderboardId);
      return result;
    });
  }
  setLeaderboardProperties(properties) {
    return __async(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      if (properties && "nickname" in properties) {
        return { success: false, error: "`nickname`\uC740 Kakao \uC608\uC57D\uC5B4\uB85C \uC0AC\uC6A9 \uBD88\uAC00\uD569\uB2C8\uB2E4" };
      }
      const result = yield kakaoSetProperties(this._hf, properties);
      if (result.success) this._invalidateRankingsCache();
      return result;
    });
  }
  getMyRanking(options) {
    return __async(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const opts = options != null ? options : {};
      const cacheKey = this._rankingsCacheKey("my", opts.leaderboardId, opts.seasonSeq);
      const cached = this._rankingsCacheGet(cacheKey);
      if (cached) return cached;
      const result = yield kakaoMyRanking(this._hf, opts);
      if (result.success) this._rankingsCacheSet(cacheKey, result);
      return result;
    });
  }
  getRankings(options) {
    return __async(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const cacheKey = this._rankingsCacheKey("list", options.leaderboardId, options.seasonSeq, options.beginRank, options.endRank);
      const cached = this._rankingsCacheGet(cacheKey);
      if (cached) return cached;
      const result = yield kakaoRankings(this._hf, options);
      if (result.success) this._rankingsCacheSet(cacheKey, result);
      return result;
    });
  }
  /**
   * 리더보드 조회 캐시를 수동 무효화.
   * @param leaderboardId 지정 시 해당 leaderboard 캐시만 (정확 매칭). 미지정 시 전체 비움.
   */
  clearRankingsCache(leaderboardId) {
    this._invalidateRankingsCache(leaderboardId);
  }
  // --- 내부 캐시 헬퍼 ---
  _rankingsCacheKey(kind, leaderboardId, seasonSeq, beginRank, endRank) {
    const lb = leaderboardId != null ? leaderboardId : "ranking";
    const s = seasonSeq != null ? seasonSeq : 0;
    if (kind === "my") return `${lb}|${s}|my`;
    return `${lb}|${s}|${beginRank != null ? beginRank : "*"}-${endRank != null ? endRank : "*"}`;
  }
  _rankingsCacheGet(key) {
    const ttl = this._options.rankingsCacheTTLMs;
    if (ttl <= 0) return null;
    const entry = this._rankingsCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this._rankingsCache.delete(key);
      return null;
    }
    return entry.value;
  }
  _rankingsCacheSet(key, value) {
    const ttl = this._options.rankingsCacheTTLMs;
    if (ttl <= 0) return;
    this._rankingsCache.set(key, { expiresAt: Date.now() + ttl, value });
  }
  _invalidateRankingsCache(leaderboardId) {
    if (this._rankingsCache.size === 0) return;
    if (!leaderboardId) {
      this._rankingsCache.clear();
      return;
    }
    const prefix = `${leaderboardId}|`;
    for (const k of this._rankingsCache.keys()) {
      if (k.startsWith(prefix)) this._rankingsCache.delete(k);
    }
  }
  // ============================================
  // ShareCapable
  //   shareText/shareAppLink는 Kakao에서 직접 매핑이 없어 안전 no-op로 두고,
  //   shareTemplate(templateCode + templateArgs)을 메인으로 사용.
  // ============================================
  shareText(_message) {
    logger.warn("Kakao \uC5B4\uB311\uD130\uB294 shareText\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. shareTemplate(templateCode)\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.");
  }
  shareAppLink(_appname, _uri) {
    logger.warn("Kakao \uC5B4\uB311\uD130\uB294 shareAppLink\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. shareTemplate(templateCode)\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.");
  }
  shareTemplate(options) {
    return __async(this, null, function* () {
      var _a;
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const templateCode = (_a = options == null ? void 0 : options.templateCode) != null ? _a : this._options.shareTemplateCode;
      return kakaoShareSend(this._hf, {
        templateCode,
        templateArgs: options == null ? void 0 : options.templateArgs
      });
    });
  }
  // ============================================
  // VibrationCapable (Kakao haptic)
  //   기본 vibration() 은 ImpactMedium 으로 매핑. 자세한 햅틱은 KakaoAdapter.haptic 직접 호출.
  // ============================================
  vibration() {
    if (!this._hf) return;
    kakaoHaptic(this._hf, { mode: DEFAULT_VIBRATION_HAPTIC });
  }
  /**
   * 카카오톡 햅틱 직접 제어 (어댑터 전용 메서드, capability 외).
   * Kakao 햅틱 7종 또는 Custom 패턴 사용.
   */
  haptic(options) {
    if (!this._hf) return;
    kakaoHaptic(this._hf, options);
  }
  /**
   * 카카오톡 앱에 설정된 현재 사운드 볼륨(0~1)을 가져옵니다.
   * 카카오톡 전용 게임 브라우저가 아닌 환경에서는 0이 반환될 수 있습니다.
   */
  getSoundVolume() {
    return __async(this, null, function* () {
      if (!this._hf) return 0;
      return kakaoSoundVolume(this._hf);
    });
  }
  // ============================================
  // LifecycleCapable
  //   카카오는 별도 gameStart/gameEnd가 없으므로 Log 모듈로 매핑:
  //     gameStart → StartPlay, gameEnd → CompletePlay (기본 result='done', play_time=0).
  //   더 정확한 로그는 게임이 직접 `sendLog`로 보내는 게 권장.
  // ============================================
  gameStart() {
    if (!this._hf) return;
    kakaoSendLog(this._hf, "StartPlay").catch(() => {
    });
  }
  gameEnd() {
    if (!this._hf) return;
    kakaoSendLog(this._hf, "CompletePlay", { result: "done", play_time: 0 }).catch(() => {
    });
  }
  // ============================================
  // UserAccountCapable
  //   Kakao는 자동 로그인이 기본이고 별도 토큰 발급 API가 없음.
  //   getUserToken / showAuthPrompt / linkPrompt / friends는 미지원 → 명확한 에러.
  //   getUser는 currentPlayer의 일부 필드를 PlatformUser로 매핑.
  // ============================================
  isUserAccountAvailable() {
    return !!this._hf && this._hf.Player.isLoggedIn();
  }
  getUser() {
    return __async(this, null, function* () {
      if (!this._cachedUser && this._hf) this._populateUserCache(this._hf);
      return this._cachedUser;
    });
  }
  /** Kakao currentPlayer 풀 데이터(idpCode/firstLoginTime 등). 캐시 우선. */
  getKakaoPlayer() {
    if (!this._cachedKakaoPlayer && this._hf) this._populateUserCache(this._hf);
    return this._cachedKakaoPlayer;
  }
  showAuthPrompt() {
    return __async(this, null, function* () {
      const user = yield this.getUser();
      if (user) return { success: true, user };
      return { success: false, error: "Kakao\uB294 \uBA85\uC2DC\uC801 \uB85C\uADF8\uC778 prompt\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 (\uCE74\uCE74\uC624\uD1A1 \uC9C4\uC785 \uC2DC \uC790\uB3D9 \uB85C\uADF8\uC778)." };
    });
  }
  getUserToken() {
    return __async(this, null, function* () {
      return { success: false, error: "Kakao SDK\uB294 \uD074\uB77C\uC774\uC5B8\uD2B8 \uCE21 \uC0AC\uC6A9\uC790 JWT\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 (playerId \uC0AC\uC6A9)." };
    });
  }
  showAccountLinkPrompt() {
    return __async(this, null, function* () {
      return { success: false, error: "Kakao\uB294 \uC678\uBD80 \uACC4\uC815 \uC5F0\uB3D9 prompt\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
    });
  }
  addAuthListener(_listener) {
  }
  removeAuthListener(_listener) {
  }
  getSystemInfo() {
    const hf = this._hf;
    if (!hf) return null;
    try {
      const p = hf.Web.detectPlatform();
      return {
        countryCode: "",
        locale: typeof navigator !== "undefined" ? navigator.language : "",
        device: { type: p.isIOS || p.isAndroid ? "mobile" : "desktop" },
        os: { name: p.isIOS ? "iOS" : p.isAndroid ? "Android" : "", version: "" },
        browser: { name: "", version: "" },
        applicationType: "web"
      };
    } catch (e) {
      return null;
    }
  }
  listFriends(_options) {
    return __async(this, null, function* () {
      return { success: false, error: "Kakao SDK\uB294 \uCE5C\uAD6C \uBAA9\uB85D API\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
    });
  }
  // ============================================
  // LogCapable
  // ============================================
  sendLog(type, body) {
    return __async(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      return kakaoSendLog(this._hf, type, body);
    });
  }
  // ============================================
  // DataStorageCapable
  //   Kakao SDK 자체는 데이터 저장 모듈 미제공.
  //   카카오 docs 권장(*"local storage에 ... playerId 활용"*)에 따라 localStorage 기반 구현.
  //   namespace: `kakao.{h5Id}.{playerId|anon}.{key}` — 같은 브라우저의 다른 카카오 게임/계정과 충돌 방지.
  //   playerId는 로그인 후 사용 가능 — 미로그인 상태에서는 'anon'로 폴백.
  // ============================================
  _storageKey(key) {
    let playerId = "anon";
    try {
      if (this._hf) {
        const p = kakaoCurrentPlayer(this._hf);
        if (p && p.playerId) playerId = p.playerId;
      }
    } catch (e) {
    }
    return `kakao.${this._options.h5Id}.${playerId}.${key}`;
  }
  _storageAvailable() {
    try {
      return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    } catch (e) {
      return false;
    }
  }
  getItem(key, defaultValue) {
    if (!this._storageAvailable()) return defaultValue;
    try {
      const raw = window.localStorage.getItem(this._storageKey(key));
      if (raw === null) return defaultValue;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return raw;
      }
    } catch (err) {
      logger.warn(`Kakao localStorage.getItem \uC2E4\uD328 (${key}): ${kakaoErrMsg(err)}`);
      return defaultValue;
    }
  }
  setItem(key, value, _submit) {
    if (!this._storageAvailable()) return;
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      window.localStorage.setItem(this._storageKey(key), serialized);
    } catch (err) {
      logger.warn(`Kakao localStorage.setItem \uC2E4\uD328 (${key}): ${kakaoErrMsg(err)}`);
    }
  }
  saveData() {
  }
  removeItem(key) {
    if (!this._storageAvailable()) return;
    try {
      window.localStorage.removeItem(this._storageKey(key));
    } catch (err) {
      logger.warn(`Kakao localStorage.removeItem \uC2E4\uD328 (${key}): ${kakaoErrMsg(err)}`);
    }
  }
  clear() {
    if (!this._storageAvailable()) return;
    try {
      const prefix = this._storageKey("").slice(0, -0);
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch (err) {
      logger.warn(`Kakao localStorage.clear \uC2E4\uD328: ${kakaoErrMsg(err)}`);
    }
  }
}

exports.CrazyGamesAdapter = CrazyGamesAdapter;
exports.DEFAULT_KAKAO_AD_UNITS = DEFAULT_KAKAO_AD_UNITS;
exports.DEFAULT_KAKAO_SHARE_TEMPLATE = DEFAULT_KAKAO_SHARE_TEMPLATE;
exports.Hi5Adapter = Hi5Adapter;
exports.Hi5SDK = Hi5SDK;
exports.KAKAO_SERVER_BRIDGES = KAKAO_SERVER_BRIDGES;
exports.KakaoAdapter = KakaoAdapter;
exports.StandaloneAdapter = StandaloneAdapter;
exports.getActiveAdapter = getActiveAdapter;
exports.hasActiveAdapter = hasActiveAdapter;
exports.installKakaoDesktopOauthBridge = installKakaoDesktopOauthBridge;
exports.isAdCapable = isAdCapable;
exports.isBannerCapable = isBannerCapable;
exports.isDataStorageCapable = isDataStorageCapable;
exports.isIAPCapable = isIAPCapable;
exports.isLeaderboardCapable = isLeaderboardCapable;
exports.isLifecycleCapable = isLifecycleCapable;
exports.isLogCapable = isLogCapable;
exports.isRankCapable = isRankCapable;
exports.isSafeAreaCapable = isSafeAreaCapable;
exports.isShareCapable = isShareCapable;
exports.isUserAccountCapable = isUserAccountCapable;
exports.listAdapters = listAdapters;
exports.registerAdapter = registerAdapter;
exports.selectAdapter = selectAdapter;
exports.selectAdapterExcept = selectAdapterExcept;
exports.setActiveAdapter = setActiveAdapter;
exports.unsupported = unsupported;
