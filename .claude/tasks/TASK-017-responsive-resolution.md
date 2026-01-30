# TASK-017: 해상도 반응형 대응

## 개요
탭/패드/서피스/폴드류 디바이스에 대한 반응형 해상도 대응

## 대상 디바이스
| 디바이스 | 해상도 | 비율 |
|---|---|---|
| iPad Pro 12.9" | 2732×2048 | 4:3 |
| iPad Air/Pro 11" | 2388×1668 | ~1.43:1 |
| Galaxy Tab S9 | 2560×1600 | 16:10 |
| Surface Pro | 2880×1920 | 3:2 |
| Galaxy Fold (펼침) | 2176×1812 | ~1.2:1 |
| Galaxy Fold (접힘) | 2316×904 | ~2.56:1 |

## 현재 상태
| 씬 | 디자인 해상도 | fitWidth | fitHeight |
|---|---|---|---|
| Loading | 1334×750 | false | true |
| Home | 1334×750 | false | true |
| Main | 1136×640 | false | true |
| Store | 1334×750 | true | false |

## 구현 방안
**방안 1 + 방안 2 조합**
1. 모든 씬 Canvas: `fitWidth: true`, `fitHeight: true` (SHOW_ALL)
2. UI 요소: Widget으로 edge 고정
3. ResolutionManager: 동적 해상도 감지 및 적용

## 구현 항목
- [x] ResolutionManager.ts 생성 (`assets/Game/Script/common/ResolutionManager.ts`)
- [x] Loading.fire Canvas 수정 (fitWidth: true)
- [x] Home.fire Canvas 수정 (fitWidth: true)
- [x] Main.fire Canvas 수정 (fitWidth: true)
- [x] LoadingScene.ts에 ResolutionManager 초기화 추가
- [x] Puppeteer 테스트 (iPad, Surface, Fold)

## 테스트 결과

### Puppeteer MCP 테스트 (2026-01-27)

| 기기 | 테스트 해상도 | 비율 | 결과 | 비고 |
|------|---------------|------|------|------|
| 기본 | 800×600 | 4:3 | ✅ 정상 | 전체 화면 표시 |
| iPad Pro | 1024×768 | 4:3 | ✅ 정상 | 전체 화면 표시 |
| Surface Pro | 1440×960 | 3:2 | ✅ 정상 | 상하 레터박스 |
| Galaxy Fold (펼침) | 1088×906 | ~6:5 | ✅ 정상 | 전체 화면 표시 |
| Galaxy Fold (접힘) | 1158×452 | ~2.5:1 | ✅ 정상 | 좌우 필러박스 |

### 결론
- **SHOW_ALL 전략 적용 성공**: 모든 디바이스에서 게임 콘텐츠가 완전히 표시됨
- **레터박스/필러박스**: 화면 비율이 맞지 않을 때 검은 여백으로 처리
- **UI 요소**: 상단 HUD, 팝업 등 모든 UI가 정상 위치에 표시됨

## 생성된 파일
- `assets/Game/Script/common/ResolutionManager.ts` - 해상도 관리 유틸리티

## 완료일
2026-01-27
