# PRD: 49 Friends Runner - 버그 수정 3차

> 작성일: 2026-01-27
> 상태: 구현 중

## 개요

4가지 이슈에 대한 수정 요청입니다.

---

## 이슈 목록

### 이슈 #1: CDN 기반 로컬라이징 로직 제거

**현상**: 현재 LocalizationManager가 CDN에서 JSON을 다운로드하는 로직 포함
**요구사항**: CDN 로직 제거, 로컬 JSON만 사용
**수정 파일**: `LocalizationManager.ts`

**현재 상태 분석**:
- `LocalizationManager.ts`는 이미 로컬 JSON 사용으로 변경됨 (Line 559-572)
- `autoLoadJsonFolder: boolean = true` (Line 69-70)
- `jsonFolderPath: string = "Localize"` (Line 73-74)
- CDN 관련 코드 없음 - 이미 완료된 상태

**결론**: ✅ 이미 완료됨 - 추가 작업 불필요

---

### 이슈 #2: UIEndPage btn_normal 텍스트 모드별 설정

**현상**: btn_normal 버튼의 Label 텍스트가 모드에 관계없이 동일
**요구사항**:
- 무한모드(ParkourType.Infinite): `@Fail.continue`
- 챌린지모드(ParkourType.Normal): `@receive.normal`

**수정 파일**: `UIEndPage.ts`

**분석 결과**:
- `pdata.gameMode`로 현재 게임 모드 확인 가능
- `ParkourType.Normal` = 0, `ParkourType.Infinite` = 1
- `btn_next` 노드가 다음 레벨 버튼 (Line 58-59)
- `onShow()` 또는 `cutBtnStyle()` 에서 텍스트 설정 필요

**구현 방안**:
```typescript
// UIEndPage.ts - onShow() 내에서 btn_next의 Label 텍스트 설정
const btnLabel = this.btn_next.getComponentInChildren(cc.Label);
if (btnLabel) {
    if (pdata.gameMode == ParkourType.Infinite) {
        btnLabel.string = LocalizationManager.getText("@Fail.continue");
    } else {
        btnLabel.string = LocalizationManager.getText("@receive.normal");
    }
}
```

---

### 이슈 #3: 로딩 지연 개선 방안 마련

**현상**: 로딩 진행률 48.6%→52.6% 구간 지연
**원인**: D.11에서 분석 완료 - CSV 순차 다운로드

**현재 상태**:
- `WeakNetGame.ts` Line 150-169: progressCallback 이미 추가됨 ✅
- `LoadingScene.ts` Line 200-228: progressValue 파라미터 이미 추가됨 ✅

**결론**: ✅ 이미 완료됨 - 추가 작업 불필요

---

### 이슈 #4: UIRedHeartAndDiamond 다이아 충전 횟수 표시

**현상**: `lab_amount` Label이 빈 문자열 (Line 54)
**요구사항**: "현재횟수/최대횟수" 형식으로 표시 (예: "2/3")

**수정 파일**: `UIRedHeartAndDiamond.ts`

**분석 결과**:
- `pdata.freeDiamondCount`: 현재 남은 무료 횟수 (Line 166-167)
- 최대 횟수: 3 (고정값, Line 214의 리셋 로직 참조)
- `updateLabels()` 함수 Line 51-55에서 수정 필요

**구현 방안**:
```typescript
// UIRedHeartAndDiamond.ts - updateLabels() 수정
private updateLabels() {
    let name = this.res == ResType.Diamond
        ? LocalizationManager.getText("@currency.dia")
        : LocalizationManager.getText("@currency.heart");
    this.lab_num1.string = name + "+" + this.lab_num;

    // 다이아몬드일 경우 남은 횟수 표시
    if (this.res == ResType.Diamond) {
        pdata.checkDailyDiamondReset();
        this.lab_amount.string = `${pdata.freeDiamondCount}/3`;
    } else {
        this.lab_amount.string = "";
    }
}
```

---

## 완료 기준

1. [x] 이슈 #1: CDN 로컬라이징 제거 - 이미 완료
2. [x] 이슈 #2: UIEndPage btn_normal 텍스트 모드별 설정
3. [x] 이슈 #3: 로딩 지연 개선 - 이미 완료
4. [x] 이슈 #4: UIRedHeartAndDiamond 다이아 충전 횟수 표시

---

## 검증 체크리스트

- [x] #1: LocalizationManager CDN 로직 제거 확인
- [x] #2: 무한모드 진입 → @Fail.continue 텍스트 확인
- [x] #2: 챌린지모드 진입 → @receive.normal 텍스트 확인
- [x] #3: 로딩 진행률 세분화 확인
- [x] #4: 다이아 팝업에서 "X/3" 형식 표시 확인
- [x] #4: 누락된 로컬라이제이션 키 `text.daily_limit_reached` 추가 (ko/en/cn)
- [x] 영어 번역 수정: `Fail.continue` → "Retry", `receive.normal` → "Next Level"
