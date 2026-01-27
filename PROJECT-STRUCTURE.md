# Parkour (49FriendsRunner) - 프로젝트 구조

## 프로젝트 개요

- **Engine**: Cocos Creator 2.4.13
- **Language**: JavaScript/TypeScript
- **Genre**: 2D Endless Runner
- **Platforms**: WeChat, Alipay, QQ, ByteDance (TT) Mini Games
- **Project ID**: f9b25c8a-8b8c-468d-b45d-194561fa86d6

## 디렉토리 구조

```
C:\Users\a\Documents\Parkour/
├── assets/                          # 게임 에셋 및 소스코드
│   ├── common-shader-cocos/         # 셰이더 효과 라이브러리
│   │   ├── effects/                 # 셰이더 이펙트 파일
│   │   ├── materials/               # 머티리얼 정의
│   │   ├── prefabs/                 # 셰이더 프리팹
│   │   └── scripts/                 # 셰이더 컨트롤러
│   │
│   ├── framework/                   # 코어 프레임워크 (144 files)
│   │   ├── core/                    # 핵심 시스템
│   │   ├── extension/               # 확장 모듈
│   │   ├── fizzx/                   # 커스텀 물리 엔진
│   │   ├── Hi5/                     # Hi5 SDK 통합
│   │   ├── ui/                      # UI 프레임워크
│   │   └── utils/                   # 유틸리티
│   │
│   ├── Game/                        # 게임 로직 및 리소스
│   │   ├── Animation/               # 애니메이션 에셋
│   │   ├── effects/                 # 게임 이펙트
│   │   ├── Images/                  # 이미지 리소스
│   │   ├── Scenes/                  # 게임 씬
│   │   ├── Script/                  # 게임 스크립트 (107 files)
│   │   ├── Skeletons/               # Spine 스켈레톤 애니메이션
│   │   └── _loading_/               # 로딩 화면 리소스
│   │
│   └── resources/                   # 동적 로드 리소스
│       ├── Audio/                   # 사운드/음악
│       ├── Config/csv/              # CSV 데이터 파일
│       ├── effects/                 # 이펙트 프리팹
│       ├── heros/                   # 영웅 프리팹
│       ├── item/                    # 아이템 프리팹
│       ├── map/                     # 맵 타일셋
│       ├── objects/                 # 게임 오브젝트
│       ├── pets/                    # 펫 프리팹
│       ├── prefabs/                 # 공통 프리팹
│       └── Textures/                # 텍스처 아틀라스
│
├── build/                           # 빌드 출력
├── docs/                            # 프로젝트 문서
├── extensions/                      # Cocos Creator 확장
├── library/                         # Cocos Creator 라이브러리 캐시
├── local/                           # 로컬 설정
├── packages/                        # Cocos Creator 패키지
├── settings/                        # 에디터 설정
├── temp/                            # 임시 파일
├── tools/                           # 개발 도구
│
├── project.json                     # Cocos Creator 프로젝트 설정
├── tsconfig.json                    # TypeScript 설정
├── package.json                     # NPM 패키지 설정
└── CLAUDE.md                        # Claude Code 가이드
```

## 프레임워크 아키텍처

### 1. Core (`framework/core/`)

핵심 시스템 및 유틸리티

| 파일 | 설명 |
|------|------|
| `FSM.ts` | 유한 상태 머신 (Finite State Machine) |
| `Signal.ts` | 이벤트 시그널 시스템 |
| `PoolManager.ts` | 오브젝트 풀링 관리 |
| `DataCenter.ts` | 데이터 저장/로드 시스템 (`@dc` 데코레이터) |
| `Device.ts` | 디바이스 정보 및 오디오 관리 |
| `event.ts` | 글로벌 이벤트 시스템 (`evt`) |
| `csv.js` | CSV 데이터 파싱 |
| `gUtil.ts` | 범용 유틸리티 함수 |
| `easing.js` | 이징 함수 라이브러리 |
| `calc.js` | 수학 계산 함수 |

### 2. Extension (`framework/extension/`)

확장 모듈 및 게임 시스템

