# PRD: 49 Friends Runner - 버그 수정 2차

> 작성일: 2026-01-26
> 상태: 구현 준비 완료
> 참조: kapi 프로젝트 Hi5 SDK 구현

## 개요

QA 피드백을 기반으로 한 버그 수정 및 기능 개선 요청 목록입니다.

### 제외된 이슈
- **이슈 #5, #13**: 원본 QA 목록에서 해당 번호 없음
- **Category C (에디터 작업)**: 코드 작업 범위 외 - Cocos Creator 에디터에서 직접 처리 필요
  - 이슈 #3: 캐릭터 구매 팝업 정렬
  - 이슈 #18: 하트 충전 팝업 Z-Order
  - 이슈 #19: 펫 뽑기 코인 차감 위치

---

## 이슈 분류

### Category A: Hi5 SDK 광고 연동 (구현 가능)

> **참조**: `C:\Users\a\Documents\kapi` 프로젝트의 Hi5 SDK 광고 패턴

| # | 이슈 | 설명 | 참조 파일 (kapi) |
|---|------|------|-----------------|
| 8 | 클리어 팝업 3배 획득 | 광고 시청 후 보상 3배 | AdUtils.js, Butler.js |
| 9 | 릴레이 영웅 소환 | 광고 시청 후 영웅 부활 | AdUtils.js |
| 16 | 프렌즈 소환 영상보기 | 광고 시청 후 영웅 소환 | AdUtils.js |
| 17 | 펫 뽑기 고급 알 무료 | 광고 시청 후 무료 뽑기 | AdUtils.js |

### Category B: 코드 수정 필요

| # | 이슈 | 설명 | 우선순위 |
|---|------|------|---------|
| 1 | 사운드 설정 버그 | 설정 조작 시 모든 사운드 꺼짐 | High |
| 2 | 네오 스킬 설명 형식 | 블랙홀/3단점프 전환 형식으로 변경 | Medium |
| 4 | 챌린지 결과 버튼 키 | receive.normal 키로 변경 필요 | Medium |
| 6 | 플레이어 기본 데이터 수정 | 코인 1000, 다이아 0 (치트 기능 보류) | Low |
| 7 | 레벨 클리어 저장 버그 | 3레벨 클리어 후 저장 안됨 | High |
| 10 | 다이아 충전 일일 제한 | 3/3 표기 및 제한 미적용 | Medium |
| 12 | 튜토리얼 맵 이름 | map.name.0 표시 버그 | Medium |
| 14 | 거인화 후 무적 시간 | 종료 후 여유 시간 필요 | Medium |

### Category D: 조사 필요 → ✅ 조사 완료

| # | 이슈 | 설명 | 상태 | 원인 |
|---|------|------|------|------|
| 7-b | 무한모드 튜토리얼 해상도 | 3레벨 후 해상도 깨짐 | ✅ 조사 완료 | Widget 충돌 (UIGuider + UIReady 동시 활성화) |
| 11 | 로딩 48.6→52.6 지연 | 특정 구간 로딩 느림 | ✅ 조사 완료 | CDN CSV 순차 다운로드 병목 |
| 15 | 맵 세로줄 아티팩트 | 떨어지는 부분 렌더링 이슈 | ✅ 조사 완료 | 타일셋 Texture Bleeding + Bilinear 필터링 |

---

## Hi5 SDK 광고 구현 가이드

> **참조**: kapi 프로젝트 (`C:\Users\a\Documents\kapi`)

### 광고 플로우 (kapi 패턴)

```
게임               Hi5 SDK
  |                  |
  |--loadAd()------->|  (광고 로드 요청)
  |<--LOAD_AD--------|  (로드 완료 콜백)
  |                  |
  |--showAd()------->|  (광고 표시 요청)
  |<--SHOW_AD--------|  (type: show - 표시됨)
  |<--SHOW_AD--------|  (type: userEarnedReward - 보상 획득)
  |<--SHOW_AD--------|  (type: dismissed - 광고 닫힘)
```

### 핵심 구현 패턴

1. **광고 요청**: `Hi5.loadAd({ aid: 'reward_xxx' })`
2. **메시지 핸들링**: Butler에서 LOAD_AD/SHOW_AD 메시지 처리
3. **콜백 처리**: `callRewardAdCallback(success)` 패턴
4. **게임 상태**: 광고 중 `pauseDirector()`, 종료 후 `resumeDirector()`
5. **음악 제어**: 광고 중 `pauseMusic()`, 종료 후 `resumeMusic()`

