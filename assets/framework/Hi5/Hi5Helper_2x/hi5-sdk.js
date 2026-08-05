// ⚠ Vendored from @TinycellCorp/hi5-sdk@1.8.24  (source: dist/cjs/index.js)
// Cocos Creator 2.4.x 는 assets/ 에서 node_modules 를 런타임 resolve 못함 → SDK 번들을 여기 둔다.
// 직접 수정 금지. 갱신: npm install @TinycellCorp/hi5-sdk@<v> 후 dist/cjs/index.js 를 이 파일로 복사(헤더 재삽입).
// Exports: Hi5, async, detectPlatform, isStandalone, showKakaoToast, showKakaoToastPreset, KAKAO_TOAST_MESSAGES 등
'use strict';

var __defProp$5 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$3 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$3.call(b, prop))
      __defNormalProp$5(a, prop, b[prop]);
  if (__getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(b)) {
      if (__propIsEnum$3.call(b, prop))
        __defNormalProp$5(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
var __async$k = (__this, __arguments, generator) => {
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
    GAMEEVENT: "GAMEEVENT",
    // 게임 상황별 커스텀 이벤트 후킹 (event_type + data 를 호스트로 전달)
    // Hi5Point (HP) — 요청/응답 쌍. 응답은 동일 action 이름의 fromhi5action 으로 콜백에 도착.
    POINT_STATE: "POINT_STATE",
    // HP 잔액/한도 조회
    POINT_GRANT: "POINT_GRANT",
    // HP 발급
    POINT_HISTORY: "POINT_HISTORY",
    // HP 발급 이력 조회
    INVITE_CODE: "INVITE_CODE",
    // 초대 코드 발급/조회
    INVITE_REDEEM: "INVITE_REDEEM",
    // 초대 코드 사용
    INVITE_STATUS: "INVITE_STATUS",
    // 초대 상태 조회
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
  //   카카오/자동감지 환경(`window.__hi5_init` 노출 + 카카오 URL 규격)이면 신 SDK 자동감지 init 을
  //   호출하고 어댑터 init 성공 후 레거시 콜백을 합성(GAME_DATA shape)으로 1회 호출(fire-and-forget).
  //   그 외(비카카오 hi5-host)는 기존 postMessage 핸드셰이크 경로를 **그대로** 유지 = 라이브 무변경.
  Init_SDK(callback, localGameData) {
    this.Init_GameData(localGameData);
    this.callback = callback;
    if (this._shouldAutoInit()) {
      try {
        const initFn = window.__hi5_init;
        if (typeof initFn === "function") {
          initFn(() => __async$k(this, null, function* () {
          })).then((result) => {
            var _a;
            if (result && result.success === false) return;
            try {
              (_a = this.callback) == null ? void 0 : _a.call(this, this._synthInitArgs());
            } catch (e) {
            }
          }).catch(() => {
          });
          return;
        }
      } catch (e) {
      }
    }
    this.Init_OnMessage(callback);
  },
  /**
   * 자동감지 init 을 써야 하는 환경인지. `window.__hi5_init`(신 SDK 로드됨) + 카카오 URL 규격일 때만 true.
   * 비카카오 hi5-host 는 false → 기존 postMessage 경로. `code=` 단독 오탐 방지 위해 h5Id(/h5/{key}/) 까지 확인.
   */
  _shouldAutoInit() {
    try {
      if (typeof window === "undefined") return false;
      if (typeof window.__hi5_init !== "function") return false;
      const ua = navigator.userAgent || "";
      const host = location.hostname || "";
      const qs = location.search || "";
      const path = location.pathname || "";
      const isKakao = /KAKAOTALK/i.test(ua) || /game\.kakao\.com$/i.test(host) || /[?&](provider=kakao|kakaoH5Id=|h5Id=)/i.test(qs);
      if (!isKakao) return false;
      const hasH5Id = /\/h5\/[^/]+/i.test(path) || /[?&](h5Id|kakaoH5Id)=/i.test(qs);
      return hasH5Id;
    } catch (e) {
      return false;
    }
  },
  /** 어댑터 init 성공 후 레거시 콜백에 넘길 GAME_DATA shape 합성. 부수효과로 PlatFormData 도 채움
   *  (게임이 콜백 대신 getPlatform()/getOS()/getSafeArea() 를 직접 부르는 경우 대비). */
  _synthInitArgs() {
    var _a, _b;
    const a = typeof window !== "undefined" ? window.__hi5_active : null;
    let platform = "";
    let os = "";
    let safeArea;
    try {
      if (a && typeof a.getSystemInfo === "function") {
        const si = a.getSystemInfo();
        os = si && si.os && si.os.name ? String(si.os.name).toLowerCase() : "";
      }
      if (a && typeof a.id === "string") platform = a.id;
      if (a && typeof a.getSafeArea === "function") {
        const sa = a.getSafeArea();
        if (sa) safeArea = { top: (_a = sa.top) != null ? _a : 0, bottom: (_b = sa.bottom) != null ? _b : 0 };
      }
    } catch (e) {
    }
    this.PlatFormData = __spreadValues$3(__spreadProps$1(__spreadValues$3({}, this.PlatFormData), {
      platform,
      os
    }), safeArea ? { SafeArea: safeArea } : {});
    return {
      fromhi5action: this.MESSAGE.GAME_DATA,
      data: {
        game_data: this.GameData,
        user_data: this.UserData,
        platform_data: this.PlatFormData,
        current_time: this.current_time
      }
    };
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
  // ============================================
  // active 어댑터 위임 (facade 통합)
  //   글로벌 브릿지 `window.__hi5_active`(registry.setActiveAdapter 가 세팅)만 읽어 위임 분기.
  //   → Hi5.ts 는 import 0개(리프 노드) 유지 = 순환참조 회피.
  //   어댑터가 없거나/미초기화/capability 미보유/Hi5Adapter(자기 자신) 면 null → 레거시 경로 폴백.
  // ============================================
  /**
   * 위임 대상 active 어댑터 반환. 다음 모두 만족해야 위임:
   *   - `window.__hi5_active` 존재 + `isInitialized()===true`
   *   - `cap` capability 보유 + `method` 가 함수
   *   - **id !== 'hi5'**: Hi5Adapter 는 내부적으로 Hi5.ts 를 도로 호출 → 무한재귀 차단(필수)
   * 하나라도 불충족 시 null → 호출부는 레거시(인메모리/postMessage) 폴백.
   */
  _delegate(cap, method) {
    try {
      const a = typeof window !== "undefined" ? window.__hi5_active : null;
      if (!a) return null;
      if (typeof a.isInitialized === "function" && !a.isInitialized()) return null;
      if (a.id === "hi5") return null;
      if (typeof a.hasCapability === "function" && !a.hasCapability(cap)) return null;
      if (typeof a[method] !== "function") return null;
      return a;
    } catch (e) {
      return null;
    }
  },
  // localStorage
  getItem(key, defalut = void 0) {
    var _a;
    const a = this._delegate("data", "getItem");
    if (a) return a.getItem(key, defalut);
    return (_a = this.GameData[key]) != null ? _a : defalut;
  },
  setItem(key, value, submit = true) {
    const a = this._delegate("data", "setItem");
    if (a) {
      a.setItem(key, value, submit);
      return;
    }
    this.GameData[key] = value;
    if (submit) {
      this.PostMessage(this.MESSAGE.DATA_SET_ITEM, { key, value });
    }
  },
  SaveData() {
    const a = this._delegate("data", "saveData");
    if (a) {
      a.saveData();
      return;
    }
    this.PostMessage(this.MESSAGE.SAVE_DATA, this.GameData);
  },
  removeItem(key) {
    const a = this._delegate("data", "removeItem");
    if (a) {
      a.removeItem(key);
      return;
    }
    delete this.GameData[key];
    this.PostMessage(this.MESSAGE.DATA_SET_ITEM, { key, value: null });
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
  /**
   * 게임 상황별 커스텀 이벤트를 호스트로 전달한다 (이벤트 후킹).
   * 게임 곳곳에 상황별로 호출만 심어두면, 처리는 호스트/플랫폼 측에서 나중에 구현한다.
   * fire-and-forget — 응답을 기다리지 않는다.
   *
   * @param event_type 이벤트 식별자 (예: 'boss_kill', 'stage_clear')
   * @param data 이벤트 부가 데이터 (plain object 권장 — postMessage 직렬화)
   * @param log true면 콘솔에 이벤트 로그를 출력한다. 기본값 false(로그 안 남김).
   *
   * @example
   * Hi5.GameEvent('stage_clear', { stage: 3, score: 1200 });        // 로그 X
   * Hi5.GameEvent('stage_clear', { stage: 3, score: 1200 }, true);  // 로그 O
   */
  GameEvent(event_type, data, log = false) {
    if (log) console.log("[Hi5] GameEvent:", event_type, data);
    this.PostMessage(this.MESSAGE.GAMEEVENT, { event_type, data });
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
    const a = this._delegate("rank", "submitScore");
    if (a) {
      a.submitScore(score);
      return;
    }
    this.PostMessage(this.MESSAGE.SUBMIT_SCORE, { score });
  },
  showRank() {
    const a = this._delegate("rank", "showRank");
    if (a) {
      a.showRank();
      return;
    }
    this.PostMessage(this.MESSAGE.SHOW_RANK, {});
  },
  vibration() {
    const a = this._delegate("vibration", "vibration");
    if (a) {
      a.vibration();
      return;
    }
    this.PostMessage(this.MESSAGE.VIBRATION, {});
  },
  //'portrait' | 'landscape';
  setDeviceOrientation(type = "portrait") {
    this.PostMessage(this.MESSAGE.SET_Orientation, { type });
  },
  shareText(message = "") {
    const a = this._delegate("share", "shareText");
    if (a) {
      a.shareText(message);
      return;
    }
    this.PostMessage(this.MESSAGE.SHARE_TEXT, { message });
  },
  shareAppLink(appname = "", uri = "") {
    const a = this._delegate("share", "shareAppLink");
    if (a) {
      a.shareAppLink(appname, uri);
      return;
    }
    this.PostMessage(this.MESSAGE.SHARE_APP_LINK, { appname, uri });
  },
  inviteRewards(id) {
    this.PostMessage(this.MESSAGE.INVITE_FRIEND_REWARDS, { id });
  },
  // ============================================
  // Hi5Point (HP) — 포인트/초대 (hi5 플랫폼 전용)
  //   전부 fire-and-forget 전송. 결과는 Init_SDK 콜백으로 같은 이름의 fromhi5action 으로 도착한다.
  //   응답 shape: { fromhi5action: 'POINT_STATE', data: { status: 0|1, result?, error? } }
  //   Promise 로 결과를 받고 싶으면 async API(`getPointState`/`grantPoint` 등)를 사용한다.
  // ============================================
  /**
   * HP 잔액/한도 조회 요청. 게임 진입 시 1회 + pointGrant 성공 후 갱신 권장.
   *
   * @param source 게임 식별자 (=gameId)
   * @param code 프로모션 코드(선택). 전달하면 해당 활동의 남은 한도/예산이 응답에 포함된다.
   */
  pointState(source, code) {
    const data = { source };
    if (code) data.code = code;
    this.PostMessage(this.MESSAGE.POINT_STATE, data);
  },
  /**
   * HP 발급 요청 (핵심).
   *
   * `idemKey` 는 필수 — `{source}:{code}:{KST날짜YYYYMMDD}:{고유값}` 형식.
   * 동일 idemKey 로 재요청하면 응답이 `duplicate: true` 로 오며 추가 발급이 없다(안전한 재시도).
   *
   * @example
   * Hi5.pointGrant({ source: 'goldtoaster', code: 'V4HD...', amount: 3, idemKey: 'goldtoaster:prepare:20260727:tx001' });
   */
  pointGrant(options) {
    const data = {
      source: options.source,
      code: options.code,
      idemKey: options.idemKey
    };
    if (typeof options.amount === "number") data.amount = options.amount;
    this.PostMessage(this.MESSAGE.POINT_GRANT, data);
  },
  /**
   * HP 발급 이력 조회 요청.
   *
   * @param limit 최대 건수(선택, 플랫폼 기본 50)
   */
  pointHistory(source, limit) {
    const data = { source };
    if (typeof limit === "number") data.limit = limit;
    this.PostMessage(this.MESSAGE.POINT_HISTORY, data);
  },
  /** 나의 초대 코드 발급/조회 요청. */
  inviteCode(source) {
    this.PostMessage(this.MESSAGE.INVITE_CODE, { source });
  },
  /**
   * 초대 코드 사용 요청. 게임당 1회만 사용 가능.
   * 초대 보상 HP 는 게임에서 별도로 pointGrant(referral 코드)로 발급한다.
   *
   * @param code 상대방의 초대 코드
   */
  inviteRedeem(source, code) {
    this.PostMessage(this.MESSAGE.INVITE_REDEEM, { source, code });
  },
  /** 초대 상태(내 코드 / 수락 여부) 조회 요청. */
  inviteStatus(source) {
    this.PostMessage(this.MESSAGE.INVITE_STATUS, { source });
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
function isPointCapable(adapter) {
  return adapter.hasCapability("point") && typeof adapter.getPointState === "function";
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
  try {
    if (typeof window !== "undefined") {
      ;
      window.__hi5_active = adapter;
    }
  } catch (e) {
  }
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

var __defProp$4 = Object.defineProperty;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$4(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$4(a, prop, b[prop]);
    }
  return a;
};
var __publicField$3 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$j = (__this, __arguments, generator) => {
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
const POINT_TIMEOUT_MS = 1e4;
class Hi5Adapter {
  constructor(hi5) {
    __publicField$3(this, "id", "hi5");
    __publicField$3(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      "iap",
      "data",
      "rank",
      "share",
      "safeArea",
      "vibration",
      "lifecycle",
      "point"
    ]));
    __publicField$3(this, "_hi5");
    __publicField$3(this, "_initialized", false);
    __publicField$3(this, "_gameData", null);
    __publicField$3(this, "_lastPurchaseProductId", null);
    __publicField$3(this, "_listeners", /* @__PURE__ */ new Map());
    __publicField$3(this, "_pendingResolvers", /* @__PURE__ */ new Map());
    // ============================================
    // PointCapable (Hi5Point — HP)
    // ============================================
    /**
     * HP 요청의 기본 `source`(게임 식별자). `setPointSource()`로 설정.
     * 호출별 `options.source` > 이 값 > `platform_data.source`/`gameId` 순으로 사용된다.
     */
    __publicField$3(this, "_pointSource", null);
    /**
     * HP 요청 직렬화 큐.
     *
     * HP 프로토콜에는 요청-응답 매칭용 id가 없어(액션 이름만 존재) 같은 액션의 요청이 동시에
     * 떠 있으면 응답이 뒤바뀔 수 있다. 모든 HP 요청을 한 줄로 세워 그 가능성을 제거한다.
     */
    __publicField$3(this, "_pointQueue", Promise.resolve());
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
    return __async$j(this, null, function* () {
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
              const purchaseData = __spreadValues$2({
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
    return __async$j(this, null, function* () {
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
    return __async$j(this, null, function* () {
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
  /** HP 요청의 기본 `source`(게임 식별자 = gameId) 설정. */
  setPointSource(source) {
    this._pointSource = source || null;
  }
  _resolvePointSource(explicit) {
    var _a, _b;
    const fromPlatform = (_b = (_a = this._gameData) == null ? void 0 : _a.data) == null ? void 0 : _b.platform_data;
    return explicit || this._pointSource || (fromPlatform == null ? void 0 : fromPlatform.source) || (fromPlatform == null ? void 0 : fromPlatform.gameId) || "";
  }
  /** HP 요청 1건을 큐에 넣어 순차 실행. */
  _enqueuePoint(task) {
    const next = this._pointQueue.then(task, task);
    this._pointQueue = next.then(
      () => void 0,
      () => void 0
    );
    return next;
  }
  /**
   * HP 요청 공통 처리 — source 확인 → 응답 리스너 등록 → 전송 → `data.result` 반환.
   * 전송 계층(`status !== 0`) 실패와 타임아웃을 에러 문자열로 정규화한다.
   */
  _pointRequest(action, source, send) {
    return this._enqueuePoint(() => __async$j(this, null, function* () {
      var _a;
      if (!source) {
        const error = "HP \uC694\uCCAD\uC5D0 source(\uAC8C\uC784 \uC2DD\uBCC4\uC790)\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. setPointSource('gameId') \uB85C \uC124\uC815\uD558\uAC70\uB098 \uD638\uCD9C \uC2DC \uC804\uB2EC\uD558\uC138\uC694.";
        logger.error(error);
        return { ok: false, error };
      }
      try {
        const waiting = this._waitFor(
          action,
          (data) => data.data !== void 0,
          POINT_TIMEOUT_MS
        );
        logger.debug(`${action} \uC694\uCCAD (source: ${source})`);
        send(source);
        const response = yield waiting;
        const payload = (_a = response.data) != null ? _a : {};
        const status = payload.status;
        if (status !== 0) {
          const error = payload.error || `${action} \uC2E4\uD328 (status: ${status})`;
          logger.error(`${action} \uC2E4\uD328:`, error);
          return { ok: false, error: String(error) };
        }
        if (payload.result === void 0 || payload.result === null) {
          const error = `${action} \uC751\uB2F5\uC5D0 result\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.`;
          logger.error(error);
          return { ok: false, error };
        }
        logger.debug(`${action} \uC751\uB2F5:`, JSON.stringify(payload.result));
        return { ok: true, result: payload.result };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${action} \uC2E4\uD328:`, message);
        return { ok: false, error: message };
      }
    }));
  }
  getPointState(options) {
    return __async$j(this, null, function* () {
      const source = this._resolvePointSource(options == null ? void 0 : options.source);
      const response = yield this._pointRequest(
        "POINT_STATE",
        source,
        (src) => this._hi5.pointState(src, options == null ? void 0 : options.code)
      );
      if (!response.ok) return { success: false, error: response.error };
      const state = response.result;
      if (state.result !== void 0 && state.result !== 1) {
        return { success: false, error: state.error || "HP \uC0C1\uD0DC \uC870\uD68C \uC2E4\uD328" };
      }
      return { success: true, state };
    });
  }
  grantPoint(options) {
    return __async$j(this, null, function* () {
      var _a;
      if (!(options == null ? void 0 : options.code)) {
        return { success: false, error: "HP \uBC1C\uAE09\uC5D0\uB294 \uD504\uB85C\uBAA8\uC158 code\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." };
      }
      if (!(options == null ? void 0 : options.idemKey)) {
        return {
          success: false,
          error: "HP \uBC1C\uAE09\uC5D0\uB294 idemKey\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. makeIdemKey(source, code, \uACE0\uC720\uAC12)\uC73C\uB85C \uC0DD\uC131\uD558\uC138\uC694."
        };
      }
      const source = this._resolvePointSource(options.source);
      const response = yield this._pointRequest(
        "POINT_GRANT",
        source,
        (src) => this._hi5.pointGrant({
          source: src,
          code: options.code,
          amount: options.amount,
          idemKey: options.idemKey
        })
      );
      if (!response.ok) return { success: false, error: response.error };
      const grant = response.result;
      if (!grant.ok) {
        const errorCode = grant.error;
        logger.warn(`HP \uBC1C\uAE09 \uAC70\uBD80: ${errorCode}`);
        return __spreadValues$2({
          success: false,
          error: errorCode ? `HP \uBC1C\uAE09 \uC2E4\uD328 (${errorCode})` : "HP \uBC1C\uAE09 \uC2E4\uD328"
        }, errorCode ? { errorCode } : {});
      }
      logger.info(`HP \uBC1C\uAE09 \uC644\uB8CC: +${(_a = grant.granted) != null ? _a : 0} (duplicate: ${!!grant.duplicate})`);
      return { success: true, grant };
    });
  }
  getPointHistory(options) {
    return __async$j(this, null, function* () {
      const source = this._resolvePointSource(options == null ? void 0 : options.source);
      const response = yield this._pointRequest(
        "POINT_HISTORY",
        source,
        (src) => this._hi5.pointHistory(src, options == null ? void 0 : options.limit)
      );
      if (!response.ok) return { success: false, error: response.error };
      const result = response.result;
      if (result.result !== void 0 && result.result !== 1) {
        return { success: false, error: result.error || "HP \uC774\uB825 \uC870\uD68C \uC2E4\uD328" };
      }
      return { success: true, list: Array.isArray(result.list) ? result.list : [] };
    });
  }
  getInviteCode(options) {
    return __async$j(this, null, function* () {
      const source = this._resolvePointSource(options == null ? void 0 : options.source);
      const response = yield this._pointRequest(
        "INVITE_CODE",
        source,
        (src) => this._hi5.inviteCode(src)
      );
      if (!response.ok) return { success: false, error: response.error };
      const result = response.result;
      if (result.result !== 1 || !result.code) {
        return { success: false, error: result.error || "\uCD08\uB300 \uCF54\uB4DC \uC870\uD68C \uC2E4\uD328" };
      }
      return { success: true, code: String(result.code) };
    });
  }
  redeemInviteCode(options) {
    return __async$j(this, null, function* () {
      if (!(options == null ? void 0 : options.code)) {
        return { success: false, error: "\uC0AC\uC6A9\uD560 \uCD08\uB300 \uCF54\uB4DC\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." };
      }
      const source = this._resolvePointSource(options.source);
      const response = yield this._pointRequest(
        "INVITE_REDEEM",
        source,
        (src) => this._hi5.inviteRedeem(src, options.code)
      );
      if (!response.ok) return { success: false, error: response.error };
      const result = response.result;
      if (result.result !== 1) {
        const errorCode = result.error;
        logger.warn(`\uCD08\uB300 \uCF54\uB4DC \uC0AC\uC6A9 \uC2E4\uD328: ${errorCode}`);
        return __spreadValues$2({
          success: false,
          error: errorCode ? `\uCD08\uB300 \uCF54\uB4DC \uC0AC\uC6A9 \uC2E4\uD328 (${errorCode})` : "\uCD08\uB300 \uCF54\uB4DC \uC0AC\uC6A9 \uC2E4\uD328"
        }, errorCode ? { errorCode: String(errorCode) } : {});
      }
      return { success: true, inviterId: Number(result.inviterId) };
    });
  }
  getInviteStatus(options) {
    return __async$j(this, null, function* () {
      const source = this._resolvePointSource(options == null ? void 0 : options.source);
      const response = yield this._pointRequest(
        "INVITE_STATUS",
        source,
        (src) => this._hi5.inviteStatus(src)
      );
      if (!response.ok) return { success: false, error: response.error };
      const status = response.result;
      if (status.result !== void 0 && status.result !== 1) {
        return { success: false, error: status.error || "\uCD08\uB300 \uC0C1\uD0DC \uC870\uD68C \uC2E4\uD328" };
      }
      return { success: true, status };
    });
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

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$i = (__this, __arguments, generator) => {
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
  return __async$i(this, null, function* () {
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
    __publicField$2(this, "id", "crazygames");
    __publicField$2(this, "capabilities", /* @__PURE__ */ new Set([
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
    __publicField$2(this, "defaultGrantOnAdblock", false);
    __publicField$2(this, "_initialized", false);
    __publicField$2(this, "_sdk", null);
    /** addAuthListener로 등록한 래퍼 콜백 매핑 (해제 시 동일 참조 필요) */
    __publicField$2(this, "_authListeners", /* @__PURE__ */ new Map());
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
    return __async$i(this, null, function* () {
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
var __publicField$1 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async$h = (__this, __arguments, generator) => {
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
    __publicField$1(this, "id", "standalone");
    __publicField$1(this, "capabilities", /* @__PURE__ */ new Set([
      "ad",
      // mock
      "data",
      "lifecycle"
    ]));
    __publicField$1(this, "_initialized", false);
  }
  hasCapability(cap) {
    return this.capabilities.has(cap);
  }
  isInitialized() {
    return this._initialized;
  }
  init(loading, _options) {
    return __async$h(this, null, function* () {
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
    return __async$h(this, null, function* () {
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

const SDK_SCRIPT_URL = "https://gameplay.game.kakao.com/sdk/h5/kakaogames-h5-sdk-1.2.1.js";
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

var __async$g = (__this, __arguments, generator) => {
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
  return __async$g(this, null, function* () {
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

let _installed$2 = false;
function installKakaoDesktopOauthBridge() {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  if (_installed$2) return true;
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
  _installed$2 = true;
  logger.info("[Kakao desktopBridge] intent:// \u2192 web OAuth \uC6B0\uD68C \uBE0C\uB9BF\uC9C0 \uD65C\uC131 (window.__kakaoIntentReroute \uD3F4\uBC31 \uC0AC\uC6A9 \uAC00\uB2A5)");
  return true;
}

const QA_HOST = "qa-openapi-zinny3.game.kakao.com";
const CUBE_HOST = "cube-openapi-zinny3.game.kakao.com";
let _installed$1 = false;
function _redirect(url) {
  if (typeof url !== "string") return url;
  if (url.indexOf(QA_HOST) < 0) return url;
  return url.replace(QA_HOST, CUBE_HOST);
}
function installQaApiToCubeRedirect() {
  var _a;
  if (_installed$1) return;
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
  _installed$1 = true;
  logger.info(`[Kakao hostRedirect] activated \u2014 ${QA_HOST} \u2192 ${CUBE_HOST}`);
}

var __async$f = (__this, __arguments, generator) => {
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
  return __async$f(this, null, function* () {
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

var __async$e = (__this, __arguments, generator) => {
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
  return __async$e(this, null, function* () {
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
  return __async$e(this, null, function* () {
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
  return __async$e(this, null, function* () {
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
  return __async$e(this, null, function* () {
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
  return __async$e(this, null, function* () {
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

var __async$d = (__this, __arguments, generator) => {
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
  return __async$d(this, null, function* () {
    var _a;
    try {
      const safeBody = body != null ? body : {};
      const params = { type, body: safeBody, logBody: safeBody };
      try {
        console.log("[Kakao.Log]", type, safeBody);
      } catch (e) {
      }
      if (typeof window !== "undefined") {
        try {
          (_a = window.__showKakaoLogOverlay) == null ? void 0 : _a.call(window, type, safeBody);
        } catch (e) {
        }
      }
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

var __async$c = (__this, __arguments, generator) => {
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
  return __async$c(this, null, function* () {
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
function kakaoSetBackSwipeEnabled(enabled) {
  return __async$c(this, null, function* () {
    if (typeof window === "undefined") return false;
    const bridge = window.kakaotalkGamePlay;
    if (!bridge || typeof bridge.setBackSwipeEnabled !== "function") return false;
    try {
      yield bridge.setBackSwipeEnabled(enabled);
      return true;
    } catch (err) {
      return false;
    }
  });
}

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
function kakaoShowAd(hf, options) {
  return __async$b(this, null, function* () {
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

let _installed = false;
const _audioContexts = /* @__PURE__ */ new Set();
let _ctxPatched = false;
function patchAudioContextTracking() {
  if (_ctxPatched) return;
  if (typeof window === "undefined") return;
  if (typeof window.WeakRef !== "function") return;
  _ctxPatched = true;
  for (const name of ["AudioContext", "webkitAudioContext"]) {
    const Orig = window[name];
    if (typeof Orig !== "function" || Orig.__hi5Tracked) continue;
    try {
      const Patched = new Proxy(Orig, {
        construct(target, args) {
          const ctx = Reflect.construct(target, args);
          try {
            _audioContexts.add(new WeakRef(ctx));
          } catch (e) {
          }
          return ctx;
        }
      });
      Orig.__hi5Tracked = true;
      window[name] = Patched;
    } catch (e) {
    }
  }
}
function closeTrackedAudioContexts() {
  if (typeof window.WeakRef !== "function") return;
  for (const ref of _audioContexts) {
    const ctx = ref.deref();
    if (!ctx) {
      _audioContexts.delete(ref);
      continue;
    }
    try {
      if (ctx.state !== "closed") {
        const p = ctx.close();
        if (p && typeof p.catch === "function") p.catch(() => {
        });
      }
    } catch (e) {
    }
  }
}
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iP(hone|ad|od)/i.test(ua)) return true;
  return /Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
}
function resetMediaSession() {
  try {
    const ms = navigator.mediaSession;
    if (!ms) return;
    try {
      ms.playbackState = "none";
    } catch (e) {
    }
    try {
      ms.metadata = null;
    } catch (e) {
    }
    const actions = [
      "play",
      "pause",
      "stop",
      "seekto",
      "seekforward",
      "seekbackward",
      "previoustrack",
      "nexttrack"
    ];
    for (const a of actions) {
      try {
        ms.setActionHandler(a, null);
      } catch (e) {
      }
    }
  } catch (e) {
  }
}
function teardownMediaElements(hard) {
  try {
    const list = document.querySelectorAll("audio, video");
    list.forEach((el) => {
      const m = el;
      try {
        m.pause();
      } catch (e) {
      }
      if (!hard) return;
      try {
        m.muted = true;
      } catch (e) {
      }
      try {
        m.srcObject = null;
      } catch (e) {
      }
      try {
        m.removeAttribute("src");
      } catch (e) {
      }
      try {
        m.load();
      } catch (e) {
      }
    });
  } catch (e) {
  }
}
function installKakaoIosAudioTeardown() {
  if (_installed) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!isIOS()) return;
  _installed = true;
  patchAudioContextTracking();
  window.addEventListener("pagehide", (e) => {
    const persisted = e.persisted === true;
    teardownMediaElements(!persisted);
    if (!persisted) closeTrackedAudioContexts();
    resetMediaSession();
  });
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
const DEFAULTS = {
  position: "top-left",
  maxItems: 12,
  fadeAfterMs: 8e3,
  fontSize: 11,
  maxWidth: "60vw"
};
const CONTAINER_ID = "kakao-log-overlay";
function isKakaoLogOverlayRequested() {
  if (typeof window === "undefined") return false;
  try {
    const qs = typeof location !== "undefined" && location.search || "";
    if (/[?&]logOverlay=true\b/i.test(qs)) return true;
  } catch (e) {
  }
  return false;
}
function formatTime(d) {
  const pad = (n) => n < 10 ? "0" + n : String(n);
  return "[" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + "]";
}
function positionCss(pos) {
  switch (pos) {
    case "top-right":
      return "top:8px;right:8px;";
    case "bottom-left":
      return "bottom:8px;left:8px;";
    case "bottom-right":
      return "bottom:8px;right:8px;";
    case "top-left":
    default:
      return "top:8px;left:8px;";
  }
}
function enableKakaoLogOverlay(options) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const cfg = __spreadValues$1(__spreadValues$1({}, DEFAULTS), options != null ? options : {});
  const items = [];
  function ensureContainer() {
    if (!document.body) return null;
    let div = document.getElementById(CONTAINER_ID);
    if (div && div.isConnected) return div;
    div = document.createElement("div");
    div.id = CONTAINER_ID;
    div.style.cssText = "position:fixed;" + positionCss(cfg.position) + "z-index:99998;pointer-events:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:" + cfg.fontSize + "px;line-height:1.3;color:#fff;max-width:" + cfg.maxWidth + ";word-break:break-all;-webkit-user-select:none;user-select:none;";
    document.body.appendChild(div);
    return div;
  }
  function push(type, body) {
    try {
      const c = ensureContainer();
      if (!c) return;
      const item = document.createElement("div");
      const hasBody = body && typeof body === "object" && Object.keys(body).length > 0;
      let bodyStr = "";
      if (hasBody) {
        try {
          bodyStr = " " + JSON.stringify(body);
        } catch (e) {
          bodyStr = "";
        }
      }
      item.textContent = formatTime(/* @__PURE__ */ new Date()) + " " + String(type) + bodyStr;
      item.style.cssText = "background:rgba(0,0,0,0.6);padding:2px 6px;border-radius:3px;margin-top:2px;transition:opacity 600ms ease-out;";
      c.appendChild(item);
      items.push(item);
      while (items.length > cfg.maxItems) {
        const old = items.shift();
        if (old && old.parentNode) old.parentNode.removeChild(old);
      }
      setTimeout(() => {
        if (item.isConnected) item.style.opacity = "0";
      }, cfg.fadeAfterMs);
      setTimeout(() => {
        const idx = items.indexOf(item);
        if (idx >= 0) items.splice(idx, 1);
        if (item.parentNode) item.parentNode.removeChild(item);
      }, cfg.fadeAfterMs + 700);
    } catch (e) {
    }
  }
  window.__showKakaoLogOverlay = push;
  window.__kakaoLogOverlayEnabled = true;
}
function maybeEnableKakaoLogOverlay(options) {
  if (!isKakaoLogOverlayRequested()) return;
  enableKakaoLogOverlay(options);
}
function disableKakaoLogOverlay() {
  if (typeof window === "undefined") return;
  try {
    delete window.__showKakaoLogOverlay;
  } catch (e) {
    window.__showKakaoLogOverlay = void 0;
  }
  window.__kakaoLogOverlayEnabled = false;
  if (typeof document !== "undefined") {
    const el = document.getElementById(CONTAINER_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
}

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
const DEFAULT_INTERSTITIAL_PREFIXES = ["interstitial", "inter_", "midgame"];
const DEFAULT_KAKAO_AD_UNITS = {
  // ───── 전면(midgame, 비보상형) ─────
  /** 전면 결과창 (기본 전면). `showAd('interstitial')` 의 기본 대상. */
  interstitial: { android: "DAN-ruHgApIXXPWWSOO0", ios: "DAN-aDL9z3VW5ahULFo7" },
  interstitial_result: { android: "DAN-ruHgApIXXPWWSOO0", ios: "DAN-aDL9z3VW5ahULFo7" },
  /** 전면 캐릭터 저장 */
  interstitial_save: { android: "DAN-g9qO4l4i9f1DSh32", ios: "DAN-ajd37C9znQY2yCBr" },
  /** 전면 ap 소모 */
  interstitial_ap: { android: "DAN-TI8eLrFPsRdBpZ0D", ios: "DAN-R6OJrIQ25wag6fDX" },
  // ───── 보상(rewarded) ─────
  /** 보상 아이템 사용 (기본 보상). `showAd('reward')` 의 기본 대상. */
  reward: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  reward_item: { android: "DAN-0Qhj8vQxudOr7LHg", ios: "DAN-Jxtxl9RjpOmnHOIf" },
  /** 보상 이어하기 */
  reward_continue: { android: "DAN-rtwNGDD9m5z7xev9", ios: "DAN-mvwu3d8WxbrQ70PJ" },
  /** 보상 출석보상 한 번 더 */
  reward_daily_bonus: { android: "DAN-L3N6JROyEHktr9sT", ios: "DAN-6Unw9EYdy0rOMsnn" },
  /** 보상 꾸미기 옷 획득 */
  reward_outfit: { android: "DAN-kdamDb0ktxb1sC3X", ios: "DAN-Mxh99NuRenYl9cya" },
  /** 보상 버프 사용 — ⚠️ xlsx 원본에서 iOS도 동일 unitId로 기재되어 있음 (오기 가능, 카카오게임즈에 확인 필요) */
  reward_buff: { android: "DAN-RPTW4vhLAZdRe76E", ios: "DAN-RPTW4vhLAZdRe76E" },
  /** 보상 부활하기 */
  reward_revive: { android: "DAN-LKi7AXJf7NKvxU9R", ios: "DAN-ELwzI3imH11eCHVi" },
  /** 보상 아이템 획득 */
  reward_item_gain: { android: "DAN-Nv6fdGoOtAQlfcH4", ios: "DAN-8tQjyIZZTveCllUB" },
  /** 보상 무료 재화 획득 */
  reward_currency: { android: "DAN-PTqL7CGSmcllRpnl", ios: "DAN-q46CD0eaZkn3cua0" },
  /** 보상 보상 2배 획득 */
  reward_double: { android: "DAN-Ocx252C5QBFyprow", ios: "DAN-7sIJJkcN54lDB0W2" },
  /** 보상 ap 충전 */
  reward_ap_charge: { android: "DAN-VFWlV4iwYawfiSWf", ios: "DAN-Tpo75PSGjtpxUhPS" },
  /** 보상 시간 단축 */
  reward_time_skip: { android: "DAN-W0YPnVcjwiyVNFW5", ios: "DAN-aiLrYApno819OVUk" },
  /** 보상 펫 소환 */
  reward_pet: { android: "DAN-aCV79jNyGsbcJnIi", ios: "DAN-DMbWnKWiQ6ALcsQD" }
};
const DEFAULT_KAKAO_SHARE_TEMPLATE = "showoff01";
const DEFAULT_VIBRATION_HAPTIC = "ImpactMedium";
const _KakaoAdapter = class _KakaoAdapter {
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
    // 플레이 시간 추적 — gameStart() 에서 set, gameEnd() / ExitPlay 에서 사용 후 reset
    __publicField(this, "_playStartTime", 0);
    // beforeunload ExitPlay 핸들러 1회 가드 — autoExitPlayLog 활성 시 init 성공 직후 1회 등록
    __publicField(this, "_exitHandlerRegistered", false);
    // 초기화 에러 다이얼로그 1회 가드 — 한번 뜨면 이후 init 재호출에서도 추가 표시 안 함.
    __publicField(this, "_initErrorShown", false);
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
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
      rankingsCacheTTLMs: (_i = options.rankingsCacheTTLMs) != null ? _i : 0,
      autoInitErrorDialog: (_j = options.autoInitErrorDialog) != null ? _j : true,
      autoLoadingLog: (_k = options.autoLoadingLog) != null ? _k : true,
      autoExitPlayLog: (_l = options.autoExitPlayLog) != null ? _l : true
    };
  }
  _tiaraLoadingKeys() {
    try {
      if (typeof sessionStorage === "undefined") return null;
      const keys = /* @__PURE__ */ new Set();
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.indexOf(_KakaoAdapter._TIARA_LOADING_KEY_PREFIX) === 0) keys.add(k);
      }
      return keys;
    } catch (e) {
      return null;
    }
  }
  /**
   * loading 발사 전 스냅샷과 비교해 complete_loading 을 보내야 하는지 판정 (v1.8.16: 폴링).
   *
   * v1.8.14~15 의 즉시판정은 Tiara dedup 키 기록이 Log.send 콜백보다 늦는 환경(트래커
   * 지연 로드 등)에서 "새 키 없음"으로 오판 → complete_loading 영구 억제 위험
   * (loading() 콜백이 즉시 resolve 되는 게임은 판정까지의 시간 여유가 없음 — 18Find 실측).
   * → 새 키 출현을 최대 ~3초 폴링 후 판정:
   *   - 새 키 출현 = 카카오가 조회 집계 → 발사
   *   - 타임아웃 + 기존 키 있었음 = 같은 세션 리로드(dedup hit) → 억제
   *   - 키가 아예 없음(스토리지 불가/트래커 부재) = 폴백 발사 (미발사보다 1회 발사가 안전)
   */
  _shouldSendCompleteLoading(before) {
    return __async$a(this, null, function* () {
      if (before === null) return true;
      for (let tries = 0; tries < 30; tries++) {
        const after = this._tiaraLoadingKeys();
        if (after === null) return true;
        for (const k of after) if (!before.has(k)) return true;
        yield new Promise((r) => setTimeout(r, 100));
      }
      return before.size === 0;
    });
  }
  /**
   * init 실패 시 자동 에러 다이얼로그 표시 (옵션 `autoInitErrorDialog` 활성 시).
   *
   * - `AsyncResult.error` 문자열에서 `code=N` 패턴을 추출해 타이틀에 부착.
   * - 한번 표시되면 **이후 모든 진행을 차단** — 반환 Promise 가 영원히 pending 상태로 유지되어
   *   호출자(보통 `init()`)도 hang. 사용자가 "다시 시도"(`location.reload()`) 또는
   *   "게임 종료"(`window.close()` → `about:blank`) 를 누르면 페이지 자체가 종료/재시작됨.
   * - 1회 가드(`_initErrorShown`): init 재호출 시 중복 다이얼로그가 쌓이는 것 방지.
   * - 스플래시 템플릿 미적용 환경/옵션 비활성 시: 즉시 resolve (게임이 평소대로 에러 결과 처리).
   */
  _maybeShowInitError(errorMessage) {
    if (!this._options.autoInitErrorDialog) return Promise.resolve();
    if (typeof window === "undefined") return Promise.resolve();
    const fn = window.__showKakaoInitErrorDialog;
    if (typeof fn !== "function") return Promise.resolve();
    if (this._initErrorShown) {
      return new Promise(() => {
      });
    }
    this._initErrorShown = true;
    const m = /code=(-?\d+|unknown)/i.exec(errorMessage || "");
    const code = m && m[1] && m[1].toLowerCase() !== "unknown" ? Number(m[1]) : null;
    try {
      fn(code, null, null);
    } catch (e) {
    }
    return new Promise(() => {
    });
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
    return __async$a(this, null, function* () {
      if (this._initialized) return { success: true };
      try {
        maybeEnableKakaoLogOverlay();
        installKakaoIosAudioTeardown();
        yield loadKakaoSdkScript();
        const hf = window.HF;
        if (!hf) {
          const error = "Kakao SDK \uB85C\uB4DC \uD6C4\uC5D0\uB3C4 window.HF \uBBF8\uC874\uC7AC";
          yield this._maybeShowInitError(error);
          return { success: false, error };
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
          runtime: { search: typeof location !== "undefined" ? location.search : "" }
        });
        if (!startResult.success) {
          yield this._maybeShowInitError(startResult.error);
          return startResult;
        }
        this._populateUserCache(hf);
        logger.info(
          `Kakao SDK \uCD08\uAE30\uD654 \uC644\uB8CC (h5Id=${this._options.h5Id}, serverType=${this._options.serverType}` + (this._cachedKakaoPlayer ? `, player=${this._cachedKakaoPlayer.playerNickname}` : ", \uBE44\uB85C\uADF8\uC778") + `)`
        );
        const tiaraKeysBefore = this._options.autoLoadingLog ? this._tiaraLoadingKeys() : null;
        if (this._options.autoLoadingLog) {
          yield kakaoSendLog(hf, "loading").catch(() => {
          });
        }
        yield loading();
        if (this._options.autoLoadingLog && (yield this._shouldSendCompleteLoading(tiaraKeysBefore))) {
          yield kakaoSendLog(hf, "complete_loading").catch(() => {
          });
        }
        if (this._options.autoExitPlayLog) {
          this._registerExitPlayHandler();
        }
        this._initialized = true;
        try {
          if (typeof window !== "undefined") {
            window.__kakaoInitOk = true;
          }
          const hide = typeof window !== "undefined" ? window.__hideKakaoSplash : null;
          if (typeof hide === "function") hide();
        } catch (e) {
        }
        return { success: true };
      } catch (error) {
        const msg = `Kakao init \uC2E4\uD328: ${kakaoErrMsg(error)}`;
        yield this._maybeShowInitError(msg);
        return { success: false, error: msg };
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const result = yield kakaoSubmitScore(this._hf, options);
      if (result.success) this._invalidateRankingsCache(options.leaderboardId);
      return result;
    });
  }
  accumulateScore(options) {
    return __async$a(this, null, function* () {
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const result = yield kakaoAccumulateScore(this._hf, options);
      if (result.success) this._invalidateRankingsCache(options.leaderboardId);
      return result;
    });
  }
  setLeaderboardProperties(properties) {
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
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
   * 상위 백분율(top %) 계산 — 자랑하기(showoff) 등에서 "상위 N%" 표기용.
   *
   * `getMyRanking().rank`(내 순위) ÷ `getRankings().totalPlayerCount`(전체 유저수) × 100 을
   * 정수로 반올림하고 **1~100 으로 클램프**(상위 0%/100% 초과 방지)해서 반환합니다.
   *
   * - 미초기화 / 미로그인 / 내 랭킹 없음 / 전체 인원 0 → `null` (계산 불가).
   * - 내부적으로 `getMyRanking` + `getRankings({ beginRank:1, endRank:1 })` 를 호출하므로
   *   `rankingsCacheTTLMs` 설정 시 캐시가 적용됩니다.
   *
   * @example
   * const pct = await adapter.getTopPercent()   // 예: 3  (상위 3%)
   */
  getTopPercent(options) {
    return __async$a(this, null, function* () {
      if (!this._hf) return null;
      const opts = options != null ? options : {};
      const my = yield this.getMyRanking(opts);
      if (!my.success || !my.ranking) return null;
      const rank = my.ranking.rank;
      if (!(rank > 0)) return null;
      const rk = yield this.getRankings(__spreadProps(__spreadValues({}, opts), { beginRank: 1, endRank: 1 }));
      if (!rk.success) return null;
      const total = rk.page.totalPlayerCount;
      if (!(total > 0)) return null;
      let pct = Math.round(rank / total * 100);
      if (pct < 1) pct = 1;
      else if (pct > 100) pct = 100;
      return pct;
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
    return __async$a(this, null, function* () {
      var _a, _b;
      if (!this._hf) return { success: false, error: "Kakao SDK \uBBF8\uCD08\uAE30\uD654" };
      const templateCode = (_a = options == null ? void 0 : options.templateCode) != null ? _a : this._options.shareTemplateCode;
      const wantTopPercent = (_b = options == null ? void 0 : options.withTopPercent) != null ? _b : templateCode === this._options.shareTemplateCode;
      let templateArgs = options == null ? void 0 : options.templateArgs;
      if (wantTopPercent && (templateArgs == null ? void 0 : templateArgs.topPercent) === void 0) {
        const pct = yield this.getTopPercent({
          leaderboardId: options == null ? void 0 : options.leaderboardId,
          seasonSeq: options == null ? void 0 : options.seasonSeq
        });
        if (pct !== null) {
          templateArgs = __spreadProps(__spreadValues({}, templateArgs != null ? templateArgs : {}), { topPercent: pct });
        }
      }
      return kakaoShareSend(this._hf, { templateCode, templateArgs });
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
    return __async$a(this, null, function* () {
      if (!this._hf) return 0;
      return kakaoSoundVolume(this._hf);
    });
  }
  /**
   * iOS 뒤로가기 스와이프(엣지 스와이프) 제스처 활성/비활성 (어댑터 전용 메서드, capability 외).
   *
   * 카카오톡 앱 WebView 의 네이티브 브릿지(`window.kakaotalkGamePlay`)를 호출합니다 — `HF.*` JS SDK
   * 초기화와 무관하게 동작하므로 `init()` 전에도 호출 가능. 게임 플레이 진입 시 `false` 로 호출해
   * 실수로 뒤로가기되어 웹뷰가 종료되는 것을 막고, 게임 종료/메뉴 복귀 시 `true` 로 되돌립니다.
   *
   * 브릿지가 없는 환경(외부 브라우저 / 데스크탑 / 브릿지 미주입 Android)에서는 no-op 으로 `false` 반환.
   *
   * @example
   * await adapter.setBackSwipeEnabled(false)  // 게임 진입 — 스와이프 차단
   * await adapter.setBackSwipeEnabled(true)   // 게임 종료 — 스와이프 복원
   *
   * @returns 네이티브 호출 성공 `true`, 브릿지 미존재/예외 시 `false`.
   */
  setBackSwipeEnabled(enabled) {
    return __async$a(this, null, function* () {
      return kakaoSetBackSwipeEnabled(enabled);
    });
  }
  // ============================================
  // LifecycleCapable
  //   카카오는 별도 gameStart/gameEnd가 없으므로 Log 모듈로 매핑:
  //     gameStart → StartPlay (+ play_time 추적 시작)
  //     gameEnd   → CompletePlay (자동 ms play_time 계산, result/score/stage 명시 가능)
  //   `gameStart()` ~ `gameEnd()` 사이 페이지 closeㅡ가 발생하면
  //   `autoExitPlayLog` 옵션으로 자동 등록된 `beforeunload` 핸들러가 ExitPlay 발사.
  // ============================================
  /**
   * 게임 1판 시작. `sendLog('StartPlay')` 호출 + 내부 `_playStartTime` 캡쳐.
   *
   * @param body 선택 — StartPlay body (`round`/`stage`/`level`). 카카오 spec 전부 옵셔널.
   */
  gameStart(body) {
    if (!this._hf) return;
    this._playStartTime = Date.now();
    kakaoSendLog(this._hf, "start_play", body).catch(() => {
    });
  }
  /**
   * 게임 1판 정상 종료. `sendLog('CompletePlay', { result, play_time, ... })` 자동 전송.
   *
   * `play_time` 은 `gameStart()` 호출 시점부터 지금까지의 ms 를 자동 계산 — 게임이 직접 전달할 필요 없음.
   * `gameStart()` 호출 없이 `gameEnd()` 만 호출하면 `play_time: 0`.
   *
   * @param body 선택 — `result`(기본 `'done'`), `score`, `stage`. 명시 안 하면 result='done' 만 전송.
   */
  gameEnd(body) {
    var _a;
    if (!this._hf) return;
    const playTime = this._playStartTime > 0 ? Date.now() - this._playStartTime : 0;
    this._playStartTime = 0;
    const payload = __spreadValues(__spreadValues({
      result: (_a = body == null ? void 0 : body.result) != null ? _a : "done",
      play_time: playTime
    }, (body == null ? void 0 : body.score) !== void 0 ? { score: body.score } : {}), (body == null ? void 0 : body.stage) !== void 0 ? { stage: body.stage } : {});
    kakaoSendLog(this._hf, "complete_play", payload).catch(() => {
    });
  }
  /**
   * 현재 진행 중인 플레이의 경과 시간 (ms). `gameStart()` 호출 전이거나 `gameEnd()` 호출 후는 0.
   * 게임이 share 템플릿/UI 표시용으로 시간을 가져갈 때 사용.
   */
  getPlayTime() {
    return this._playStartTime > 0 ? Date.now() - this._playStartTime : 0;
  }
  /**
   * `beforeunload` 이벤트에 `ExitPlay` 자동 등록. 1회 가드.
   *  - 플레이 중(`_playStartTime > 0`)일 때만 발사.
   *  - best-effort: 브라우저가 fetch 완료 못할 수 있음.
   *  - `autoExitPlayLog: false` 면 등록 안 함.
   */
  _registerExitPlayHandler() {
    if (this._exitHandlerRegistered) return;
    if (typeof window === "undefined") return;
    this._exitHandlerRegistered = true;
    window.addEventListener("beforeunload", () => {
      if (this._playStartTime <= 0) return;
      if (!this._hf) return;
      const playTime = Date.now() - this._playStartTime;
      kakaoSendLog(this._hf, "exit_play", {
        reason: "user_exit",
        play_time: playTime
      }).catch(() => {
      });
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
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
      const user = yield this.getUser();
      if (user) return { success: true, user };
      return { success: false, error: "Kakao\uB294 \uBA85\uC2DC\uC801 \uB85C\uADF8\uC778 prompt\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 (\uCE74\uCE74\uC624\uD1A1 \uC9C4\uC785 \uC2DC \uC790\uB3D9 \uB85C\uADF8\uC778)." };
    });
  }
  getUserToken() {
    return __async$a(this, null, function* () {
      return { success: false, error: "Kakao SDK\uB294 \uD074\uB77C\uC774\uC5B8\uD2B8 \uCE21 \uC0AC\uC6A9\uC790 JWT\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 (playerId \uC0AC\uC6A9)." };
    });
  }
  showAccountLinkPrompt() {
    return __async$a(this, null, function* () {
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
    return __async$a(this, null, function* () {
      return { success: false, error: "Kakao SDK\uB294 \uCE5C\uAD6C \uBAA9\uB85D API\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
    });
  }
  // ============================================
  // LogCapable
  // ============================================
  sendLog(type, body) {
    return __async$a(this, null, function* () {
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
};
// ── complete_loading = 카카오 Loading dedup 미러 (v1.8.14, v1.8.13 고정키 가드 대체) ──
//   Kakao H5 SDK 1.2.0 은 Loading(SDK_게임_조회) Tiara 집계에 sessionStorage dedup
//   (`tiara_loading_sent:{sessionId}`)을 두고 CompleteLoading 은 무가드 → 같은 세션
//   페이지 재로드 시 조회=1·로딩완료=2 비대칭(카카오 QA "로딩완료 2회 중복").
//   v1.8.13 의 h5Id 고정키 가드는 카톡 웹뷰가 탭을 재사용하면 **새 카카오 세션**에서도
//   complete_loading 을 영구 억제(조회는 새 sessionId 키라 다시 집계) → 반대 비대칭
//   "로딩완료 0회" 발생(18Find 에서 실측). → 카카오 자신의 dedup 플래그를 미러:
//   loading 발사 전후 `tiara_loading_sent:*` 키 스냅샷을 비교해 **카카오가 이번 send 에서
//   조회를 실제 집계했을 때(새 키 추가)만** complete_loading 발사. 새 세션=발사,
//   같은 세션 리로드=억제 → 어떤 시나리오에서도 조회:로딩완료 = 1:1.
//   sessionStorage 불가/카카오 dedup 부재(구버전 SDK) 환경은 기존대로 발사(안전 폴백).
//   ⚠️ 키 prefix 는 Kakao SDK 1.2.0 minified 에서 확인(`et="tiara_loading_sent:"`) —
//      카카오 SDK 버전업 시 재검증 필요.
__publicField(_KakaoAdapter, "_TIARA_LOADING_KEY_PREFIX", "tiara_loading_sent:");
let KakaoAdapter = _KakaoAdapter;
function detectKakaoH5Id() {
  var _a, _b;
  try {
    const m = (location.pathname || "").match(/\/h5\/([^/]+)/i);
    if (m && m[1]) return decodeURIComponent(m[1]);
    const qs = new URLSearchParams(location.search);
    return (_b = (_a = qs.get("h5Id")) != null ? _a : qs.get("kakaoH5Id")) != null ? _b : "";
  } catch (e) {
    return "";
  }
}
function detectKakaoServerType() {
  try {
    const h = location.hostname || "";
    if (/^qa-/i.test(h)) return "qa";
    if (/game\.kakao\.com$/i.test(h)) return "live";
  } catch (e) {
  }
  return "dev";
}
function isKakaoEnv() {
  if (typeof window === "undefined") return false;
  try {
    const ua = navigator.userAgent || "";
    const qs = location.search || "";
    const host = location.hostname || "";
    return /KAKAOTALK/i.test(ua) || /game\.kakao\.com$/i.test(host) || /[?&](provider=kakao|kakaoH5Id=|h5Id=|code=)/i.test(qs);
  } catch (e) {
    return false;
  }
}
registerAdapter({
  id: "kakao",
  priority: 40,
  // crazygames(50) 보다 먼저 — h5Id/UA 로 확실히 감지되는 더 구체적 플랫폼
  // h5Id 가 없으면(로컬 테스트 등) 카카오로 보지 않고 폴백(standalone). 인증이 어차피 불가.
  detect: () => {
    try {
      return isKakaoEnv() && !!detectKakaoH5Id();
    } catch (e) {
      return false;
    }
  },
  create: (opts) => {
    var _a, _b, _c;
    const k = (_a = opts == null ? void 0 : opts.kakao) != null ? _a : {};
    return new KakaoAdapter(__spreadValues(__spreadValues({
      h5Id: (_b = k.h5Id) != null ? _b : detectKakaoH5Id(),
      serverType: (_c = k.serverType) != null ? _c : detectKakaoServerType()
    }, k.market ? { market: k.market } : {}), k.appVersion ? { appVersion: k.appVersion } : {}));
  }
});

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
  return __async$9(this, null, function* () {
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
      const specialized = selectAdapterExcept(["standalone", "hi5", "kakao"], options);
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
try {
  if (typeof window !== "undefined") {
    ;
    window.__hi5_init = (loading, options) => init(loading, options);
  }
} catch (e) {
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
let _adLifecycleConfig = {};
function setAdLifecycleConfig(config) {
  _adLifecycleConfig = config != null ? config : {};
}
function getAdLifecycleConfig() {
  return _adLifecycleConfig;
}
function showAd(keyOrRawId, onEarnedOrOptions) {
  return __async$8(this, null, function* () {
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
  return __async$8(this, null, function* () {
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

function showKakaoDialog(options) {
  if (typeof window === "undefined") return Promise.resolve(-1);
  const fn = window.__showKakaoDialog;
  if (typeof fn !== "function") return Promise.resolve(-1);
  try {
    const r = fn(options);
    return r && typeof r.then === "function" ? r : Promise.resolve(-1);
  } catch (e) {
    return Promise.resolve(-1);
  }
}
function showKakaoInitErrorDialog(options) {
  var _a;
  if (typeof window === "undefined") return Promise.resolve(-1);
  const fn = window.__showKakaoInitErrorDialog;
  if (typeof fn !== "function") return Promise.resolve(-1);
  const opts = options != null ? options : {};
  try {
    const r = fn((_a = opts.code) != null ? _a : null, opts.onExit, opts.onRetry);
    return r && typeof r.then === "function" ? r : Promise.resolve(-1);
  } catch (e) {
    return Promise.resolve(-1);
  }
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
const UNSUPPORTED$4 = {
  success: false,
  error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uBC30\uB108 \uAD11\uACE0\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
};
function showBanner(containerId, size) {
  return __async$7(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isBannerCapable(adapter)) return UNSUPPORTED$4;
    return adapter.requestBanner(containerId, size);
  });
}
function showResponsiveBanner(containerId) {
  return __async$7(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isBannerCapable(adapter)) return UNSUPPORTED$4;
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
const NO_ACCOUNT = { success: false, error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uACC4\uC815 \uC5F0\uB3D9\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" };
function isAccountAvailable() {
  const adapter = getActiveAdapterOrNull();
  return !!adapter && isUserAccountCapable(adapter) && adapter.isUserAccountAvailable();
}
function getUser() {
  return __async$6(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return null;
    return adapter.getUser();
  });
}
function showAuthPrompt() {
  return __async$6(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return NO_ACCOUNT;
    return adapter.showAuthPrompt();
  });
}
function getUserToken() {
  return __async$6(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return NO_ACCOUNT;
    return adapter.getUserToken();
  });
}
function showAccountLinkPrompt() {
  return __async$6(this, null, function* () {
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
  return __async$6(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isUserAccountCapable(adapter)) return NO_ACCOUNT;
    return adapter.listFriends(options);
  });
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
const UNSUPPORTED$3 = { success: false, error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uB9AC\uB354\uBCF4\uB4DC\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" };
function submitLeaderboardScore(score, encryptionKey) {
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLeaderboardCapable(adapter)) return UNSUPPORTED$3;
    return adapter.submitLeaderboardScore(score, encryptionKey);
  });
}
const LEADERBOARD_ENDPOINT = "https://leaderboard.crazygames.com/leaderboard/scores";
const MAX_BATCH = 100;
function submitLeaderboardScoresServerSide(options) {
  return __async$5(this, null, function* () {
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
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLeaderboardCapable(adapter) || typeof adapter.getLeaderboardEntries !== "function") {
      return UNSUPPORTED$3;
    }
    return adapter.getLeaderboardEntries(options);
  });
}
function getPlayerLeaderboardEntry() {
  return __async$5(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLeaderboardCapable(adapter) || typeof adapter.getPlayerLeaderboardEntry !== "function") {
      return UNSUPPORTED$3;
    }
    return adapter.getPlayerLeaderboardEntry();
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
const UNSUPPORTED$2 = {
  success: false,
  error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uD574\uB2F9 \uB7AD\uD0B9 \uAE30\uB2A5\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
};
function submitScoreAsync(options) {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.submitScoreAsync !== "function") {
      return UNSUPPORTED$2;
    }
    return adapter.submitScoreAsync(options);
  });
}
function accumulateScore(options) {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.accumulateScore !== "function") {
      return UNSUPPORTED$2;
    }
    return adapter.accumulateScore(options);
  });
}
function setRankProperties(properties) {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.setLeaderboardProperties !== "function") {
      return UNSUPPORTED$2;
    }
    return adapter.setLeaderboardProperties(properties);
  });
}
function getMyRanking(options) {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.getMyRanking !== "function") {
      return UNSUPPORTED$2;
    }
    return adapter.getMyRanking(options);
  });
}
function getRankings(options) {
  return __async$4(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isRankCapable(adapter) || typeof adapter.getRankings !== "function") {
      return UNSUPPORTED$2;
    }
    return adapter.getRankings(options);
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
  return __async$3(this, null, function* () {
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
  return __async$3(this, null, function* () {
    return safeShareTemplate(args);
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
const UNSUPPORTED$1 = {
  success: false,
  error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 \uAC8C\uC784 \uB85C\uADF8 \uC804\uC1A1\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
};
function sendLog(type, body) {
  return __async$2(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isLogCapable(adapter)) return UNSUPPORTED$1;
    return adapter.sendLog(type, body);
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
  error: "\uD604\uC7AC \uD50C\uB7AB\uD3FC\uC740 Hi5Point(HP) \uAE30\uB2A5\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
};
let _defaultSource = null;
function setPointSource(source) {
  _defaultSource = source || null;
  const adapter = getActiveAdapterOrNull();
  if (adapter && isPointCapable(adapter) && typeof adapter.setPointSource === "function") {
    adapter.setPointSource(_defaultSource != null ? _defaultSource : "");
  }
}
function getPointSource() {
  return _defaultSource;
}
function pad2(value) {
  return value < 10 ? `0${value}` : String(value);
}
function getKstDayKey(timestampMs) {
  const base = typeof timestampMs === "number" ? timestampMs : Date.now();
  const kst = new Date(base + 9 * 60 * 60 * 1e3);
  return `${kst.getUTCFullYear()}${pad2(kst.getUTCMonth() + 1)}${pad2(kst.getUTCDate())}`;
}
function makeIdemKey(source, code, unique) {
  let uniquePart;
  if (unique === void 0 || unique === null || unique === "") {
    uniquePart = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
    logger.warn(
      "makeIdemKey: unique \uAC12\uC774 \uC5C6\uC5B4 \uC790\uB3D9 \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uB3C4 \uC2DC \uC911\uBCF5 \uBC1C\uAE09\uB420 \uC218 \uC788\uC73C\uB2C8 \uBCF4\uC0C1 1\uAC74\uC744 \uC2DD\uBCC4\uD558\uB294 \uAC12\uC744 \uB118\uAE30\uC138\uC694."
    );
  } else {
    uniquePart = String(unique);
  }
  return `${source}:${code}:${getKstDayKey()}:${uniquePart}`;
}
function getPointState(options) {
  return __async$1(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isPointCapable(adapter)) return UNSUPPORTED;
    return adapter.getPointState({ source: _resolveSource(options == null ? void 0 : options.source), code: options == null ? void 0 : options.code });
  });
}
function grantPoint(options) {
  return __async$1(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isPointCapable(adapter)) return UNSUPPORTED;
    return adapter.grantPoint({
      source: _resolveSource(options == null ? void 0 : options.source),
      code: options == null ? void 0 : options.code,
      amount: options == null ? void 0 : options.amount,
      idemKey: options == null ? void 0 : options.idemKey
    });
  });
}
function getPointHistory(options) {
  return __async$1(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isPointCapable(adapter)) return UNSUPPORTED;
    return adapter.getPointHistory({
      source: _resolveSource(options == null ? void 0 : options.source),
      limit: options == null ? void 0 : options.limit
    });
  });
}
function getInviteCode(options) {
  return __async$1(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isPointCapable(adapter)) return UNSUPPORTED;
    return adapter.getInviteCode({ source: _resolveSource(options == null ? void 0 : options.source) });
  });
}
function redeemInviteCode(options) {
  return __async$1(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isPointCapable(adapter)) return UNSUPPORTED;
    return adapter.redeemInviteCode({
      source: _resolveSource(options == null ? void 0 : options.source),
      code: options == null ? void 0 : options.code
    });
  });
}
function getInviteStatus(options) {
  return __async$1(this, null, function* () {
    const adapter = getActiveAdapterOrNull();
    if (!adapter || !isPointCapable(adapter)) return UNSUPPORTED;
    return adapter.getInviteStatus({ source: _resolveSource(options == null ? void 0 : options.source) });
  });
}
function _resolveSource(explicit) {
  return explicit || _defaultSource || void 0;
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
    disableKakaoLogOverlay: disableKakaoLogOverlay,
    enableKakaoLogOverlay: enableKakaoLogOverlay,
    gameEnd: gameEnd,
    gameStart: gameStart,
    getActiveAdapter: getActiveAdapter,
    getAdLifecycleConfig: getAdLifecycleConfig,
    getCachedShareUser: getCachedUser,
    getInviteCode: getInviteCode,
    getInviteStatus: getInviteStatus,
    getItem: getItem,
    getKstDayKey: getKstDayKey,
    getLeaderboardEntries: getLeaderboardEntries,
    getLogLevel: getLogLevel,
    getMyRanking: getMyRanking,
    getPlayerLeaderboardEntry: getPlayerLeaderboardEntry,
    getPointHistory: getPointHistory,
    getPointSource: getPointSource,
    getPointState: getPointState,
    getProduct: getProduct,
    getProducts: getProducts,
    getRankings: getRankings,
    getSafeArea: getSafeArea,
    getStorageSize: getStorageSize,
    getSystemInfo: getSystemInfo,
    getUser: getUser,
    getUserToken: getUserToken,
    grantPoint: grantPoint,
    happytime: happytime,
    hasAdblock: hasAdblock,
    hideKakaoSplash: hideKakaoSplash,
    init: init,
    isAccountAvailable: isAccountAvailable,
    isCrazyGamesDomain: isCrazyGamesDomain,
    isInitialized: isInitialized,
    isKakaoLogOverlayRequested: isKakaoLogOverlayRequested,
    isShareAvailable: isShareAvailable,
    listFriends: listFriends,
    makeIdemKey: makeIdemKey,
    maybeEnableKakaoLogOverlay: maybeEnableKakaoLogOverlay,
    onAuthChange: onAuthChange,
    purchase: purchase,
    redeemInviteCode: redeemInviteCode,
    removeItem: removeItem,
    safeShareTemplate: safeShareTemplate,
    saveData: saveData,
    sendLog: sendLog,
    setAdLifecycleConfig: setAdLifecycleConfig,
    setDataSizeConfig: setDataSizeConfig,
    setItem: setItem,
    setLogLevel: setLogLevel,
    setPointSource: setPointSource,
    setRankProperties: setRankProperties,
    shareGameResult: shareGameResult,
    showAccountLinkPrompt: showAccountLinkPrompt,
    showAd: showAd,
    showAuthPrompt: showAuthPrompt,
    showBanner: showBanner,
    showKakaoDialog: showKakaoDialog,
    showKakaoInitErrorDialog: showKakaoInitErrorDialog,
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