```
extension/
├── action/                    # 액션 시스템
│   ├── ShakeAction.ts         # 화면 흔들림
│   └── SmoothFollow.js        # 부드러운 카메라 추적
│
├── audio/                     # 오디오 시스템
│   ├── ClickAudio.ts          # 클릭 사운드
│   └── ClickAudioManager.ts   # 클릭 사운드 관리
│
├── buffs/                     # 버프 시스템
│   ├── BuffSystem.ts          # 버프 관리자
│   ├── Buff.ts                # 버프 베이스 클래스
│   └── EmptyBuff.ts           # 빈 버프
│
├── fxplayer/                  # 이펙트 시스템
│   └── FxHelpher.ts           # 이펙트 헬퍼
│
├── guide/                     # 가이드 시스템
│   └── GuiderLayer.ts         # 튜토리얼 가이드
│
├── input/                     # 입력 시스템
│   ├── InputSystem.ts         # 입력 관리
│   ├── LongTouch.ts           # 롱터치 감지
│   └── PlayController.ts      # 플레이어 컨트롤러
│
├── mmcloud/                   # 미니게임 클라우드
│   ├── Cloud.ts               # 클라우드 저장
│   └── mmgame.ts              # 미니게임 API
│
├── movement/                  # 움직임 시스템
│   ├── Bounce.ts              # 바운스 효과
│   └── SMoveBase.ts           # 이동 베이스 클래스
│
├── optimization/              # 최적화
│   ├── DrawCallOptimizer.ts   # 드로우콜 최적화
│   ├── DrawCallReorder.ts     # 드로우콜 재정렬
│   ├── PoolSpawner.ts         # 풀 스포너
│   └── SpriteFrameCache.ts    # 스프라이트 프레임 캐시
│
├── qanim/                     # 빠른 애니메이션
│   ├── UIAnimHelper.ts        # UI 애니메이션 헬퍼
│   ├── UIBaseAnim.ts          # 애니메이션 베이스
│   ├── BreathAnim.ts          # 호흡 애니메이션
│   ├── FrameAnim.ts           # 프레임 애니메이션
│   ├── LabelAnim.ts           # 라벨 애니메이션
│   ├── ProgressBarAnim.ts     # 프로그레스바 애니메이션
│   └── ScaleAnim.ts           # 스케일 애니메이션
│
├── render/                    # 렌더링 확장
│
├── scroll/                    # 스크롤 시스템
│   └── ParallaxNode.ts        # 패럴랙스 스크롤
│
├── sdks/                      # 멀티 플랫폼 SDK
│   ├── SDKInterafce.ts        # SDK 인터페이스
│   ├── wxsdk/                 # WeChat SDK
│   ├── aldsdk/                # Alipay SDK
│   ├── qq/                    # QQ SDK
│   └── ttsdk/                 # ByteDance TT SDK
│
├── shooter/                   # 슈팅 시스템
│
├── tilemap/                   # 타일맵 시스템
│
├── utils/                     # 확장 유틸리티
│
├── weak_net_game/             # 약한 네트워크 대응
│
├── Platform.ts                # 통합 플랫폼 API
└── AliEvent.ts                # Alipay 이벤트
```

### 3. FizzX (`framework/fizzx/`)

커스텀 2D 물리 엔진 (Cocos 내장 물리 엔진 대체)

| 파일 | 설명 |
|------|------|
| `fizz.ts` | 물리 엔진 코어 (중력, 충돌, 파티셔닝) |
| `shapes.ts` | 물리 형태 정의 (박스, 서클, 폴리곤) |
| `GridPartition.js` | 그리드 파티셔닝 |
| `HashBounds.js` | 해시 바운드 |
| `QuadTree.js` | 쿼드트리 |
| `SpatialPartition.ts` | 공간 파티셔닝 인터페이스 |

**Components:**
```
components/
├── FizzBody.ts                # 물리 바디 컴포넌트
├── FizzManager.ts             # 물리 매니저
├── FizzHelper.ts              # 물리 헬퍼
├── Common/
│   └── PlayerController.ts    # 플레이어 물리 컨트롤러
└── [기타 물리 컴포넌트들]
```

**특징:**
- 고정 oneWay platform 지원 (`vy_min = -250`, `vy_max = 30`)
- 최대 속도 제한 (`maxSpeed = 1500`)
- Static, Dynamic, Kinematic body types
- 충돌 감지 및 해결 (Collision detection & resolution)

