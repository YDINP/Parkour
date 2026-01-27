# TASKS: 버그 수정 3차

> PRD: PRD-BugFixRound3.md
> 상태: 진행 중

---

## 태스크 목록

### TASK-R3-001: CDN 기반 로컬라이징 로직 제거
- **상태**: ✅ 완료 (이미 적용됨)
- **파일**: `LocalizationManager.ts`
- **설명**: CDN 다운로드 로직이 이미 제거되고 로컬 JSON 사용으로 변경됨
- **확인 위치**: Line 69-74, Line 559-572

---

### TASK-R3-002: UIEndPage btn_normal 텍스트 모드별 설정
- **상태**: ✅ 완료
- **파일**: `assets/Game/Script/ui/UIEndPage.ts`
- **변경 내용**:
  1. `onShow()` 함수에서 btn_next의 Label 텍스트 설정 (Line 137-145)
  2. 무한모드: `@Fail.continue` → "재도전" (ko) / "Retry" (en)
  3. 챌린지모드: `@receive.normal` → "다음 레벨" (ko) / "Next Level" (en)

---

### TASK-R3-003: 로딩 지연 개선
- **상태**: ✅ 완료 (이미 적용됨)
- **파일**: `WeakNetGame.ts`, `LoadingScene.ts`
- **설명**: progressCallback이 이미 추가되어 CSV 다운로드 진행률 세분화됨
- **확인 위치**:
  - WeakNetGame.ts Line 150-169
  - LoadingScene.ts Line 200-228

---

### TASK-R3-004: UIRedHeartAndDiamond 다이아 충전 횟수 표시
- **상태**: ✅ 완료
- **파일**: `assets/Game/Script/ui/UIRedHeartAndDiamond.ts`
- **변경 내용**:
  1. `updateLabels()` 함수 수정 (Line 55-61)
  2. `lab_amount.string`에 "현재횟수/3" 형식 표시
  3. 다이아몬드일 경우에만 표시
  4. `pdata.checkDailyDiamondReset()` 호출로 일일 리셋 체크

### TASK-R3-005: 누락된 로컬라이제이션 키 추가
- **상태**: ✅ 완료
- **파일**: `assets/resources/Localize/localization.json`
- **변경 내용**:
  1. `text.daily_limit_reached` 추가:
     - ko: "일일 충전 횟수를 모두 사용했습니다."
     - en: "Daily limit reached. Please try again tomorrow."
     - cn: "今日免费次数已用完，请明天再来。"
  2. 영어 번역 수정:
     - `Fail.continue`: "Fail.continue" → "Retry"
     - `receive.normal`: "receive.normal" → "Next Level"

---

## 진행 상황

| Task | 상태 | 담당 |
|------|------|------|
| TASK-R3-001 | ✅ 완료 | - |
| TASK-R3-002 | ✅ 완료 | Agent |
| TASK-R3-003 | ✅ 완료 | - |
| TASK-R3-004 | ✅ 완료 | Agent |
| TASK-R3-005 | ✅ 완료 | Agent |

---

## 완료 기준

- [x] TASK-R3-002: UIEndPage 버튼 텍스트 모드별 설정 완료
- [x] TASK-R3-004: 다이아 충전 횟수 표시 완료
- [x] TASK-R3-005: 누락된 로컬라이제이션 키 추가 완료
- [x] Oracle 검증 완료
