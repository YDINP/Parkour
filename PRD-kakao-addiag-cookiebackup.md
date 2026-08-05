# PRD — Parkour ad-diag 광고 진단 + 세이브 쿠키 백업 적용

> 작성: 2026-08-05 / 브랜치 `kakao` / CC 2.4.13 / 벤더 hi5-sdk 1.8.24

## 배경

타 카카오 프로젝트 대조 결과 Parkour에는 두 공통 모듈이 빠져 있었다.

- **ad-diag**: 광고 미노출 신고 시 트리거 미도달 / 유닛 매칭 / SDK hang 을 구분할 수단이 없다.
- **쿠키 백업**: 카카오 iOS 웹뷰 localStorage evict 시 세이브 복구 수단이 없다(카카오는 서버 세이브 API 없음).

## 설계

### ad-diag

SSOT `Ben_Claude/project-specific/modules/ad-diag.js`(CC2용 CJS)를 `assets/framework/Hi5/ad-diag.js`
로 복사. CC2는 assets에서 node_modules를 resolve하지 못해 SDK도 벤더링하고 있으므로 동일 방식.

배선 위치는 `business/kakaoSdk.js` 의 `showAd()` 한 곳 — 게임 내 모든 광고 호출(AdManager 포함)이
이 단일 진입점을 지난다. 로그 3종(`ad_call`/`ad_success`/`ad_fail`)에 더해 어댑터 미준비로 광고를
아예 못 부른 경로도 `ad_fail {code:'not-ready'}` 로 남긴다 — 트리거는 도달했는데 SDK가 준비 안 된
케이스와 트리거 미도달을 구분하기 위함.

**Live 노출 가드**: `isOn()` 의 Live 제외는 SSOT에 포함돼 있고, 이번에 추가하는 플래그 영속화 라인
(`?logOverlay=true` → localStorage)에도 동일 가드를 넣는다. 이 가드가 없으면 Live URL에 쿼리를 붙여
디버깅한 origin에 플래그가 영구히 남아 일반 유저에게 오버레이가 노출된다.

### 쿠키 백업

injector TARGETS에 Parkour 추가 → `build-templates/web-mobile/index.html` `<head>` 직후 sentinel 인라인.

**키 패턴**: `DataCenter` 가 `{namespace}.{field}` 로 키를 **쪼개** 저장한다(namespace = `pdata`,
`UInfo`, `gdata`, `SettingInfo`, `Sov`, `CheatInfo`). 즉 키 1개당 쿠키 1개가 생긴다.

- `pdata.*` (26키) — 레벨/골드/다이아/영웅/펫/능력치/출석 등 진행도·재화 전부. **백업 필수**
- `UInfo.*` (16키) — 닉네임/아바타/userId 등 대부분 로그인 시 재취득 가능 → 재취득 불가한
  `signData`(출석 누적)·`sharecount`·`drawResidueTime` 3키만 선택
- `gdata`(mapWidth)는 런타임 계산값, `CheatInfo`/`SettingInfo`는 유실돼도 영향 미미 → 제외

⚠ 쿠키 개수 상한은 **도메인 단위**이고 `gameplay.game.kakao.com` 은 모든 카카오 게임이 공유한다
(Path 스코프는 전송 범위만 좁힐 뿐 개수 상한을 나누지 않음). 키를 쪼개 저장하는 이 프로젝트는 태생적으로
쿠키를 많이 먹으므로 백업 대상을 29키로 제한했다. 향후 대상 확대 시 이 점을 다시 따질 것.

## 변경 파일

- `assets/framework/Hi5/ad-diag.js` (신규, +meta)
- `assets/framework/Hi5/business/kakaoSdk.js` — showAd 3종 로그 + logOverlay 영속화(Live 제외)
- `build-templates/web-mobile/index.html` — 쿠키 백업 sentinel 블록(injector 생성)
- (SSOT) `Ben_Claude/project-specific/scripts/inject-cookie-backup.mjs` — TARGETS 항목 추가

## 검증

- [x] `node --check` 문법 검사 통과
- [ ] 빌드 산출물 index.html에 sentinel 포함 확인
- [ ] 실기: `?logOverlay=true` 로 광고 시 3종 로그 / Live 호스트 미출력
- [ ] 실기: `window.__kakaoCookieBackup.dump()` 로 `pdata.*` 미러링 확인