### 4. Hi5 SDK (`framework/Hi5/`)

Hi5 플랫폼 통합 SDK

```
Hi5/
├── Hi5.ts                          # Hi5 SDK 메인 (TypeScript)
├── hi5.js                          # Hi5 SDK 메인 (JavaScript)
├── hi5Helper.js                    # Hi5 헬퍼 유틸리티
│
├── Localization/                   # 로컬라이제이션 시스템
│   ├── LocalizationManager.ts      # 다국어 관리자
│   ├── *.json                      # 다국어 데이터 (ko, en, cn)
│   ├── *.tsv                       # 다국어 소스 (TSV)
│   ├── tsv-to-json.js              # TSV → JSON 변환 스크립트
│   ├── convert.bat                 # 변환 배치 파일
│   └── README-Localization.md      # 로컬라이제이션 가이드
│
├── README-Hi5-Integration-TS.md    # Hi5 TS 통합 가이드
├── README-Hi5-Integration-JS.md    # Hi5 JS 통합 가이드
└── TROUBLESHOOTING-CocosCreator-JS.md
```

**LocalizationManager 특징:**
- CDN 기반 다국어 로드 (버전 관리 지원)
- TSV → JSON 자동 변환
- 실시간 언어 전환
- 로컬 캐시 폴백
- 이미지 로컬라이제이션 지원

**지원 언어:**
- 한국어 (ko)
- 영어 (en)
- 중국어 (cn)

### 5. UI Framework (`framework/ui/`)

MVC 기반 UI 시스템

| 파일 | 설명 |
|------|------|
| `mvcView.ts` | MVC 뷰 베이스 클래스 |
| `View.ts` | 뷰 베이스 클래스 |
| `ViewManager.ts` | 뷰 관리자 (열기/닫기) |
| `LoadingManager.ts` | 로딩 화면 관리 |
| `MessageBoxManager.ts` | 메시지박스 관리 |
| `ToastManager.ts` | 토스트 메시지 관리 |
| `UIFunctions.ts` | UI 유틸리티 함수 |

**Data Center 컴포넌트:**
```
ui/
├── DCLabel.ts                 # 데이터센터 연동 라벨
├── DCSprite.ts                # 데이터센터 연동 스프라이트
├── DCToggle.ts                # 데이터센터 연동 토글
├── DCUI.ts                    # 데이터센터 연동 UI
└── DCPandoraPoint.ts          # 판도라 포인트 연동
```

## 게임 로직 구조

### Game Script (`assets/Game/Script/`)

