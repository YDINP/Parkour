# 📋 Parkour Hero - Task 목록

> 마지막 업데이트: 2026-01-26

## 개요

이 폴더에는 수정 작업들에 대한 PRD(Product Requirements Document)가 포함되어 있습니다.
- **현재 작업**: 루트 폴더
- **완료된 작업**: `done/` 폴더

---

## Task 현황

### 🟢 Ready (구현 준비 완료)

| Task ID | 제목 | 우선순위 | 관련 문서 |
|---------|------|---------|----------|
| BugFix Round 2 | QA 피드백 버그 수정 | High | [PRD](./PRD-BugFixRound2.md), [TASKS](./TASKS-BugFixRound2.md) |

### 🔴 Blocked (추가 정보 필요)

| Task ID | 제목 | 우선순위 | 필요 정보 |
|---------|------|---------|----------|
| [TASK-001](./TASK-001-hero-character-matching.md) | 캐릭터 특성/스킬 매칭 수정 | High | 매핑 테이블, 스켈레톤 파일 |
| [TASK-015](./TASK-015-synology-localization.md) | 시놀로지 로컬라이징 시트 적용 | High | 시트 URL/내용 |

### 🟡 SDK 대기

| 이슈 | 설명 | 상태 |
|------|------|------|
| 광고 관련 이슈 (#8, #9, #16, #17) | Hi5 SDK 광고 연동 필요 | SDK 연동 대기 |

---

## ✅ 완료된 작업 (`done/` 폴더)

### 2026-01-23 완료

| Task ID | 제목 | 수정 파일 |
|---------|------|----------|
| [TASK-009](./done/TASK-009-sound-setting-bug.md) | 사운드 설정 버그 수정 | UISetting.ts |
| [TASK-010](./done/TASK-010-hero-sort-by-quality.md) | 캐릭터 등급별 정렬 | UIHeroShop.ts |
| [TASK-011](./done/TASK-011-pet-limited-bug.md) | 펫/영웅 한정 표시 제거 | petItem.ts, heroItem.ts |
| [TASK-012](./done/TASK-012-loading-chinese-text.md) | 로딩 화면 로컬라이징 | LoadingScene.ts, SubpackageLoader.ts, main.json |
| [TASK-013](./done/TASK-013-character-flash-bug.md) | 캐릭터 전환 깜빡임 수정 | heroItem.ts |
| [TASK-014](./done/TASK-014-skill-desc-number.md) | 스킬 설명 숫자 확인 | (정상 동작 - 쿨다운 시간) |

### 2025-01-12 완료

| Task ID | 제목 | 수정 파일 |
|---------|------|----------|
| [TASK-005](./done/TASK-005-heart-shop-free-button.md) | 하트 상점 무료 버튼 키 변경 | UIRedHeartShop.prefab |
| [TASK-006](./done/TASK-006-endless-result-button.md) | 무한모드 결과 버튼 키 변경 | UIEndPage.prefab |
| [TASK-007](./done/TASK-007-lobby-table-layer.md) | 로비 테이블 레이어 수정 | Home.fire |
| [TASK-008](./done/TASK-008-pet-lobby-animation.md) | 펫 로비 애니메이션 추가 | Home.ts |

---

## 에디터 작업 필요 (코드 외)

다음 이슈들은 **Cocos Creator 에디터에서 직접 작업**이 필요합니다:

| # | 이슈 | 작업 내용 | 관련 Prefab |
|---|------|----------|-------------|
| 1 | 튜브 제외 캐릭터 크기 확대 | 프렌즈 정보 팝업 캐릭터 스케일 조정 | UIHeroShop.prefab |
| 2 | 캐릭터 구매 팝업 정렬 | 내용/버튼 중앙 정렬 | - |
| 3 | 결과 팝업 캐릭터 사이즈 | 캐릭터 스케일 조정 | UIEndPage.prefab |
| 4 | 하트 상점 "+1" 중앙 정렬 | Label 위치 조정 | UIRedHeartShop.prefab |
| 5 | 코인 상점 보유 다이아 UI 추가 | 우측 상단 UI 노드 추가 | UICoinShop.prefab |
| 6 | 로비 하단 폰트 적용 | 영웅/펫 등 Label 폰트 교체 | Home.fire |
| 7 | 프렌즈 정보 강화 버튼 코인 위치 | 버튼 내 코인 아이콘 위치 조정 | UIHeroShop.prefab |
| 8 | 펫 팝업 강화 버튼 코인 위치 | 버튼 내 코인 아이콘 위치 조정 | UIPet.prefab |
| 9 | 프렌즈 정보 스킬 설명 3줄 | Label 높이/줄 수 설정 | UIHeroShop.prefab |
| 10 | 펫 팝업 강화 버튼 텍스트 사이즈 | 프렌즈와 동일하게 폰트 크기 조정 | UIPet.prefab |
| 11 | 프렌즈 정보 레벨 표기 위치 | 캐릭터 이름 하단으로 이동 | UIHeroShop.prefab |
| 12 | 펫 팝업 레벨 표기 위치 | 캐릭터 이름 하단으로 이동 | UIPet.prefab |
| 13 | 선물 뽑기 텍스트 중앙 정렬 | "상자를 클릭해주세요" Label 위치 | UIGiftBox.prefab |
| 14 | 선물 뽑기 다이아 소모 표기 위치 | 상자 상단으로 위치 변경 | UIGiftBox.prefab |
| 15 | 결과 팝업창 가이드 반영 | 가이드 이미지 참조 후 재작업 | UIResult.prefab |
| 16 | 능력 업그레이드 팝업 가이드 반영 | 가이드 이미지 참조 후 재작업 | UIUpgrade.prefab |
| 17 | 하트 충전 시간 중앙 정렬 | Label 위치 조정 | - |

---

## 상태 범례

| 상태 | 설명 |
|------|------|
| 🔴 Blocked | 추가 정보 필요 |
| 🟢 Ready | 구현 준비 완료 |
| 🟡 In Progress | 구현 진행 중 |
| ✅ Done | 완료 |

---

## 관련 문서

- [PENDING-ISSUES.md](../../PENDING-ISSUES.md) - 미완료 이슈 목록
- [MODIFICATION-GUIDE.md](../../MODIFICATION-GUIDE.md) - 수정 가이드
- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 가이드