### 영향 받는 기능

| 기능 | 파일 | 함수 | 광고 타입 |
|------|------|------|----------|
| 클리어 3배 획득 | UIEndPage.ts | click_triple() | reward_triple |
| 릴레이 영웅 소환 | UIRevive.ts | click_revive() | reward_revive |
| 프렌즈 소환 | UIReviveItem.ts | enterGame() | reward_hero |
| 고급 펫 알 | UIhatchPet.ts | click_hatch() | reward_pet |
| 하트 획득 | UIRedHeartShop.ts | click_ad() | reward_heart |
| 다이아 획득 | UIRedHeartAndDiamond.ts | click_get() | reward_diamond |

---

## 상세 요구사항

### 이슈 #1: 사운드 설정 버그

**현상**: 설정에서 사운드를 조작하면 모든 사운드가 꺼지는 현상
**원인 분석 필요**: UISetting.ts의 사운드 토글 로직 확인
**기대 동작**: BGM과 SFX를 각각 독립적으로 on/off 가능

### 이슈 #2: 네오 스킬 설명 전환 형식

**현상**: 네오 공주 스킬 설명이 일반 형식
**요구사항**:
- 블랙홀 소환 / 쿨타임 24초 (첫 번째 표시, 3초 후 페이드 아웃)
- 3단 점프 (페이드 인, 반복)
- 전환 애니메이션 적용

### 이슈 #4: 챌린지 모드 결과 버튼

**현상**: 왼쪽 버튼이 무한 모드와 같은 키 사용
**요구사항**: `@receive.normal` 키로 변경 (다음 레벨 버튼)

### 이슈 #6: 플레이어 기본 데이터

**요구사항**:
- 기본 코인: 1000 (기존값에서 변경)
- 기본 다이아: 0 (기존값에서 변경)
- ~~치트 기능~~ → 보류

### 이슈 #7: 레벨 클리어 저장 버그

**현상**:
- 3레벨 클리어 후 무한모드 튜토리얼 시 해상도 깨짐
- 새로고침 후 3레벨 클리어 상태 미저장
**원인 분석 필요**: 레벨 저장 로직 및 캔버스 해상도 처리

### 이슈 #10: 다이아 충전 일일 제한

**요구사항**:
- 일일 3회 무료 획득 제한
- 무료 버튼 상단에 "3/3" 형식으로 남은 횟수 표시

### 이슈 #12: 튜토리얼 맵 이름

**현상**: 튜토리얼 시 맵 이름이 "map.name.0"으로 표시
**원인**: 로컬라이징 키가 적용되지 않음
**수정**: GameLayerTop.ts에서 올바른 로컬라이징 키 사용

### 이슈 #14: 거인화 후 무적 시간

**요구사항**:
- 거인화 버프 종료 후 1-2초 무적 시간 추가
- 장애물 충돌로 인한 갑작스러운 사망 방지

---

## 완료 기준

1. **Category A**: Hi5 SDK 광고 연동 후 각 기능별 광고 시청 → 보상 지급 확인
2. **Category B**: 코드 수정 후 해당 기능 테스트
3. **Category D**: 원인 분석 후 수정 계획 수립

---

## 검증 체크리스트

### 광고 연동 검증 (Category A)
- [ ] 광고 로드 요청 성공
- [ ] 광고 표시 정상 동작
- [ ] 광고 시청 완료 후 보상 지급
- [ ] 광고 실패/취소 시 게임 복귀
- [ ] 게임 일시정지/재개 정상 동작
- [ ] 음악 일시정지/재개 정상 동작

### 코드 수정 검증 (Category B)
- [x] #1: BGM/SFX 각각 독립적 on/off 동작
- [x] #2: 네오 스킬 설명 3초 간격 전환
- [ ] #4: 챌린지 결과 버튼 텍스트 확인
- [x] #6: 기본 코인 1000, 다이아 0 확인
- [x] #7: 레벨 클리어 후 저장 및 새로고침 후 유지
- [x] #10: 다이아 일일 3회 제한 및 카운트 표시
- [x] #12: 튜토리얼 맵 이름 로컬라이징
- [x] #14: 거인화 종료 후 무적 시간 확인

---

## Category D: 조사 결과 상세

### D.7: 무한모드 튜토리얼 해상도 깨짐