```
Script/
├── common/                          # 공통 시스템
│   ├── configs/
│   │   ├── GameConfigs.ts           # 게임 설정
│   │   ├── QQGameConfigs.ts         # QQ 전용 설정
│   │   └── TTGameConfigs.ts         # TT 전용 설정
│   ├── LoadingScene.ts              # 로딩 씬
│   ├── PersistNode.ts               # 영속 노드
│   ├── ServerConfig.ts              # 서버 설정
│   ├── HeroSpinePaths.ts            # 영웅 Spine 경로
│   ├── Gradient.js                  # 그라디언트 효과
│   └── Unity.ts                     # Unity 브릿지
│
├── Controller/                      # 컨트롤러
│   ├── SkeletonComponent.ts         # Spine 스켈레톤 컴포넌트
│   └── SkinManager.ts               # 스킨 관리자
│
├── data/                            # 데이터 모델
│   ├── PlayerInfo.ts                # 플레이어 정보 (pdata)
│   └── GameInfo.ts                  # 게임 정보
│
├── game/                            # 게임 코어
│   ├── Game.ts                      # 게임 메인 컨트롤러
│   ├── Player.ts                    # 플레이어 컨트롤러
│   ├── Home.ts                      # 홈 화면
│   ├── Guide.ts                     # 가이드 시스템
│   ├── ObjectFactory.ts             # 오브젝트 팩토리
│   ├── UIPlayControls.ts            # 게임 플레이 컨트롤
│   │
│   ├── behaviors/                   # 게임 동작
│   │   ├── EndTrigger.ts            # 엔드 트리거
│   │   ├── Falloff.ts               # 낙하 감지
│   │   ├── Follow.ts                # 추적 행동
│   │   ├── InfiniteMode.ts          # 무한 모드
│   │   ├── LevelMode.ts             # 레벨 모드
│   │   ├── NoobLevel.ts             # 초보자 레벨
│   │   ├── ShowTimeMode.ts          # 쇼타임 모드
│   │   ├── ShieldBuff.ts            # 쉴드 버프
│   │   │
│   │   ├── items/                   # 아이템 동작
│   │   │   └── RemoveIfOOS.ts       # 화면 밖 제거
│   │   │
│   │   ├── pet/                     # 펫 버프
│   │   │   ├── PetBuffs.ts          # 펫 버프 등록
│   │   │   ├── ItemStrengthBuff.ts  # 아이템 강화
│   │   │   ├── LifeLoseReduceBuff.ts # 생명 감소 완화
│   │   │   ├── MakeItemBuff.ts      # 아이템 생성
│   │   │   ├── ResistBuff.ts        # 저항 버프
│   │   │   └── SpeedupBuff.ts       # 속도 증가
│   │   │
│   │   ├── player/                  # 플레이어 버프
│   │   │   ├── PlayerBuffs.ts       # 플레이어 버프 등록
│   │   │   ├── Blackhole.ts         # 블랙홀
│   │   │   ├── GoldBuff.ts          # 골드 버프
│   │   │   ├── Invincible.ts        # 무적
│   │   │   ├── MagnetSuck.ts        # 자석
│   │   │   ├── PlayerLoseHp.ts      # HP 감소
│   │   │   ├── ReviveBuff.ts        # 부활
│   │   │   ├── RushBuff.ts          # 돌진
│   │   │   ├── StarBuff.ts          # 별 버프
│   │   │   ├── Stronger.ts          # 강화
│   │   │   └── logic/
│   │   │       └── PlayerDeadDetector.ts  # 죽음 감지
│   │   │
│   │   └── skill/                   # 스킬
│   │       ├── GeneralSkill.ts      # 일반 스킬
│   │       ├── DeadBuff.ts          # 죽음 버프
│   │       ├── DmgReduce.ts         # 데미지 감소
│   │       ├── Meteorilite.ts       # 운석
│   │       ├── SkillFire.ts         # 스킬 발사
│   │       ├── SkillFire3.ts        # 스킬 발사 3
│   │       └── Skill_Turn.ts        # 턴 스킬
│   │
│   ├── effects/                     # 게임 이펙트
│   │   ├── Effect.ts                # 이펙트 베이스
│   │   ├── BlinkRed.ts              # 빨간색 깜빡임
│   │   └── eggAction.ts             # 알 액션
│   │
│   ├── extension/                   # 게임 확장
│   │   ├── BladeBullet.ts           # 칼날 총알
│   │   ├── GameBullet.ts            # 게임 총알
│   │   └── SortedCursorLayer.ts     # 정렬 커서 레이어
│   │
│   ├── model/                       # 데이터 모델
│   │   ├── BaseData.ts              # 베이스 데이터
│   │   ├── HeroData.ts              # 영웅 데이터
│   │   ├── PetData.ts               # 펫 데이터
│   │   ├── WeaponData.ts            # 무기 데이터
│   │   ├── ItemData.ts              # 아이템 데이터
│   │   ├── LevelData.ts             # 레벨 데이터
│   │   ├── InfiniteLevelData.ts     # 무한 레벨 데이터
│   │   ├── MapSegData.ts            # 맵 세그먼트 데이터
│   │   ├── MobData.ts               # 몹 데이터
│   │   ├── PlayerData.ts            # 플레이어 데이터
│   │   ├── BuyPropsData.ts          # 구매 Props 데이터
│   │   ├── QualityLevelData.ts      # 품질 레벨 데이터
│   │   ├── ShopCapData.ts           # 상점 캡 데이터
│   │   ├── SilverCoinData.ts        # 실버 코인 데이터
│   │   └── skinData.ts              # 스킨 데이터
│   │
│   ├── objects/                     # 게임 오브젝트
│   │   ├── Item.ts                  # 아이템
│   │   ├── Obstacle.ts              # 장애물
│   │   └── Pet.ts                   # 펫
│   │
│   └── views/                       # 게임 뷰
│       ├── GameLayerTop.ts          # 게임 상단 레이어
│       └── HeartRecovery.ts         # 하트 회복
│
├── ui/                              # UI 컴포넌트
│   ├── UIReady.ts                   # 준비 화면
│   ├── UIEndPage.ts                 # 종료 페이지
│   ├── UIFail.ts                    # 실패 화면
│   ├── UIPause.ts                   # 일시정지
│   ├── UILevels.ts                  # 레벨 선택
│   ├── UILevelsPage.ts              # 레벨 페이지
│   ├── UILevelItem.ts               # 레벨 아이템
│   ├── UIHeroShop.ts                # 영웅 상점
│   ├── UIPet.ts                     # 펫 UI
│   ├── UIhatchPet.ts                # 펫 부화
│   ├── UIDrawBox.ts                 # 뽑기 박스
│   ├── UILiftGift.ts                # 리프트 선물
│   ├── UICheckIn.ts                 # 출석체크
│   ├── UIRank.ts                    # 랭킹
│   ├── UIRedHeartAndDiamond.ts      # 하트/다이아몬드
│   ├── UIImgComfirm.ts              # 이미지 확인
│   ├── UIcommodity_frame.ts         # 상품 프레임
│   ├── abilityIItem.ts              # 능력 아이템
│   ├── eggItem.ts                   # 알 아이템
│   ├── heroItem.ts                  # 영웅 아이템
│   ├── petItem.ts                   # 펫 아이템
│   └── readyItem.ts                 # 준비 아이템
│
└── view/                            # 기타 뷰
    └── TopMostInventoryUI.ts        # 인벤토리 UI
```

