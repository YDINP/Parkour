# Handoff - Parkour (49FriendRunner) 카카오 QA 통합 (코드 단계)
> 작성: 2026-05-30 | 엔진: Cocos Creator 2.4.13 | GameCode: niopwg1e | h5Id: 20756 | serverType: qa

114-shiba-bubble-shooter(CC2 파일럿) 레시피를 그대로 미러링한 **코드 전용** 통합.
빌드/업로드는 수행하지 않음(Phase B에서 수행).

## 결과 요약 (코드 단계)

| 단계 | 내용 | 결과 |
|---|---|---|
| 1 | git pre-kakao 스냅샷 | PASS (commit bd3be9b) |
| 2 | hi5-sdk 1.1.4 → **1.6.13** 설치 + Hi5Helper_2x 벤더링 | PASS |
| 3 | business/kakaoSdk.js (h5Id=20756, qa, ranking, isKakao) | PASS |
| 4 | 광고: 리워드 indicator on→off + 토스트 3종, AdManager 분기 배선 | PASS |
| 5 | 랭킹: 코드 렌더 KakaoRankView + Home.click_ranking 분기 | PASS |
| 6 | 주황 테두리 제거 (LoadingScene.onLoad) | PASS |
| 7 | i18n ad_*/rank_* 키 ko/en/cn 추가 | PASS |
| 8 | 통합 커밋 | PASS (commit e2bdeb7) |
| 9 | handoff 작성 | (이 문서) |

QA URL(빌드/업로드 후): https://qa-gameplay.game.kakao.com/h5/TS/QA/niopwg1e/

## 해소된 SDK 버전
- `@TinycellCorp/hi5-sdk`: `^1.1.4` → **`^1.6.13`** (`npm install @latest`, 글로벌 ~/.npmrc 의 GitHub registry 인증 정상)
- 벤더링 출처: `node_modules/@TinycellCorp/hi5-sdk/dist/cjs/{index.js, platform.js}` @ 1.6.13
- regenerator-runtime: 114-shiba 의 검증된 사본 재사용

## 기존 커스텀 Hi5 브릿지와 카카오 라우팅의 화해 (핵심)

### 기존 상태
- `framework/Hi5/Hi5.ts` 는 SDK 패키지가 아니라 **손수 작성한 postMessage 브릿지 객체**(`window['Hi5']`).
  hi5games 부모 iframe 과 `tohi5action`/`fromhi5action` 메시지로 통신(INIT_SDK/LOAD_AD/SHOW_AD/SHOW_RANK 등).
- `package.json` 의 `@TinycellCorp/hi5-sdk@^1.1.4` 의존성은 **코드 어디서도 import 되지 않아 사실상 미사용**(LOCAL 형태).
- 광고 중앙 진입: `framework/Hi5/AdManager.ts` `showRewardAd(adType, cb)` → `Hi5.showAdCallback(...)` → LoadingScene 의
  모듈레벨 `onHi5Message` 가 LOAD_AD/SHOW_AD 응답을 받아 `Hi5.ShowAdEnd` 로 콜백.
- 랭킹: `Home.click_ranking()` → `vm.show("UIRank")` → `UIRank.ts` 가 자체 서버 `/api/rank` 조회(카카오 무관).

### 화해 방식 — 기존 브릿지 보존 + isKakao() 분기 추가 (브릿지 제거 안 함)
- **커스텀 Hi5 브릿지는 그대로 유지**한다. hi5games/일반 웹 경로는 1바이트도 안 건드림.
  (브릿지가 카카오 외 플랫폼 데이터 저장/광고/랭킹을 담당하므로 제거 불가.)
- 카카오 전용 경로만 vendored SDK 로 신설하고, 진입점에서 `kakaoSdk.isKakao()` 로 분기:
  - **광고**: `AdManager.showRewardAd` 최상단에서 `isKakao()` 면 `showKakaoRewardAd()` 로 위임 후 `return`.
    비카카오는 기존 `Hi5.showAdCallback` 경로 그대로 진행. → AdManager 외 호출부(게임 UI) 무수정.
  - **랭킹**: `Home.click_ranking` 에서 `isKakao()` 면 `KakaoRankView.open()`, 아니면 기존 `vm.show("UIRank")`.
- `kakaoSdk` / `IndicatorManager` 는 require 지연 로드. `kakaoSdk.js` 는 top-level 에서 index/regenerator 만
  require(window.parent 미접근, 안전), **platform.js(KakaoAdapter)는 ensureInit() 내부에서만 lazy require**
  (platform.js line 71 `new _Hi5SDK()` 가 module-load 시 `window.parent` 접근 → 에디터/비-kakao 씬 깨짐 방지).