**현상**: 3레벨 클리어 후 무한모드 튜토리얼 진입 시 해상도가 깨짐

**근본 원인**: Widget 컴포넌트 충돌
- `guide_infinite()`가 UIEndPage 닫기 없이 `vm.show("UIReady")` 직접 호출
- UIGuider의 Widget과 UIReady의 Widget이 Canvas를 동시에 타겟팅
- `GuiderLayer.maskbg.updateAlignment()` 호출 시 레이아웃 충돌 발생

**관련 파일**:
- `assets/Game/Script/game/Guide.ts` (Line 206-247)
- `assets/framework/extension/guide/GuiderLayer.ts` (Line 160-199)

**권장 수정안** (Option 1 - 다른 가이드와 동일 패턴):
```typescript
// Guide.ts - guide_infinite()
if (ret == 1) {
    // UIEndPage 먼저 닫기
    await guiderLayer.waitClickUI("UIEndPage/k/title/btn_close")
    await evt.wait("Home.start")  // Home 씬 전환 대기
    await this.init();  // 새 씬에서 가이더 재초기화
    vm.show("UIReady")
    // ... 가이드 계속
}
```

---

### D.11: 로딩 48.6→52.6% 지연

**현상**: 로딩 진행률 48.6%→52.6% 구간에서 특히 느림

**근본 원인**: CDN CSV 순차 다운로드 병목
- 로딩 진행률 30%→50% 구간이 네트워크 CSV 다운로드 단계
- 21개 CSV 파일을 순차적 HTTP GET 요청
- 네트워크 RTT 누적으로 10-15초 지연 발생

**관련 파일**:
- `assets/framework/extension/weak_net_game/WeakNetGame.ts` (Line 150-161)
- `assets/Game/Script/common/LoadingScene.ts` (Line 200-228)

**권장 수정안**:
1. **진행률 세분화**: CSV 다운로드 중 파일별 진행률 업데이트
2. **텍스트 압축**: CDN에서 gzip/brotli 압축 활성화 (70-80% 용량 감소)
3. **로컬 번들링**: 핵심 CSV 파일을 로컬에 번들링

```typescript
// WeakNetGame.ts - downloadCsvs() 수정
private static async downloadCsvs(progressCallback?: (pct: number) => void) {
    let total = this.config.csv.length;
    let loaded = 0;

    let arr = this.config.csv.map(async (v) => {
        await this.downloadCsv(v);
        loaded++;
        if (progressCallback) {
            let csvProgress = (loaded / total) * 0.2 + 0.3;
            progressCallback(csvProgress);
        }
    });

    return Promise.all(arr);
}
```

---

### D.15: 맵 세로줄 아티팩트

**현상**: 맵에서 떨어지는 부분에 세로줄 렌더링 아티팩트 발생

**근본 원인**: Texture Bleeding + Bilinear 필터링
1. 타일셋 텍스처에 1px extrude(확장) 없음
2. `filterMode: "bilinear"` 사용으로 타일 경계에서 색상 보간 발생
3. 카메라 smoothFollow로 서브픽셀 렌더링 시 악화

**관련 파일**:
- `assets/Game/Script/common/PersistNode.ts` (Line 64 - 매크로 설정)
- `assets/resources/map/**/*.png.meta` (텍스처 설정)

**현재 설정 검증**:
```typescript
// PersistNode.ts
cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL_TMX = 1;  // ✅ 활성화됨
cc.view.enableAntiAlias(false);  // ✅ 안티앨리어싱 비활성화됨
// *.png.meta: filterMode: "point"  // ✅ 이미 적용됨
```

**권장 수정안** (수정된 우선순위):
1. **카메라 정수 스냅** (즉시 적용 가능):
   ```typescript
   // MapLoader.ts
   this.tiledmap.node.x = Math.round(this.tiledmap.node.x);
   this.tiledmap.node.y = Math.round(this.tiledmap.node.y);
   ```

2. **타일셋 재생성** (아트팀 작업 - 근본적 해결):
   - TexturePacker/Shoebox로 1px extrude 적용
   - Tiled Editor에서 `spacing="2" margin="1"` 설정

3. ~~텍스처 필터 변경~~ → **SKIP** (이미 point로 설정됨)

---

## Category D: 검증 체크리스트

- [x] #7-b: 무한모드 튜토리얼 해상도 원인 분석 완료
- [x] #11: 로딩 지연 원인 분석 완료
- [x] #15: 맵 아티팩트 원인 분석 완료