### 게임 FSM 구조

**Player FSM (State):**
- `Normal`: 일반 상태
- `Scaling`: 스케일링 상태

**Player Skill FSM (SkillState):**
- `CD`: 쿨다운 상태
- `Ready`: 준비 상태

**Game FSM (State):**
- `Run`: 실행 중
- `Pause`: 일시정지
- `Resume`: 재개
- `End`: 종료
- `Stop`: 정지

## 버프 시스템

### BuffSystem 아키텍처

**핵심 클래스:**

1. **BuffSystem** (`framework/extension/buffs/BuffSystem.ts`)
   - 버프 라이프사이클 관리
   - 시간 기반 업데이트 (1초 간격)
   - 버프 등록 및 활성화/비활성화
   - 일시정지/재개 지원

2. **Buff** (`framework/extension/buffs/Buff.ts`)
   - 추상 베이스 클래스
   - 속성: `duration`, `timeLeft`, `canAdd`, `maxDuration`
   - 라이프사이클:
     - `onEnabled()` → 버프 시작
     - `step()` → 매 초마다 호출
     - `onTimeLeftChanged()` → 남은 시간 변경
     - `onDisabled()` → 버프 종료
   - 시그널: `Start`, `End`, `Update`

**버프 등록 및 사용:**

```typescript
// 1. 버프 등록 (게임 시작 시)
BuffSystem.register("buffName", BuffClassName, optionalData);

// 2. 버프 시작
this.buffSystem.startBuff("buffName", duration, data);

// 3. 버프 중지
this.buffSystem.stop("buffName");

// 4. 버프 상태 확인
if (this.buffSystem.isEnabled("buffName")) {
    // ...
}
```

**등록된 버프:**

**Player Buffs** (`game/behaviors/player/PlayerBuffs.ts`):
- `buff_gold`: 골드 획득 증가
- `buff_invincible`: 무적
- `buff_magnet`: 자석 (아이템 흡수)
- `buff_rush`: 돌진
- `buff_star`: 별 버프
- `buff_stronger`: 강화
- `buff_revive`: 부활
- `buff_blackhole`: 블랙홀

**Pet Buffs** (`game/behaviors/pet/PetBuffs.ts`):
- `buff_itemStrength`: 아이템 강화
- `buff_lifeLoseReduce`: 생명 감소 완화
- `buff_makeItem`: 아이템 생성
- `buff_resist`: 저항
- `buff_speedup`: 속도 증가