### CC2 벤더링 노트 (114 파일럿 준수)
- CC2.4.13 builder 는 `import '@TinycellCorp/hi5-sdk[/async]'` 는 번들하지만 **`/platform` 은 import 한 곳이 없으면 누락**.
  카카오는 platform 필수 → 벤더링이 가장 확실. (dist index 가 async 를 재export → `sdk.async.*` 사용 가능, async 별도 벤더 불필요)
- 각 .js 에 신규 `.meta`(importer:javascript, isPlugin:false, loadPluginInEditor:false) 발급, 폴더 .meta(folder) 발급.
- `_adapter.showAd(key, onEarned)` → `{success, rewarded}` 반환(platform.js KakaoAdapter line 2307, kakao 경로 line 1330-31 확인). 리워드는 `success && (rewarded || earned)` 일 때만 지급.

## 변경/신규 파일 목록

### 신규 (벤더링/배선)
- `assets/framework/Hi5/Hi5Helper_2x/hi5-sdk.js` (+ .meta) — vendored index @1.6.13 (async/detectPlatform export)
- `assets/framework/Hi5/Hi5Helper_2x/hi5-sdk-platform.js` (+ .meta) — vendored platform (KakaoAdapter/DEFAULT_KAKAO_AD_UNITS)
- `assets/framework/Hi5/Hi5Helper_2x/regenerator-runtime.js` (+ .meta) — function* 제너레이터 폴리필
- `assets/framework/Hi5/business/kakaoSdk.js` (+ .meta) — isKakao/ensureInit/getRankings/getMyRanking/submitScore/showAd
- `assets/framework/Hi5/control/indicatorManager.js` (+ .meta) — 코드 렌더 스피너(cc.Graphics 링 + 딤 오버레이, 프리팹 의존 0)
- `assets/framework/Hi5/KakaoRankView.js` (+ .meta) — 자족형 코드 렌더 리더보드(LocalizationManager 경유 i18n)
- 폴더 메타: `Hi5Helper_2x.meta`, `business.meta`, `control.meta`

### 수정
- `assets/framework/Hi5/AdManager.ts` — import(Toast/LocalizationManager/kakaoSdk/IndicatorManager) + adToast() +
  `showRewardAd` 카카오 분기 + `showKakaoRewardAd()`(indicator on→showAd('reward')→모든 종료경로 hide + 토스트 3종)
- `assets/Game/Script/game/Home.ts` — `click_ranking()` 에 `isKakao()→KakaoRankView.open()` 분기
- `assets/Game/Script/common/LoadingScene.ts` — `onLoad()` 최상단에 GameCanvas outline 제거 스니펫(`__cc_no_outline__`)
- `assets/resources/Localize/localization.json` — ko/en/cn 에 `ad_load_failed/ad_reward_aborted/ad_reward_earned` +
  `rank_title/rank_loading/rank_load_failed/rank_empty/rank_me` (8키 × 3언어 = 24 엔트리)
- `package.json` / `package-lock.json` — hi5-sdk ^1.6.13

### 광고 키 매핑 (참고)
- 카카오 경로는 SDK 내부 `DEFAULT_KAKAO_AD_UNITS` 의 문자열 키만 전달: 리워드=`"reward"`, 전면=`"interstitial"`.
  Parkour 의 `AdType`(reward_triple/reward_revive 등)은 비카카오(커스텀 브릿지) 경로에서만 사용. 카카오는 전부 'reward' 단일 unit.
- 전면 광고: Parkour 코드베이스에 카카오용 전면 진입점은 별도 배선 안 함(요구사항 = 리워드가 핵심). `kakaoSdk.showAd('interstitial')` 는 필요 시 호출 가능하도록 API 만 제공.

## Phase B 빌드 명령 (정확)

```
"/c/ProgramData/cocos/editors/Creator/2.4.13/CocosCreator.exe" --path "C:/Users/a/Documents/Projects/Parkour" --build "platform=web-mobile;debug=true;buildPath=C:/Users/a/Desktop/Build/49parkour-debug"
```

- QA = debug 빌드(스플래시 포함). 출력 루트: `C:/Users/a/Desktop/Build/49parkour-debug`.
- 순서: ①1차 빌드(템플릿/번들 생성) → ②splash 적용 → ③재빌드 → ④업로드.

