// ⚠ Vendored from @TinycellCorp/hi5-sdk@1.6.18  (source: dist/cjs/index.js)
// Cocos Creator 2.4.x 는 assets/ 에서 node_modules 를 런타임 resolve 못함 → SDK 번들을 여기 둔다.
// 직접 수정 금지. 갱신: npm install @TinycellCorp/hi5-sdk@<v> 후 dist/cjs/index.js 를 이 파일로 복사(헤더 재삽입).
// Exports: Hi5, async, detectPlatform, isStandalone, showKakaoToast, showKakaoToastPreset, KAKAO_TOAST_MESSAGES 등
'use strict';

const _Hi5 = {
  //
  MESSAGE: {
    //game -> sdk
    INIT_SDK: "INIT_SDK",
    // 게임 로딩 전 초기화
    LOAD_END: "LOAD_END",
    // 게임 로딩 끝낫을때 호출 , 초기화
    GAME_START: "GAME_START",
    GAME_END: "GAME_END",
    SHOW_HELP: "SHOW_HELP",
    SAVE_DATA: "SAVE_DATA",
    SHOW_MAIN_MENU: "SHOW_MAIN_MENU",
    // GET_RANK : "GET_RANK",// 링킹 정보 요청.
    //
    DATA_SET_ITEM: "DATA_SET_ITEM",
    ITEM_LIST: "ITEM_LIST",
    BUY_ITEM: "BUY_ITEM",
    LOAD_AD: "LOAD_AD",
    SHOW_AD: "SHOW_AD",
    SUBMIT_SCORE: "SUBMIT_SCORE",
    SHOW_RANK: "SHOW_RANK",
    VIBRATION: "VIBRATION",
    SET_Orientation: "SET_Orientation",
    SHARE_TEXT: "SHARE_TEXT",
    SHARE_APP_LINK: "SHARE_APP_LINK",
    INVITE_FRIEND_REWARDS: "INVITE_FRIEND_REWARDS",
    //sdk -> game
    GAME_DATA: "GAME_DATA",
    // 게임 정보
    //
    START_GAME: "START_GAME",
    // 게임시작
    RESTART_GAME: "RESTART_GAME",
    // 게임 재시작
    SOUND: "SOUND",
    //
    RANK_DATA: "RANK_DATA",
    GAME_SETTINGS: "GAME_SETTINGS"
  },
  MainMenuType: {
    GAME_FIRST: "GAME_FIRST",
    GAME_END: "GAME_END"
  },
  GameData: {
    high_score: 0,
    // 최고 점수. [고정]
    score: 0
    // 현재 점수. [고정]
    // 기타 데이타
  },
  UserData: {},
  PlatFormData: {},
  current_time: 0,
  callback: null,
  lastShowAd: false,
  lastAdCallback: null,
  onlyLoad: false,
  lastProduct: void 0,
  lastAd: void 0,
  lastPurchaseCallback: void 0,
  // Init_SDK 으로 한번에 초기화 할수 없는 상황 .
  // 먼저 저장하는 데이터 구조 초기화 , 다음 onMessage 콜백 함수 초기화 .
  Init_GameData(localGameData) {
    window["Hi5"] = this;
    this.current_time = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
    for (let key in localGameData) {
      this.GameData[key] = localGameData[key];
    }
    setInterval(() => {
      this.current_time++;
    }, 1e3);
  },
  Init_OnMessage(callback) {
    this.callback = callback;
    window.addEventListener("message", (event) => {
      this._OnMessage(event);
    });
    this.PostMessage(this.MESSAGE.INIT_SDK, this.GameData);
  },
  // Hi5Game SDK 초기화
  Init_SDK(callback, localGameData) {
    this.Init_GameData(localGameData);
    this.Init_OnMessage(callback);
  },
  // on message 내부 처리.
  _OnMessage(event) {
    var _a, _b, _c, _d, _e;
    if (!event.data) return;
    if (!event.data.fromhi5action) return;
    if (event.data.fromhi5action == this.MESSAGE.GAME_DATA) {
      if ((_a = event.data.data) == null ? void 0 : _a.game_data) {
        this.GameData = event.data.data.game_data;
      }
      if ((_b = event.data.data) == null ? void 0 : _b.user_data) {
        this.UserData = event.data.data.user_data;
      }
      if ((_c = event.data.data) == null ? void 0 : _c.platform_data) {
        this.PlatFormData = event.data.data.platform_data;
      }
      if ((_d = event.data.data) == null ? void 0 : _d.current_time) {
        this.current_time = event.data.data.current_time;
      }
    }
    (_e = this.callback) == null ? void 0 : _e.call(this, event.data);
  },
  // localStorage
  getItem(key, defalut = void 0) {
    var _a;
    return (_a = this.GameData[key]) != null ? _a : defalut;
  },
  setItem(key, value, submit = true) {
    console.log({ key, value });
    this.GameData[key] = value;
    if (submit) {
      this.PostMessage(this.MESSAGE.DATA_SET_ITEM, { key, value });
    }
  },
  SaveData() {
    this.PostMessage(this.MESSAGE.SAVE_DATA, this.GameData);
  },
  // 서버 기준 초 단위 타임 리턴.
  getTime() {
    return this.current_time;
  },
  //Message_
  LoadEnd() {
    this.PostMessage(this.MESSAGE.LOAD_END, {});
  },
  GameStart() {
    this.PostMessage(this.MESSAGE.GAME_START, {});
  },
  GameEnd() {
    this.PostMessage(this.MESSAGE.GAME_END, {});
  },
  ShowHelp() {
    this.PostMessage(this.MESSAGE.SHOW_HELP, {});
  },
  GetRank() {
    this.PostMessage(this.MESSAGE.SHOW_RANK, {});
  },
  //
  getProductItemList() {
    this.PostMessage(this.MESSAGE.ITEM_LIST, {});
  },
  purchaseProduct(product, callback) {
    if (this.lastProduct) {
      return;
    }
    if (!product.hasOwnProperty("pid")) {
      alert("pid not found.");
      return;
    }
    this.lastProduct = product;
    this.lastPurchaseCallback = callback;
    this.PostMessage(this.MESSAGE.BUY_ITEM, { productId: this.lastProduct.pid });
  },
  purchaseEnd(data) {
    if (this.lastPurchaseCallback) {
      this.lastPurchaseCallback(data);
      this.lastPurchaseCallback = void 0;
    }
    this.lastProduct = void 0;
  },
  loadAd(ad) {
    if (!ad.hasOwnProperty("aid")) {
      alert("aid not found.");
      return;
    }
    this.lastShowAd = false;
    this.lastAd = ad;
    this.onlyLoad = true;
    this.PostMessage(this.MESSAGE.LOAD_AD, { adGroupId: this.lastAd.aid });
  },
  showAd(ad) {
    if (!ad.hasOwnProperty("aid")) {
      alert("aid not found.");
      return;
    }
    this.lastShowAd = false;
    this.lastAd = ad;
    this.onlyLoad = false;
    this.PostMessage(this.MESSAGE.SHOW_AD, { adGroupId: this.lastAd.aid });
  },
  // Callback 달린 방식으로 호출 .
  showAdCallback(ad, callback) {
    if (this.lastAd) {
      return;
    }
    if (!ad.hasOwnProperty("aid")) {
      alert("aid not found.");
      return;
    }
    this.lastShowAd = false;
    this.lastAd = ad;
    this.onlyLoad = false;
    this.lastAdCallback = callback;
    this.PostMessage(this.MESSAGE.LOAD_AD, { adGroupId: this.lastAd.aid });
  },
  ShowAdEnd(data) {
    if (this.lastAdCallback) {
      this.lastAdCallback(data);
      this.lastAdCallback = null;
    }
    this.lastShowAd = false;
    this.lastAd = void 0;
  },
  submitScore(score) {
    this.PostMessage(this.MESSAGE.SUBMIT_SCORE, { score });
  },
  showRank() {
    this.PostMessage(this.MESSAGE.SHOW_RANK, {});
  },
  vibration() {
    this.PostMessage(this.MESSAGE.VIBRATION, {});
  },
  //'portrait' | 'landscape';
  setDeviceOrientation(type = "portrait") {
    this.PostMessage(this.MESSAGE.SET_Orientation, { type });
  },
  shareText(message = "") {
    this.PostMessage(this.MESSAGE.SHARE_TEXT, { message });
  },
  shareAppLink(appname = "", uri = "") {
    this.PostMessage(this.MESSAGE.SHARE_APP_LINK, { appname, uri });
  },
  inviteRewards(id) {
    this.PostMessage(this.MESSAGE.INVITE_FRIEND_REWARDS, { id });
  },
  getPlatform() {
    var _a, _b;
    return (_b = (_a = this.PlatFormData) == null ? void 0 : _a.platform) != null ? _b : "";
  },
  getOS() {
    var _a, _b;
    return (_b = (_a = this.PlatFormData) == null ? void 0 : _a.os) != null ? _b : "";
  },
  getDeviceid() {
    var _a, _b;
    return (_b = (_a = this.PlatFormData) == null ? void 0 : _a.deviceid) != null ? _b : "";
  },
  isSupportVibration() {
    var _a, _b;
    return (_b = (_a = this.PlatFormData) == null ? void 0 : _a.vibration) != null ? _b : 0;
  },
  getSafeArea() {
    var _a, _b;
    return (_b = (_a = this.PlatFormData) == null ? void 0 : _a.SafeArea) != null ? _b : { "top": 0, "bottom": 0 };
  },
  //
  ShowMainMenu(mode) {
    setTimeout(() => {
      const _data = {
        mode
        // 게임 어느 시점에서 호출햇는지. 게임시작시 game_start, 게임 끝나고 game_end, 기타 other
      };
      this.PostMessage(this.MESSAGE.SHOW_MAIN_MENU, _data);
    }, 100);
  },
  //
  PostMessage(action, data) {
    if (window.self != window.top) {
      window.parent.postMessage({ tohi5action: action, data }, "*");
    } else {
      window.postMessage({ tohi5action: action, data }, "*");
    }
  },
  log(text) {
    console.log(JSON.stringify(text));
  }
  // Hi5Game SDK 통신 End
};

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
function getLogLevel() {
  return _currentLogLevel;
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
function getActiveAdapter$1() {
  if (!_activeAdapter) {
    throw new Error("[Platform Registry] \uD65C\uC131 \uC5B4\uB311\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. init()\uC744 \uBA3C\uC800 \uD638\uCD9C\uD558\uC138\uC694.");
  }
  return _activeAdapter;
}
function hasActiveAdapter() {
  return _activeAdapter !== null;
}

var __defProp$2 = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$b = (__this, __arguments, generator) => {
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
    __publicField$2(this, "id", "hi5");
    __publicField$2(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      "iap",
      "data",
      "rank",
      "share",
      "safeArea",
      "vibration",
      "lifecycle"
    ]));
    __publicField$2(this, "_hi5");
    __publicField$2(this, "_initialized", false);
    __publicField$2(this, "_gameData", null);
    __publicField$2(this, "_lastPurchaseProductId", null);
    __publicField$2(this, "_listeners", /* @__PURE__ */ new Map());
    __publicField$2(this, "_pendingResolvers", /* @__PURE__ */ new Map());
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
    return __async$b(this, null, function* () {
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
              const purchaseData = __spreadValues({
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
    return __async$b(this, null, function* () {
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
    return __async$b(this, null, function* () {
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

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$a = (__this, __arguments, generator) => {
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
const SDK_SCRIPT_URL = "https://sdk.crazygames.com/crazygames-sdk-v3.js";
const SDK_WRAPPER_ENGINE = "cocos";
const SDK_WRAPPER_VERSION = "2.0.0";
let _scriptLoadPromise = null;
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
  if (_scriptLoadPromise) {
    return _scriptLoadPromise;
  }
  _scriptLoadPromise = new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = SDK_SCRIPT_URL;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => {
      _scriptLoadPromise = null;
      reject(new Error("CrazyGames JS SDK \uB85C\uB4DC \uC2E4\uD328 (\uB124\uD2B8\uC6CC\uD06C \uD655\uC778 \uD544\uC694)"));
    };
    document.head.appendChild(tag);
  });
  return _scriptLoadPromise;
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
  return __async$a(this, null, function* () {
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
    __publicField$1(this, "id", "crazygames");
    __publicField$1(this, "capabilities", /* @__PURE__ */ new Set([
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
    __publicField$1(this, "defaultGrantOnAdblock", false);
    __publicField$1(this, "_initialized", false);
    __publicField$1(this, "_sdk", null);
    /** addAuthListener로 등록한 래퍼 콜백 매핑 (해제 시 동일 참조 필요) */
    __publicField$1(this, "_authListeners", /* @__PURE__ */ new Map());
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
const STORAGE_PREFIX = "hi5sdk:standalone:";
class StandaloneAdapter {
  constructor() {
    __publicField(this, "id", "standalone");
    __publicField(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      // mock
      "data",
      "lifecycle"
    ]));
    __publicField(this, "_initialized", false);
  }
  hasCapability(cap) {
    return this.capabilities.has(cap);
  }
  isInitialized() {
    return this._initialized;
  }
  init(loading, _options) {
    return __async$9(this, null, function* () {
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
    return __async$9(this, null, function* () {
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
function getActiveAdapter() {
  return getActiveAdapter$1();
}
function getActiveAdapterOrNull() {
  try {
    if (!hasActiveAdapter()) return null;
    const adapter = getActiveAdapter$1();
    return adapter.isInitialized() ? adapter : null;
  } catch (e) {
    return null;
  }
}
function isInitialized() {
  return hasActiveAdapter() && getActiveAdapter$1().isInitialized();
}
function init(arg1, arg2, arg3) {
  return __async$8(this, null, function* () {
    let adapter;
    let loading;
    let options;
    let fallback = null;
    if (typeof arg1 === "function" && typeof arg2 !== "function") {
      loading = arg1;
      options = arg2;
      try {
        adapter = selectAdapter(options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    } else if (_isAdapter(arg1)) {
      adapter = arg1;
      loading = arg2;
      options = arg3;
    } else {
      loading = arg2;
      options = arg3;
      const specialized = selectAdapterExcept(["standalone", "hi5"], options);
      if (specialized) {
        adapter = specialized;
        fallback = new Hi5Adapter(arg1);
        logger.info(`\uD2B9\uD654 \uD50C\uB7AB\uD3FC \uAC10\uC9C0 (${specialized.id}). \uC2E4\uD328 \uC2DC Hi5Adapter\uB85C \uD3F4\uBC31.`);
      } else {
        adapter = new Hi5Adapter(arg1);
      }
    }
    if (hasActiveAdapter()) {
      const current = getActiveAdapter$1();
      if (current.id === adapter.id && current.isInitialized()) {
        logger.warn(`\uC774\uBBF8 \uCD08\uAE30\uD654\uB428 (adapter=${current.id}). \uAC74\uB108\uB700.`);
        return { success: true };
      }
    }
    if (options == null ? void 0 : options.logLevel) {
      setLogLevel(options.logLevel);
    }
    setActiveAdapter(adapter);
    logger.info(`\uC5B4\uB311\uD130 \uC120\uD0DD\uB428: ${adapter.id}`);
    const result = yield adapter.init(loading, options);
    if (result.success) {
      return result;
    }
    setActiveAdapter(null);
    if (fallback) {
      logger.warn(`${adapter.id} \uC5B4\uB311\uD130 init \uC2E4\uD328: ${result.error}. ${fallback.id}\uB85C \uD3F4\uBC31.`);
      setActiveAdapter(fallback);
      const fallbackResult = yield fallback.init(loading, options);
      if (fallbackResult.success) {
        return fallbackResult;
      }
      setActiveAdapter(null);
      return {
        success: false,
        error: `1\uCC28 (${adapter.id}): ${result.error} / \uD3F4\uBC31 (${fallback.id}): ${fallbackResult.error}`
      };
    }
    return result;
  });
}
function _isAdapter(value) {
  return typeof value === "object" && value !== null && typeof value.id === "string" && typeof value.init === "function" && typeof value.hasCapability === "function";
}

const ZERO_SAFE_AREA = { top: 0, bottom: 0 };
const DEFAULT_LIMIT = 1048576;
const DEFAULT_WARN_RATIO = 0.8;
const DEFAULT_ERROR_RATIO = 0.95;
let _sizeLimit = DEFAULT_LIMIT;
let _warnRatio = DEFAULT_WARN_RATIO;
let _errorRatio = DEFAULT_ERROR_RATIO;
let _lastWarnLevel = "none";
const _sizes = /* @__PURE__ */ new Map();
function setDataSizeConfig(config) {
  if (config.limit !== void 0) _sizeLimit = config.limit;
  if (config.warnRatio !== void 0) _warnRatio = config.warnRatio;
  if (config.errorRatio !== void 0) _errorRatio = config.errorRatio;
  _lastWarnLevel = "none";
}
function getStorageSize() {
  let total = 0;
  const byKey = {};
  _sizes.forEach((size, key) => {
    total += size;
    byKey[key] = size;
  });
  return {
    total,
    limit: _sizeLimit,
    ratio: _sizeLimit > 0 ? total / _sizeLimit : 0,
    byKey
  };
}
function _measure(value) {
  try {
    const str = JSON.stringify(value);
    if (typeof TextEncoder !== "undefined") {
      return new TextEncoder().encode(str).length;
    }
    return str.length;
  } catch (e) {
    return 0;
  }
}
function _trackSize(key, value) {
  if (_sizeLimit <= 0) return;
  const size = _measure(value);
  _sizes.set(key, size);
  let total = 0;
  _sizes.forEach((s) => {
    total += s;
  });
  if (total >= _sizeLimit * _errorRatio) {
    if (_lastWarnLevel !== "error") {
      logger.error(
        `\uB370\uC774\uD130 \uC800\uC7A5 \uD55C\uB3C4 \uC784\uBC15/\uCD08\uACFC: ${total}/${_sizeLimit}B (${Math.round(total / _sizeLimit * 100)}%). CrazyGames 1MB \uCD08\uACFC \uC2DC \uD074\uB77C\uC6B0\uB4DC \uBC31\uC5C5 \uC548 \uB428.`
      );
      _lastWarnLevel = "error";
    }
  } else if (total >= _sizeLimit * _warnRatio) {
    if (_lastWarnLevel === "none") {
      logger.warn(
        `\uB370\uC774\uD130 \uC800\uC7A5 \uD55C\uB3C4 \uACBD\uACE0: ${total}/${_sizeLimit}B (${Math.round(total / _sizeLimit * 100)}%).`
      );
      _lastWarnLevel = "warn";
    }
  } else {
    _lastWarnLevel = "none";
  }
}
function getSafeArea() {
  const adapter = getActiveAdapter();
  if (!isSafeAreaCapable(adapter)) return ZERO_SAFE_AREA;
  return adapter.getSafeArea();
}
function getItem(key, defaultValue) {
  const adapter = getActiveAdapter();
  if (!isDataStorageCapable(adapter)) return defaultValue;
  return adapter.getItem(key, defaultValue);
}
function setItem(key, value, submit = true) {
  const adapter = getActiveAdapter();
  if (!isDataStorageCapable(adapter)) return;
  _trackSize(key, value);
  adapter.setItem(key, value, submit);
}
function saveData() {
  const adapter = getActiveAdapter();
  if (!isDataStorageCapable(adapter)) return;
  adapter.saveData();
}
function removeItem(key) {
  const adapter = getActiveAdapter();
  if (!isDataStorageCapable(adapter)) return;
  if (typeof adapter.removeItem === "function") {
    adapter.removeItem(key);
  }
  _sizes.delete(key);
}
function clearData() {
  const adapter = getActiveAdapter();
  if (!isDataStorageCapable(adapter)) return;
  if (typeof adapter.clear === "function") {
    adapter.clear();
  }
  _sizes.clear();
  _lastWarnLevel = "none";
}

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
let _adLifecycleConfig = {};
function setAdLifecycleConfig(config) {
  _adLifecycleConfig = config != null ? config : {};
}
function getAdLifecycleConfig() {
  return _adLifecycleConfig;
}
function showAd(keyOrRawId, onEarnedOrOptions) {
  return __async$7(this, null, function* () {
    var _a, _b;
    const adapter = getActiveAdapter();
    if (!isAdCapable(adapter)) {
      return unsupported(adapter.id, "ad");
    }
    const options = typeof onEarnedOrOptions === "function" ? { onEarned: onEarnedOrOptions } : onEarnedOrOptions != null ? onEarnedOrOptions : {};
    let grantOnAdblock;
    if (options.grantOnAdblock !== void 0) {
      grantOnAdblock = options.grantOnAdblock;
    } else if (_adLifecycleConfig.defaultGrantOnAdblock !== void 0) {
      grantOnAdblock = _adLifecycleConfig.defaultGrantOnAdblock;
    } else if (typeof adapter.defaultGrantOnAdblock === "boolean") {
      grantOnAdblock = adapter.defaultGrantOnAdblock;
    } else {
      grantOnAdblock = true;
    }
    if (grantOnAdblock) {
      const blocked = yield hasAdblock();
      if (blocked) {
        try {
          (_a = options.onEarned) == null ? void 0 : _a.call(options, { key: keyOrRawId });
        } catch (e) {
        }
        return { success: true, rewarded: true };
      }
    }
    let started = false;
    const wrappedOnStarted = () => {
      var _a2, _b2;
      started = true;
      try {
        (_a2 = _adLifecycleConfig.onAdStart) == null ? void 0 : _a2.call(_adLifecycleConfig);
      } catch (err) {
        logger.warn(`\uAD11\uACE0 onAdStart \uD578\uB4E4\uB7EC \uC5D0\uB7EC: ${err}`);
      }
      try {
        (_b2 = options.onStarted) == null ? void 0 : _b2.call(options);
      } catch (err) {
        logger.warn(`\uAD11\uACE0 onStarted \uCF5C\uBC31 \uC5D0\uB7EC: ${err}`);
      }
    };
    const adapterCallbacks = {
      onStarted: wrappedOnStarted,
      onEarned: options.onEarned
    };
    try {
      return yield adapter.showAd(keyOrRawId, adapterCallbacks);
    } finally {
      if (started) {
        try {
          (_b = _adLifecycleConfig.onAdEnd) == null ? void 0 : _b.call(_adLifecycleConfig);
        } catch (err) {
          logger.warn(`\uAD11\uACE0 onAdEnd \uD578\uB4E4\uB7EC \uC5D0\uB7EC: ${err}`);
        }
      }
    }
  });
}
function hasAdblock() {
  return __async$7(this, null, function* () {
    const adapter = getActiveAdapter();
    if (isAdCapable(adapter) && typeof adapter.hasAdblock === "function") {
      try {
        return yield adapter.hasAdblock();
      } catch (e) {
        return false;
      }
    }
    return false;
  });
}
function verifyAdKeys(expectedKeys) {
  const adapter = getActiveAdapter();
  if (!isAdCapable(adapter) || typeof adapter.listKnownAdKeys !== "function") {
    return { supported: false, missing: [], unused: [] };
  }
  const known = new Set(adapter.listKnownAdKeys());
  const expected = new Set(expectedKeys);
  const missing = [];
  const unused = [];
  expected.forEach((k) => {
    if (!known.has(k)) missing.push(k);
  });
  known.forEach((k) => {
    if (!expected.has(k)) unused.push(k);
  });
  return { supported: true, missing, unused };
}

function gameStart() {
  if (!isInitialized()) return;
  try {
    const adapter = getActiveAdapter();
    if (isLifecycleCapable(adapter)) {
      adapter.gameStart();
    }
  } catch (e) {
  }
}
function gameEnd() {
  if (!isInitialized()) return;
  try {
    const adapter = getActiveAdapter();
    if (isLifecycleCapable(adapter)) {
      adapter.gameEnd();
    }
  } catch (e) {
  }
}
function happytime() {
  if (!isInitialized()) return;
  try {
    const adapter = getActiveAdapter();
    if (isLifecycleCapable(adapter) && typeof adapter.happytime === "function") {
      adapter.happytime();
    }
  } catch (e) {
  }
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  return false;
}
function applyCrazyGamesHtml5Fixes(options) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {
    };
  }
  const cleanups = [];
  if ((options == null ? void 0 : options.preventScroll) !== false) {
    const handler = (e) => {
      e.preventDefault();
    };
    window.addEventListener("wheel", handler, { passive: false });
    cleanups.push(() => window.removeEventListener("wheel", handler));
  }
  if ((options == null ? void 0 : options.preventArrowKeys) !== false) {
    const scrollKeys = /* @__PURE__ */ new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]);
    const handler = (e) => {
      if (!scrollKeys.has(e.key)) return;
      if (isTypingTarget(document.activeElement)) return;
      e.preventDefault();
    };
    window.addEventListener("keydown", handler, { passive: false });
    cleanups.push(() => window.removeEventListener("keydown", handler));
  }
  if ((options == null ? void 0 : options.preventContextMenu) !== false) {
    const handler = (e) => {
      e.preventDefault();
    };
    window.addEventListener("contextmenu", handler);
    cleanups.push(() => window.removeEventListener("contextmenu", handler));
  }
  if ((options == null ? void 0 : options.preventTextSelection) !== false && document.documentElement) {
    const el = document.documentElement;
    const style = el.style;
    const prev = {
      userSelect: style.userSelect,
      webkitUserSelect: style.webkitUserSelect,
      webkitTouchCallout: style.webkitTouchCallout
    };
    style.userSelect = "none";
    style.webkitUserSelect = "none";
    style.webkitTouchCallout = "none";
    cleanups.push(() => {
      var _a, _b;
      style.userSelect = prev.userSelect;
      style.webkitUserSelect = (_a = prev.webkitUserSelect) != null ? _a : "";
      style.webkitTouchCallout = (_b = prev.webkitTouchCallout) != null ? _b : "";
    });
  }
  if (options == null ? void 0 : options.onVisibilityChange) {
    const cb = options.onVisibilityChange;
    const handler = () => {
      cb(document.hidden);
    };
    document.addEventListener("visibilitychange", handler);
    cleanups.push(() => document.removeEventListener("visibilitychange", handler));
  }
  return () => {
    for (const cleanup of cleanups) cleanup();
    cleanups.length = 0;
  };
}
function isCrazyGamesDomain() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const idx = parts.indexOf("crazygames");
  return idx !== -1 && idx >= parts.length - 3;
}

function hideKakaoSplash() {
  if (typeof window === "undefined") return;
  const fn = window.__hideKakaoSplash;
  if (typeof fn === "function") {
    try {
      fn();
    } catch (e) {
    }
  }
}

function showKakaoToast(text, options) {
  if (typeof window === "undefined") return;
  const fn = window.__showKakaoToast;
  if (typeof fn === "function") {
    try {
      fn(text, options);
    } catch (e) {
    }
  }
}
const KAKAO_TOAST_MESSAGES = {
  dataFee: "Wi-Fi\uAC00 \uC544\uB2CC \uD658\uACBD\uC5D0\uC11C\uB294 \uB370\uC774\uD130 \uC694\uAE08\uC774 \uBC1C\uC0DD\uD560 \uC218 \uC788\uC5B4\uC694",
  adLoadFail: "\uAD11\uACE0\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694",
  adSkipped: "\uAD11\uACE0\uB97C \uB05D\uAE4C\uC9C0 \uC2DC\uCCAD\uD574\uC57C \uBCF4\uC0C1\uC744 \uBC1B\uC744 \uC218 \uC788\uC5B4\uC694",
  adSuccess: "\uAD11\uACE0 \uC2DC\uCCAD\uC774 \uC644\uB8CC\uB418\uC5B4 \uBCF4\uC0C1\uC744 \uC9C0\uAE09\uD588\uC5B4\uC694"
};
function showKakaoToastPreset(preset, options) {
  const text = KAKAO_TOAST_MESSAGES[preset];
  if (!text) return;
  showKakaoToast(text, options);
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
const UNSUPPORTED$3 = {
  success: false,
  error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uBC30\uB108 \uAD11\uACE0\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
};
function showBanner(containerId, size) {
  return __async$6(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isBannerCapable(adapter)) return UNSUPPORTED$3;
    return adapter.requestBanner(containerId, size);
  });
}
function showResponsiveBanner(containerId) {
  return __async$6(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isBannerCapable(adapter)) return UNSUPPORTED$3;
    return adapter.requestResponsiveBanner(containerId);
  });
}
function clearBanner(containerId) {
  const adapter = getActiveAdapterOrNull();
  if (adapter && isBannerCapable(adapter)) adapter.clearBanner(containerId);
}
function clearAllBanners() {
  const adapter = getActiveAdapterOrNull();
  if (adapter && isBannerCapable(adapter)) adapter.clearAllBanners();
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
const NO_ACCOUNT = { success: false, error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uACC4\uC815 \uC5F0\uB3D9\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" };
function isAccountAvailable() {
  const adapter = getActiveAdapterOrNull();
  return !!adapter && isUserAccountCapable(adapter) && adapter.isUserAccountAvailable();
}
function getUser() {
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return null;
    return adapter.getUser();
  });
}
function showAuthPrompt() {
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return NO_ACCOUNT;
    return adapter.showAuthPrompt();
  });
}
function getUserToken() {
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return NO_ACCOUNT;
    return adapter.getUserToken();
  });
}
function showAccountLinkPrompt() {
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return NO_ACCOUNT;
    return adapter.showAccountLinkPrompt();
  });
}
function onAuthChange(listener) {
  const adapter = getActiveAdapterOrNull();
  if (!adapter || !isUserAccountCapable(adapter)) return () => {
  };
  adapter.addAuthListener(listener);
  return () => {
    const current = getActiveAdapterOrNull();
    if (current && isUserAccountCapable(current)) current.removeAuthListener(listener);
  };
}
function getSystemInfo() {
  const adapter = getActiveAdapterOrNull();
  if (!adapter || !isUserAccountCapable(adapter)) return null;
  return adapter.getSystemInfo();
}
function listFriends(options) {
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return NO_ACCOUNT;
    return adapter.listFriends(options);
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
const UNSUPPORTED$2 = { success: false, error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uB9AC\uB354\uBCF4\uB4DC\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" };
function submitLeaderboardScore(score, encryptionKey) {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLeaderboardCapable(adapter)) return UNSUPPORTED$2;
    return adapter.submitLeaderboardScore(score, encryptionKey);
  });
}
const LEADERBOARD_ENDPOINT = "https://leaderboard.crazygames.com/leaderboard/scores";
const MAX_BATCH = 100;
function submitLeaderboardScoresServerSide(options) {
  return __async$4(this, null, function* () {
    var _a;
    const { apiKey, scores } = options;
    if (!apiKey) return { success: false, error: "apiKey\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4" };
    if (!scores || scores.length === 0) return { success: false, error: "scores \uBC30\uC5F4\uC774 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4" };
    if (scores.length > MAX_BATCH) {
      return {
        success: false,
        error: `\uD55C \uBC88\uC5D0 \uCD5C\uB300 ${MAX_BATCH}\uAC1C\uAE4C\uC9C0 \uC81C\uCD9C \uAC00\uB2A5\uD569\uB2C8\uB2E4 (\uC694\uCCAD: ${scores.length}). \uC798\uAC8C \uB098\uB220 \uD638\uCD9C\uD558\uC138\uC694.`
      };
    }
    const fetchImpl = (_a = options.fetch) != null ? _a : typeof fetch === "function" ? fetch : void 0;
    if (!fetchImpl) {
      return {
        success: false,
        error: "fetch\uAC00 \uC5C6\uB294 \uD658\uACBD\uC785\uB2C8\uB2E4 (Node 18+ \uB610\uB294 fetch polyfill \uD544\uC694)"
      };
    }
    const body = JSON.stringify({
      scores: scores.map((s) => ({
        userId: s.userId,
        score: s.score,
        timestamp: s.timestamp instanceof Date ? s.timestamp.toISOString() : s.timestamp
      }))
    });
    let response;
    try {
      response = yield fetchImpl(LEADERBOARD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body
      });
    } catch (err) {
      return { success: false, error: `\uB124\uD2B8\uC6CC\uD06C \uC624\uB958: ${err instanceof Error ? err.message : String(err)}` };
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const retryAfterSeconds = retryAfter && !isNaN(Number(retryAfter)) ? Number(retryAfter) : void 0;
      return {
        success: false,
        error: "Rate limited (1000 req / 60s per API key)",
        status: 429,
        retryAfterSeconds
      };
    }
    if (response.status === 401) {
      return { success: false, error: "Unauthorized \u2014 API \uD0A4 \uB204\uB77D/\uC624\uD0C0/\uBBF8\uC778\uC2DD", status: 401 };
    }
    if (response.status === 400) {
      let detail = "";
      try {
        detail = ` (${JSON.stringify(yield response.json())})`;
      } catch (e) {
      }
      return { success: false, error: `Bad Request \u2014 \uD398\uC774\uB85C\uB4DC \uAC80\uC99D \uC2E4\uD328${detail}`, status: 400 };
    }
    if (!response.ok) {
      return { success: false, error: `Unexpected HTTP status ${response.status}`, status: response.status };
    }
    try {
      const data = yield response.json();
      return {
        success: true,
        total: typeof data.total === "number" ? data.total : scores.length,
        successCount: typeof data.successCount === "number" ? data.successCount : 0,
        failureCount: typeof data.failureCount === "number" ? data.failureCount : 0,
        errors: Array.isArray(data.errors) ? data.errors : []
      };
    } catch (err) {
      return { success: false, error: `\uC751\uB2F5 \uD30C\uC2F1 \uC2E4\uD328: ${err instanceof Error ? err.message : String(err)}` };
    }
  });
}
function getLeaderboardEntries(options) {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLeaderboardCapable(adapter) || typeof adapter.getLeaderboardEntries !== "function") {
      return UNSUPPORTED$2;
    }
    return adapter.getLeaderboardEntries(options);
  });
}
function getPlayerLeaderboardEntry() {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLeaderboardCapable(adapter) || typeof adapter.getPlayerLeaderboardEntry !== "function") {
      return UNSUPPORTED$2;
    }
    return adapter.getPlayerLeaderboardEntry();
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
const UNSUPPORTED$1 = {
  success: false,
  error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uD574\uB2F9 \uB7AD\uD0B9 \uAE30\uB2A5\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
};
function submitScoreAsync(options) {
  return __async$3(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.submitScoreAsync !== "function") {
      return UNSUPPORTED$1;
    }
    return adapter.submitScoreAsync(options);
  });
}
function accumulateScore(options) {
  return __async$3(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.accumulateScore !== "function") {
      return UNSUPPORTED$1;
    }
    return adapter.accumulateScore(options);
  });
}
function setRankProperties(properties) {
  return __async$3(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.setLeaderboardProperties !== "function") {
      return UNSUPPORTED$1;
    }
    return adapter.setLeaderboardProperties(properties);
  });
}
function getMyRanking(options) {
  return __async$3(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.getMyRanking !== "function") {
      return UNSUPPORTED$1;
    }
    return adapter.getMyRanking(options);
  });
}
function getRankings(options) {
  return __async$3(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.getRankings !== "function") {
      return UNSUPPORTED$1;
    }
    return adapter.getRankings(options);
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
function isShareAvailable() {
  try {
    if (!isInitialized()) return false;
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isShareCapable(adapter)) return false;
    return typeof adapter.shareTemplate === "function";
  } catch (e) {
    return false;
  }
}
function getCachedUser() {
  var _a;
  try {
    if (!isInitialized()) return null;
    const adapter = getActiveAdapterOrNull();
    if (!adapter || typeof adapter.getCachedUser !== "function") return null;
    return (_a = adapter.getCachedUser()) != null ? _a : null;
  } catch (e) {
    return null;
  }
}
function safeShareTemplate(templateArgsOrCode, maybeTemplateArgs) {
  return __async$2(this, null, function* () {
    let templateCode;
    let templateArgs;
    if (typeof templateArgsOrCode === "string") {
      templateCode = templateArgsOrCode;
      templateArgs = maybeTemplateArgs;
    } else {
      templateArgs = templateArgsOrCode;
    }
    if (!isInitialized()) {
      return { success: false, error: "Share: SDK \uBBF8\uCD08\uAE30\uD654" };
    }
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isShareCapable(adapter) || typeof adapter.shareTemplate !== "function") {
      return { success: false, error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uD15C\uD50C\uB9BF \uACF5\uC720\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" };
    }
    try {
      const payload = {};
      if (templateCode) payload.templateCode = templateCode;
      if (templateArgs) payload.templateArgs = templateArgs;
      return yield adapter.shareTemplate(payload);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.warn(`shareTemplate \uC608\uC678: ${error}`);
      return { success: false, error };
    }
  });
}
function shareGameResult(args) {
  return __async$2(this, null, function* () {
    return safeShareTemplate(args);
  });
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
const UNSUPPORTED = {
  success: false,
  error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uAC8C\uC784 \uB85C\uADF8 \uC804\uC1A1\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
};
function sendLog(type, body) {
  return __async$1(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLogCapable(adapter)) return UNSUPPORTED;
    return adapter.sendLog(type, body);
  });
}

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
function getProducts() {
  const adapter = getActiveAdapter();
  if (!isIAPCapable(adapter)) return {};
  return adapter.getProducts();
}
function getProduct(productKey) {
  const adapter = getActiveAdapter();
  if (!isIAPCapable(adapter)) {
    return { success: false, error: `IAP\uB294 '${adapter.id}' \uD50C\uB7AB\uD3FC\uC5D0\uC11C \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.` };
  }
  return adapter.getProduct(productKey);
}
function purchase(keyOrRawId) {
  return __async(this, null, function* () {
    const adapter = getActiveAdapter();
    if (!isIAPCapable(adapter)) {
      return unsupported(adapter.id, "iap");
    }
    return adapter.purchase(keyOrRawId);
  });
}

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    KAKAO_TOAST_MESSAGES: KAKAO_TOAST_MESSAGES,
    accumulateScore: accumulateScore,
    applyCrazyGamesHtml5Fixes: applyCrazyGamesHtml5Fixes,
    clearAllBanners: clearAllBanners,
    clearBanner: clearBanner,
    clearData: clearData,
    gameEnd: gameEnd,
    gameStart: gameStart,
    getActiveAdapter: getActiveAdapter,
    getAdLifecycleConfig: getAdLifecycleConfig,
    getCachedShareUser: getCachedUser,
    getItem: getItem,
    getLeaderboardEntries: getLeaderboardEntries,
    getLogLevel: getLogLevel,
    getMyRanking: getMyRanking,
    getPlayerLeaderboardEntry: getPlayerLeaderboardEntry,
    getProduct: getProduct,
    getProducts: getProducts,
    getRankings: getRankings,
    getSafeArea: getSafeArea,
    getStorageSize: getStorageSize,
    getSystemInfo: getSystemInfo,
    getUser: getUser,
    getUserToken: getUserToken,
    happytime: happytime,
    hasAdblock: hasAdblock,
    hideKakaoSplash: hideKakaoSplash,
    init: init,
    isAccountAvailable: isAccountAvailable,
    isCrazyGamesDomain: isCrazyGamesDomain,
    isInitialized: isInitialized,
    isShareAvailable: isShareAvailable,
    listFriends: listFriends,
    onAuthChange: onAuthChange,
    purchase: purchase,
    removeItem: removeItem,
    safeShareTemplate: safeShareTemplate,
    saveData: saveData,
    sendLog: sendLog,
    setAdLifecycleConfig: setAdLifecycleConfig,
    setDataSizeConfig: setDataSizeConfig,
    setItem: setItem,
    setLogLevel: setLogLevel,
    setRankProperties: setRankProperties,
    shareGameResult: shareGameResult,
    showAccountLinkPrompt: showAccountLinkPrompt,
    showAd: showAd,
    showAuthPrompt: showAuthPrompt,
    showBanner: showBanner,
    showKakaoToast: showKakaoToast,
    showKakaoToastPreset: showKakaoToastPreset,
    showResponsiveBanner: showResponsiveBanner,
    submitLeaderboardScore: submitLeaderboardScore,
    submitLeaderboardScoresServerSide: submitLeaderboardScoresServerSide,
    submitScoreAsync: submitScoreAsync,
    verifyAdKeys: verifyAdKeys
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

exports.Hi5 = _Hi5;
exports.async = index;
exports.detectPlatform = detectPlatform;
exports.isStandalone = isStandalone;