**Skill Buffs** (`game/behaviors/skill/`):
- `buff_dead`: 죽음 버프
- `buff_dmgReduce`: 데미지 감소
- `skill_meteorilite`: 운석 스킬
- `skill_fire`: 발사 스킬

## 물리 엔진 (FizzX)

### 커스텀 물리 엔진 구조

**Core Files:**

| 파일 | 설명 |
|------|------|
| `fizz.ts` | 물리 엔진 메인 (16,439 bytes) |
| `shapes.ts` | 물리 형태 (박스, 서클, 폴리곤) |
| `GridPartition.js` | 그리드 기반 공간 파티셔닝 |
| `HashBounds.js` | 해시 바운드 충돌 감지 |
| `QuadTree.js` | 쿼드트리 공간 파티셔닝 |
| `SpatialPartition.ts` | 공간 파티셔닝 인터페이스 |

**Components:**

```
fizzx/components/
├── FizzBody.ts                    # 물리 바디 (static, dynamic, kinematic)
├── FizzManager.ts                 # 물리 시뮬레이션 관리자
├── FizzHelper.ts                  # 물리 헬퍼 유틸리티
├── Common/
│   └── PlayerController.ts        # 플레이어 물리 컨트롤러
├── [기타 컴포넌트들]
```

**특징:**

1. **Body Types:**
   - `Static`: 정적 물체 (벽, 바닥)
   - `Dynamic`: 동적 물체 (플레이어, 적)
   - `Kinematic`: 키네마틱 물체 (움직이는 플랫폼)

2. **Shapes:**
   - Box (사각형)
   - Circle (원)
   - Polygon (다각형)

3. **Collision Detection:**
   - Broad Phase: GridPartition / QuadTree / HashBounds
   - Narrow Phase: SAT (Separating Axis Theorem)

4. **One-Way Platform:**
   - `vy_min = -250`: 최소 수직 속도
   - `vy_max = 30`: 최대 수직 속도
   - `max_fixPosY = 42`: 최대 위치 보정

5. **Physics Settings:**
   - `gravityx = 0`, `gravityy = 0`: 중력 설정
   - `maxSpeed = 1500`: 최대 속도 제한
   - Positional correction (slop, percentage)

**PlayerController:**
- 상태: `Normal`, `Jump`, `DoubleJump`, `Fall`, `Slide`, `Dead`
- 점프, 슬라이드, 이중 점프 지원
- 애니메이션 연동
- 충돌 처리

## 데이터 파일 (CSV/TSV)

### Localization Data (`framework/Hi5/Localization/`)

**TSV/JSON 파일:**

| 파일 | 설명 |
|------|------|
| `Parkour - main.tsv/json` | 메인 UI 텍스트 (6,470 bytes TSV) |
| `Parkour - hero.tsv/json` | 영웅 설명 |
| `Parkour - pet.tsv/json` | 펫 설명 |
| `Parkour - Level.tsv/json` | 레벨 설명 |
| `Parkour - guide.tsv/json` | 가이드 텍스트 |
| `Parkour - Prop.tsv/json` | 프롭 설명 |
| `Parkour - shopCap.tsv/json` | 상점 캡 설명 |
| `Parkour - skin.tsv/json` | 스킨 설명 |

**변환 도구:**
- `tsv-to-json.js`: TSV → JSON 변환 스크립트
- `convert.bat`: 배치 변환 스크립트

### CSV 게임 데이터 (추정 위치: `resources/Config/csv/`)

프로젝트에서 사용되는 CSV 데이터 (코드 참조):
- `hero.csv`: 영웅 스탯, 가격, 스킬
- `pet.csv`: 펫 능력, 버프
- `level.csv`: 레벨 설정
- `item.csv`: 아이템 데이터
- `weapon.csv`: 무기 데이터
- `shop.csv`: 상점 데이터
- `buff.csv`: 버프 설정
- `skill.csv`: 스킬 설정

**DataCenter 저장:**
- 로컬 스토리지 기반
- `@dc` 데코레이터로 자동 저장/로드
- `PlayerInfo.ts`의 `pdata` 객체

## SDK 통합

### 멀티 플랫폼 SDK