### CC2 splash 주의 (114 파일럿 확정)
- `apply-kakao-splash.mjs` 는 **CC3 전용**(`index.ejs` 만 패치, CC2 는 "index.ejs 없음"으로 종료).
- CC2.4.x 빌드 산출 템플릿은 `index.html`(.ejs 아님). → 동일 splash 스니펫을 센티넬
  `<!-- BEGIN/END kakao-splash (hi5-sdk) -->` 로 감싸 `build-templates/web-mobile/index.html` 의 `<body>` 직후 수동 주입
  + `splash/{black,white}.png` 복사. 멱등. (`build-templates/web-mobile/` 이미 존재 — 1차 빌드 전제 충족됨)
- 비카카오 환경선 splash 안 보임(전 플랫폼 안전).

### 빌드 산출물 검증 포인트 (Phase B)
- assets/main 번들에 `KakaoAdapter`, `DEFAULT_KAKAO_AD_UNITS`, `regeneratorRuntime`, `__cc_no_outline__`, `KakaoRankView` 포함 확인.
- 누락 시: kakaoSdk.js 가 platform 을 lazy require 하므로 정적 분석이 못 잡을 수 있음 →
  필요하면 빌드 전 임시로 platform 을 top-level reference 추가 후 검증(런타임은 lazy 유지).

## 업로드 (Phase B, 참고)
- GameCode: **niopwg1e** → `kakao-qa:h5-game-build-live/h5/TS/QA/niopwg1e/`
- ⚠️ S3 키 만료 2026-06-02 — 이후 업로드 시 키 갱신 필요.

## 미검증/주의 (다음 작업자)
- 실기기/QA 환경 런타임 동작(어댑터 init 성공, 랭킹 데이터 로드, 리워드 지급, splash 표시→숨김)은 **빌드+업로드 후 회귀 테스트 필요**. 코드/벤더링까지만 검증.
- LEADERBOARD_ID='ranking' 이 카카오 어드민에 등록돼 있어야 함(미등록 시 code 406 → 빈 랭킹).
- KakaoRankView 는 seasonSeq=0(이번 시즌)만 사용. 주간/이전주 탭 미구현.
- 빌드 단계에서 CC2 빌더가 vendored .js 를 정상 번들하는지 + TypeScript(`require` 사용) 컴파일 통과 확인 필요
  (114-shiba 의 Hi5Ad.ts 가 동일 패턴으로 .ts 내 require 사용 후 빌드 성공 → 통과 예상).

## blockers
- 현재 없음(코드 단계 전부 PASS). Phase B 의 빌드/splash/업로드는 별도 세션에서 위 명령으로 진행.

---

## 추가 작업 (2026-06-01) — 인디케이터를 SDK-native(cocos-loading-indicator 샘플)로 통일

### 배경
- "카카오 SDK native 인디케이터" = hi5-sdk 저장소의 공식 샘플 **`samples/cocos-loading-indicator`**
  (반투명 dim + 회전 스피너, 봉봉/FriendMaker 검증 구조). 런타임 `window.HF` 에는 호출 가능한
  인디케이터 API 없음(HF 멤버: Application/Player/Tracer/Share/Leaderboard/System/Web/Log/Ad/KakaoTalk + enum).
  → 프로젝트의 cc2 포트인 `control/indicatorManager.js` 가 이 샘플의 cc2 등가물(프리팹/에셋 의존 0).

### 변경 파일 (4)
1. `business/kakaoSdk.js` — `showAd(key, callbacks)` 로 변경. `{onEarned, onStarted}` 객체 전달 지원(하위호환: 함수=onEarned).
2. `Hi5/AdManager.ts` `showKakaoRewardAd` — 광고 요청 시 `IndicatorManager.show()` → `onStarted`(표시 직전) `hide()`
   → `finish()` 안전 hide. f2496d2(인디케이터 제거)을 **lifecycle 연결 형태로 재도입** → 더블 인디케이터 근본 해소.
   `IndicatorManager.show()` 를 `cc.director.pause()` 보다 먼저 호출(스피너 초기 프레임 보장).
3. `ui/LoadingManager.ts` — `Loading.show/indicator/hide/hideIndicator` 를 SDK-native `IndicatorManager` 로 위임.
   30곳+ 호출처(`Loading.show(0.5)` 등) 무수정, timeout 자동 hide 보존(scheduleOnce). 레거시 prefab 슬롯은 참조 보존용으로만 유지.
4. `control/indicatorManager.js` — `cc.isValid` 가드 추가(씬 전환 stale 노드 방어).

### 미해결/주의
- LoadingManager 레거시 prefab/loadingText/rotate 속성은 더 이상 렌더에 사용 안 함(시그니처/씬 참조 호환용).
- 에디터 빌드 후 실제 카카오 환경에서 리워드 광고 로드~표시 전환 시 인디케이터 인계 동작 육안 확인 필요.