**Platform.ts** (`framework/extension/Platform.ts`)
- 통합 플랫폼 API 인터페이스
- Hi5 플랫폼 지원 추가
- 광고, 공유, 인증 통합

```
sdks/
├── SDKInterafce.ts              # SDK 인터페이스 정의
│
├── wxsdk/                       # WeChat 미니게임
│   ├── sdk.ts                   # WeChat SDK
│   ├── wx.d.ts                  # WeChat 타입 정의
│   ├── WxFeedbackButton.ts      # 피드백 버튼
│   ├── WxGameClubButton.ts      # 게임 클럽 버튼
│   └── WxgetInfoButton.ts       # 정보 버튼
│
├── aldsdk/                      # Alipay 미니게임
│   ├── StatHelper.ts            # 통계 헬퍼
│   └── umeng.ts                 # Umeng 분석
│
├── qq/                          # QQ 미니게임
│   ├── qqsdk.ts                 # QQ SDK
│   └── SoundHelper.ts           # 사운드 헬퍼
│
└── ttsdk/                       # ByteDance (TouTiao) 미니게임
    └── ttsdk.ts                 # TT SDK
```

**주요 기능:**
1. **인증 (Auth):**
   - 사용자 정보 조회
   - OpenID 획득
   - 닉네임/아바타

2. **공유 (Share):**
   - 이미지/텍스트 공유
   - 쿼리 파라미터 지원

3. **광고 (Ad):**
   - 배너 광고
   - 리워드 광고
   - 전면 광고

4. **분석 (Analytics):**
   - 이벤트 추적
   - 통계 수집

5. **클라우드 저장:**
   - `mmcloud/`: 미니게임 클라우드 저장
   - 오프라인 데이터 동기화

### Hi5 SDK 통합

**Hi5.ts / hi5.js** (`framework/Hi5/`)
- Hi5 플랫폼 전용 SDK
- 광고 시스템 (`showRewardedAd`)
- 로컬라이제이션 통합
- 콜백 기반 광고 시스템

**Platform.ts의 Hi5 지원:**
```typescript
const isHi5Platform = () => {
    return Hi5 != null;
};

// Hi5 광고 콜백
let hi5AdCallback: Function = null;
let hi5AdTarget: any = null;
let hi5AdFailCallback: Function = null;
```

## 로컬라이제이션 시스템

### LocalizationManager

**위치:** `framework/Hi5/Localization/LocalizationManager.ts`

**주요 기능:**

1. **다국어 지원:**
   - 한국어 (ko) - 기본
   - 영어 (en)
   - 중국어 (cn)

2. **데이터 소스:**
   - CDN 로드 (버전 관리)
   - 로컬 캐시 폴백
   - 번들 JSON 파일

3. **자동 로컬라이징:**
   - 씬 로드 시 자동 적용
   - 키 접두사 (`@`) 기반
   - 라벨, 스프라이트 자동 교체

4. **이미지 로컬라이제이션:**
   - 언어별 이미지 에셋
   - Inspector 설정
   - 자동 전환

5. **CDN 설정:**
```typescript
@property({ tooltip: "CDN에서 로컬라이징 로드 사용" })
useCDN: boolean = true;

@property({ tooltip: "CDN 베이스 URL" })
cdnBaseUrl: string = "https://your-cdn.com/localization/";
```

**사용 예시:**

```typescript
// 1. 로컬라이징 키 사용
label.string = "@ui.title.main_menu";  // 자동 변환

// 2. 코드에서 직접 로컬라이징
let text = LocalizationManager.instance.localize("ui.button.start");

// 3. 언어 변경
LocalizationManager.instance.changeLanguage("en");

// 4. 이미지 로컬라이징
let spriteFrame = LocalizationManager.instance.getLocalizedImage("flag_icon");
```

**TSV → JSON 워크플로우:**

1. Google Sheets에서 TSV 편집
2. `Parkour - main.tsv` 다운로드
3. `convert.bat` 실행 → `Parkour - main.json` 생성
4. CDN 업로드 (선택)

## 빠른 참조

### 자주 사용하는 경로

**프레임워크:**
```
C:\Users\a\Documents\Parkour\assets\framework\
├── core\FSM.ts                     # 상태 머신
├── core\Signal.ts                  # 이벤트 시그널
├── core\DataCenter.ts              # 데이터 저장
├── extension\buffs\BuffSystem.ts   # 버프 시스템
├── extension\Platform.ts           # 플랫폼 API
├── fizzx\fizz.ts                   # 물리 엔진
├── Hi5\Hi5.ts                      # Hi5 SDK
└── Hi5\Localization\LocalizationManager.ts  # 로컬라이제이션
```

**게임 로직:**
```
C:\Users\a\Documents\Parkour\assets\Game\Script\
├── game\Game.ts                    # 게임 메인
├── game\Player.ts                  # 플레이어
├── data\PlayerInfo.ts              # 플레이어 데이터 (pdata)
├── game\behaviors\player\PlayerBuffs.ts     # 플레이어 버프 등록
├── game\behaviors\pet\PetBuffs.ts           # 펫 버프 등록
└── common\configs\GameConfigs.ts            # 게임 설정
```

**UI:**
```
C:\Users\a\Documents\Parkour\assets\Game\Script\ui\
├── UIReady.ts                      # 준비 화면
├── UIHeroShop.ts                   # 영웅 상점
├── UIPet.ts                        # 펫 UI
└── UILevels.ts                     # 레벨 선택
```

**리소스:**
```
C:\Users\a\Documents\Parkour\assets\resources\
├── heros\                          # 영웅 프리팹
├── pets\                           # 펫 프리팹
├── prefabs\                        # 공통 프리팹
├── map\                            # 맵 타일셋
└── Textures\                       # 텍스처 아틀라스
```

### 주요 컴포넌트 사용법

**FSM (Finite State Machine):**
```typescript
import FSM from "framework/core/FSM";

this.fsm = this.addComponent(FSM);
this.fsm.init(this, State);
this.fsm.enterState(State.Normal);
```

**BuffSystem:**
```typescript
import BuffSystem from "framework/extension/buffs/BuffSystem";

this.buffSystem = this.addComponent(BuffSystem);
this.buffSystem.startBuff("buff_invincible", 10);  // 10초간 무적
```

**Signal:**
```typescript
import Signal from "framework/core/Signal";

let signal = new Signal();
signal.add(this.onEvent, this);
signal.fire(data);
signal.remove(this.onEvent, this);
```

**DataCenter:**
```typescript
import { dc } from "framework/core/DataCenter";

@dc("player.level")
level: number = 1;  // 자동 저장/로드
```

**LocalizationManager:**
```typescript
import { LocalizationManager } from "framework/Hi5/Localization/LocalizationManager";

// 자동 로컬라이징 (라벨의 string이 @로 시작)
label.string = "@ui.title.main_menu";

// 코드에서 로컬라이징
let text = LocalizationManager.instance.localize("ui.button.start");

// 언어 변경
LocalizationManager.instance.changeLanguage("en");
```

### 개발 명령어

```bash
# CSV → TypeScript 타입 생성
npm run csv-dts

# JSON → CSV 변환
npm run tocsv

# Enum 생성
npm run gen-enums

# TSV → JSON 변환 (로컬라이제이션)
cd assets/framework/Hi5/Localization
node tsv-to-json.js
```

### 디버깅 팁

1. **물리 디버그:**
   - FizzManager의 `debug` 모드 활성화
   - 충돌 박스 시각화

2. **버프 디버그:**
   - BuffSystem의 `debugMode` 활성화
   - 콘솔에서 버프 상태 확인

3. **로컬라이제이션 디버그:**
   - LocalizationManager의 `debugMode: true`
   - 누락 키 경고 확인

4. **FSM 디버그:**
   - FSM 상태 전환 로그
   - `fsm.currentState` 확인

---

## 관련 문서

- **CLAUDE.md**: Claude Code 개발 가이드
- **README-New-Project-Setup.md**: 새 프로젝트 설정 가이드
- **docs/**: 프로젝트 문서 폴더
- **.claude/skills/**: Claude 스킬 정의

---

**작성일**: 2026-01-09
**엔진 버전**: Cocos Creator 2.4.13
**프로젝트**: Parkour (49FriendsRunner)
