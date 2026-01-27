# TASKS: 버그 수정 2차

> 관련 PRD: [PRD-BugFixRound2.md](./PRD-BugFixRound2.md)
> 작성일: 2026-01-26
> 참조: kapi 프로젝트 (`C:\Users\a\Documents\kapi`)

---

## Category A: Hi5 SDK 광고 연동

> **참조 파일 (kapi)**:
> - `assets/_script/AdUtils.js` - 광고 호출 유틸리티
> - `assets/_script/Butler.js` - SDK 메시지 핸들링
> - `assets/Hi5/Hi5SDK.ts` - SDK API 정의

### TASK A.1: 광고 유틸리티 구현

**파일**: `assets/framework/Hi5/AdManager.ts` (신규 생성)

**kapi 패턴 참조 구현**:

```typescript
// AdManager.ts - kapi의 AdUtils.js 패턴 참조
import { Hi5 } from "./Hi5SDK";

export enum AdType {
    TRIPLE_REWARD = "reward_triple",      // 클리어 3배 획득
    REVIVE = "reward_revive",             // 릴레이 영웅 소환
    HERO_SUMMON = "reward_hero",          // 프렌즈 소환
    PET_HATCH = "reward_pet",             // 펫 뽑기 고급 알
    HEART = "reward_heart",               // 하트 획득
    DIAMOND = "reward_diamond"            // 다이아 획득
}

export class AdManager {
    private static _instance: AdManager;
    private callback: (success: boolean) => void = null;
    private hasCalledCallback: boolean = false;

    static get instance(): AdManager {
        if (!this._instance) {
            this._instance = new AdManager();
        }
        return this._instance;
    }

    /**
     * 보상형 광고 시청 요청 (kapi AdUtils.showAdRewardVideo 패턴)
     */
    showRewardAd(adType: AdType, callback: (success: boolean) => void): void {
        console.log("[AdManager] showRewardAd:", adType);

        this.callback = callback;
        this.hasCalledCallback = false;

        // 게임 일시정지 (kapi: cc.butler.pauseDirector)
        cc.director.pause();

        // 음악 일시정지
        cc.audioEngine.pauseMusic();

        // Hi5 SDK 광고 로드 요청
        Hi5.loadAd({ aid: adType, key: adType });
    }

    /**
     * SDK 메시지 핸들러 (kapi Butler.js 패턴)
     * Hi5 메시지 리스너에서 호출
     */
    handleLoadAdMessage(data: any): void {
        if (data.status === 0) {
            // 광고 로드 성공 → 광고 표시
            Hi5.showAd(Hi5.lastAd);
        } else {
            // 광고 로드 실패
            this.callRewardCallback(false);
        }
    }

    handleShowAdMessage(data: any): void {
        if (data.status === 0) {
            const adType = data.type;

            if (adType === "show" || adType === "userEarnedReward") {
                // 광고 표시됨 또는 보상 획득
                Hi5.lastShowAd = true;
            } else if (adType === "dismissed") {
                // 광고 닫힘 → 콜백 호출
                const success = Hi5.lastShowAd && Hi5.lastAd;
                this.callRewardCallback(success);
            }
        } else {
            // 광고 표시 실패
            this.callRewardCallback(false);
        }
    }

    /**
     * 광고 결과 콜백 (kapi AdUtils.callRewardAdCallback 패턴)
     */
    private callRewardCallback(success: boolean): void {
        // 게임 재개
        cc.director.resume();

        // 음악 재개
        cc.audioEngine.resumeMusic();

        if (this.hasCalledCallback) {
            console.log("[AdManager] Callback already called");
            return;
        }

        if (this.callback) {
            this.callback(success);
            this.hasCalledCallback = true;
        }

        // 초기화
        this.callback = null;
        Hi5.lastAd = null;
        Hi5.lastShowAd = false;
    }
}
```

### TASK A.2: Hi5 메시지 핸들러 등록

**파일**: `assets/framework/Hi5/Hi5SDK.ts` 또는 메인 게임 초기화 파일

```typescript
// Hi5 메시지 리스너에 광고 핸들러 추가
Hi5.on(Hi5Message.LOAD_AD, (data) => {
    AdManager.instance.handleLoadAdMessage(data.data);
});

Hi5.on(Hi5Message.SHOW_AD, (data) => {
    AdManager.instance.handleShowAdMessage(data.data);
});
```

### TASK A.3: 기존 광고 호출 코드 수정

#### 이슈 #8: 클리어 3배 획득 (UIEndPage.ts)

```typescript
// 기존 코드 (line ~277-287)
click_triple() {
    Loading.show(1);
    Platform.watch_video(() => {
        Loading.hide();
        // 보상 3배 로직
    });
}

// 수정 코드
click_triple() {
    AdManager.instance.showRewardAd(AdType.TRIPLE_REWARD, (success) => {
        if (success) {
            // 보상 3배 로직
            this.tripleReward();
        }
    });
}
```

#### 이슈 #9: 릴레이 영웅 소환 (UIRevive.ts)

```typescript
// 수정 코드
click_revive() {
    AdManager.instance.showRewardAd(AdType.REVIVE, (success) => {
        if (success) {
            // 영웅 부활 로직
            this.doRevive();
        }
    });
}
```

#### 이슈 #16: 프렌즈 소환 영상보기 (UIReviveItem.ts)

```typescript
// 수정 코드
enterGame() {
    AdManager.instance.showRewardAd(AdType.HERO_SUMMON, (success) => {
        if (success) {
            // 영웅 소환 로직
            this.doSummon();
        }
    });
}
```

#### 이슈 #17: 펫 뽑기 고급 알 (UIhatchPet.ts)

```typescript
// 수정 코드
click_hatch() {
    if (this.isAdHatch) {
        AdManager.instance.showRewardAd(AdType.PET_HATCH, (success) => {
            if (success) {
                // 무료 뽑기 로직
                this.doHatch();
            }
        });
    } else {
        // 유료 뽑기 로직
        this.doHatch();
    }
}
```

---

## Category B: 코드 수정 필요

### TASK B.1: 사운드 설정 버그 수정 (이슈 #1)

**파일**: `assets/Game/Script/ui/UISetting.ts`

**현상**: 설정에서 사운드 조작 시 모든 사운드가 꺼짐

**확인 사항**:
1. `SettingInfo.onLoadAll()` 호출 시 Device 플래그 동기화 확인
2. `saveSettings()` 호출 시 올바른 값 저장 확인
3. 토글 버튼 클릭 시 올바른 메서드 호출 확인

**예상 수정**:
```typescript
// UISetting.ts - 기존 로직 확인 후 필요시 수정
click_musicOn() {
    Device.setBGMEnable(true);
    SettingInfo.saveSettings();
    this.render();
}

click_musicOff() {
    Device.setBGMEnable(false);
    SettingInfo.saveSettings();
    this.render();
}

click_musicEffectOn() {
    Device.setSFXEnable(true);
    SettingInfo.saveSettings();
    this.render();
}

click_musicEffectOff() {
    Device.setSFXEnable(false);
    SettingInfo.saveSettings();
    this.render();
}
```

---

### TASK B.2: 네오 스킬 설명 전환 형식 (이슈 #2)

**파일**:
- `assets/Game/Script/ui/heroItem.ts`
- `assets/framework/Hi5/Localization/Parkour - hero.json`

**구현**:
```typescript
// heroItem.ts에 네오 전용 로직 추가
private currentSkill: boolean = false;
private neoScheduleId: any = null;

updateLabelsOnly() {
    if (this.data.id === "8") {
        // 네오 전용 전환 애니메이션
        this.startNeoSkillAnimation();
    } else {
        // 일반 스킬 설명
        this.stopNeoSkillAnimation();
        this.skillDisLab.string = LocalizationManager.getText(`@hero.${this.data.id}.skill`);
    }
}

private startNeoSkillAnimation() {
    this.stopNeoSkillAnimation();

    const skill1 = LocalizationManager.getText("@hero.8.skill1");
    const skill2 = LocalizationManager.getText("@hero.8.skill2");

    // 초기 표시
    this.skillDisLab.string = skill1;
    this.skillDisLab.node.opacity = 255;
    this.currentSkill = false;

    this.neoScheduleId = this.schedule(() => {
        cc.tween(this.skillDisLab.node)
            .to(0.5, { opacity: 0 })
            .call(() => {
                this.currentSkill = !this.currentSkill;
                this.skillDisLab.string = this.currentSkill ? skill2 : skill1;
            })
            .to(0.5, { opacity: 255 })
            .start();
    }, 4); // 3초 표시 + 1초 전환
}

private stopNeoSkillAnimation() {
    if (this.neoScheduleId) {
        this.unschedule(this.neoScheduleId);
        this.neoScheduleId = null;
    }
    cc.Tween.stopAllByTarget(this.skillDisLab.node);
}

onDisable() {
    this.stopNeoSkillAnimation();
}
```

**로컬라이징 키 추가** (`Parkour - hero.json`):
```json
{
    "@hero.8.skill1": "블랙홀 소환 / 쿨타임 24초",
    "@hero.8.skill2": "3단 점프"
}
```

---

### TASK B.4: 챌린지 모드 결과 버튼 키 변경 (이슈 #4)

**파일**: `assets/resources/prefabs/UIEndPage.prefab`

**수정**: UIEndPage.prefab에서 btn_next 노드의 LocalizedLabel 컴포넌트 키를 `@receive.normal`로 변경

> **사용자 처리 필요**: Cocos Creator 에디터에서 prefab 수정

---

### TASK B.6: 플레이어 기본 데이터 수정 (이슈 #6)

**파일**: `assets/Game/Script/data/PlayerInfo.ts`

**수정**:
```typescript
// PlayerInfo.ts - 기본값 수정
@field()
gold: number = 1000;  // 기존값에서 1000으로 변경

@field()
diamond: number = 0;  // 기존값에서 0으로 변경
```

> **치트 기능**: 보류 (필요시 추후 구현)

---

### TASK B.7: 레벨 클리어 저장 버그 (이슈 #7)

**파일**: `assets/Game/Script/ui/UIEndPage.ts`

**수정**:
```typescript
// UIEndPage.ts (line 251-254 부근)
if (pdata.level == pdata.playinglv && pdata.isGameWin) {
    pdata.level++;
    pdata.save("level");  // 즉시 저장 추가
}
```

---

### TASK B.10: 다이아 충전 일일 제한 (이슈 #10)

**파일**:
- `assets/Game/Script/data/PlayerInfo.ts`
- `assets/Game/Script/ui/UIRedHeartAndDiamond.ts`

**PlayerInfo.ts 수정**:
```typescript
@field()
freeDiamondCount: number = 3;

@field()
freeDiamondDate: string = "";  // YYYY-MM-DD 형식

checkDailyDiamondReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.freeDiamondDate !== today) {
        this.freeDiamondCount = 3;
        this.freeDiamondDate = today;
        this.save("freeDiamondCount,freeDiamondDate");
    }
}
```

**UIRedHeartAndDiamond.ts 수정**:
```typescript
@property(cc.Label)
countLabel: cc.Label = null;

onShow() {
    pdata.checkDailyDiamondReset();
    this.updateCountLabel();
}

click_get() {
    pdata.checkDailyDiamondReset();

    if (pdata.freeDiamondCount <= 0) {
        Toast.make(LocalizationManager.getText("@text.daily_limit_reached"));
        return;
    }

    AdManager.instance.showRewardAd(AdType.DIAMOND, (success) => {
        if (success) {
            pdata.freeDiamondCount--;
            pdata.diamond += this.rewardAmount;
            pdata.save("freeDiamondCount,diamond");
            this.updateCountLabel();
        }
    });
}

updateCountLabel() {
    this.countLabel.string = `${pdata.freeDiamondCount}/3`;
}
```

---

### TASK B.12: 튜토리얼 맵 이름 로컬라이징 (이슈 #12)

**파일**:
- `assets/Game/Script/game/views/GameLayerTop.ts`
- `assets/framework/Hi5/Localization/Parkour - Level.json`

**GameLayerTop.ts 수정** (line 77 부근):
```typescript
if (pdata.gameMode == ParkourType.Normal) {
    if (pdata.playinglv === 0) {
        this.label_level.string = LocalizationManager.getText("@map.name.tutorial");
    } else {
        let lvdata = ccUtil.get(LevelData, pdata.playinglv);
        this.label_level.string = lvdata.name;
    }
}
```

**로컬라이징 키 추가** (`Parkour - Level.json`):
```json
{
    "@map.name.tutorial": "튜토리얼"
}
```

---

### TASK B.14: 거인화 후 무적 시간 추가 (이슈 #14)

**파일**: `assets/Game/Script/game/behaviors/player/Stronger.ts`

**수정**:
```typescript
// Stronger.ts - onDisable 수정
onDisable() {
    this.player.setNormalSize();

    // 거인화 종료 후 1.5초 무적 (깜빡임 없음)
    this.player.buffSystem.startBuff("invincible", 1.5, false);
}
```

---

## Category D: 조사 필요

### TASK D.7: 무한모드 튜토리얼 해상도 (이슈 #7 일부)

**조사 파일**:
- `assets/Game/Script/game/Guide.ts`
- `assets/framework/extension/guide/GuiderLayer.ts`
- `assets/Game/Scenes/Home.fire`
- `assets/Game/Scenes/Main.fire`

### TASK D.11: 로딩 48.6→52.6 지연 (이슈 #11)

**조사 방법**:
1. 콘솔에서 에셋 로드 타이밍 로그 추가
2. WeakNetGame.ts의 각 단계 시간 측정

### TASK D.15: 맵 세로줄 아티팩트 (이슈 #15)

**가능한 원인**:
1. 타일셋 텍스처 가장자리 bleeding
2. 안티앨리어싱 설정
3. 카메라 서브픽셀 렌더링

---

## 사용자 처리 필요 사항

### Cocos Creator 에디터 작업

| TASK | 작업 내용 | 파일 |
|------|----------|------|
| B.4 | btn_next 노드의 LocalizedLabel 키를 `@receive.normal`로 변경 | UIEndPage.prefab |
| B.10 | countLabel 노드 연결 확인 | UIRedHeartAndDiamond.prefab |

### 에디터 작업 이슈 (Category C - 제외됨)

| 이슈 | 작업 내용 | 파일 |
|------|----------|------|
| #3 | 캐릭터 구매 팝업 내용/버튼 Y축 상향 | UITextConfirm.prefab |
| #18 | 하트 충전 팝업 Z-Order 조정 | - |
| #19 | 펫 뽑기 코인 차감 위치 (가로모드) | - |

### 로컬라이징 키 추가

| 파일 | 키 | 값 |
|------|---|-----|
| Parkour - hero.json | @hero.8.skill1 | 블랙홀 소환 / 쿨타임 24초 |
| Parkour - hero.json | @hero.8.skill2 | 3단 점프 |
| Parkour - Level.json | @map.name.tutorial | 튜토리얼 |
| main.json | @text.daily_limit_reached | 일일 획득 횟수를 초과했습니다 |

---

## 검증 절차

### 1. 광고 연동 검증 (Category A)

```bash
# 브라우저 콘솔에서 테스트
# 1. 광고 로드/표시 확인
Hi5.loadAd({ aid: 'reward_triple', key: 'reward_triple' });

# 2. 각 기능별 광고 시청 후 보상 확인
# - 클리어 3배 획득: 결과 화면에서 3배 버튼 클릭
# - 릴레이 영웅 소환: 게임 오버 후 부활 버튼 클릭
# - 프렌즈 소환: 영웅 소환 화면에서 영상보기 클릭
# - 펫 뽑기: 펫 뽑기 화면에서 무료 버튼 클릭
```

### 2. 코드 수정 검증 (Category B)

| TASK | 검증 방법 |
|------|----------|
| B.1 | 설정 화면에서 BGM/SFX 각각 토글 후 소리 확인 |
| B.2 | 네오 캐릭터 선택 후 스킬 설명 3초 간격 전환 확인 |
| B.4 | 챌린지 모드 클리어 후 결과 화면 버튼 텍스트 확인 |
| B.6 | 새 게임 시작 시 코인 1000, 다이아 0 확인 |
| B.7 | 레벨 클리어 후 새로고침, 레벨 유지 확인 |
| B.10 | 다이아 광고 3회 시청 후 제한 메시지 확인, 다음 날 리셋 확인 |
| B.12 | 튜토리얼 시작 시 맵 이름 "튜토리얼" 표시 확인 |
| B.14 | 거인화 종료 후 1.5초 무적 확인 (장애물 통과) |

### 3. 검증 체크리스트

```markdown
## 광고 연동 (A)
- [ ] 광고 로드 요청 → LOAD_AD 메시지 수신
- [ ] 광고 표시 → SHOW_AD(type: show) 메시지 수신
- [ ] 광고 완료 → SHOW_AD(type: userEarnedReward) 메시지 수신
- [ ] 광고 닫힘 → SHOW_AD(type: dismissed) 메시지 수신
- [ ] 보상 지급 정상 동작
- [ ] 광고 실패 시 게임 복귀

## 코드 수정 (B)
- [ ] #1: BGM/SFX 독립 제어
- [ ] #2: 네오 스킬 전환 애니메이션
- [ ] #4: 챌린지 결과 버튼 키
- [ ] #6: 기본 코인/다이아 값
- [ ] #7: 레벨 저장
- [ ] #10: 다이아 일일 제한
- [ ] #12: 튜토리얼 맵 이름
- [ ] #14: 거인화 후 무적
```

---

## 우선순위

1. **High**: TASK B.1 (사운드), TASK B.7 (레벨 저장)
2. **Medium**: TASK A.1-A.3 (광고 연동), TASK B.2, B.4, B.10, B.12, B.14
3. **Low**: TASK B.6 (기본 데이터), D.7, D.11, D.15

---

## 체크리스트

### Category A (SDK 광고)
- [x] TASK A.1: AdManager 구현
- [x] TASK A.2: Hi5 메시지 핸들러 등록
- [x] TASK A.3: 기존 광고 호출 코드 수정 (4개 파일)

### Category B (코드 수정)
- [x] TASK B.1: 사운드 설정 버그 수정
- [x] TASK B.2: 네오 스킬 설명 전환 형식
- [ ] TASK B.4: 챌린지 모드 결과 버튼 키
- [x] TASK B.6: 플레이어 기본 데이터 수정
- [x] TASK B.7: 레벨 클리어 저장 버그
- [x] TASK B.10: 다이아 충전 일일 제한
- [x] TASK B.12: 튜토리얼 맵 이름 로컬라이징
- [x] TASK B.14: 거인화 후 무적 시간

### Category D (조사) - ✅ 완료
- [x] TASK D.7: 무한모드 튜토리얼 해상도 조사 → Widget 충돌 (UIGuider + UIReady)
- [x] TASK D.11: 로딩 지연 원인 조사 → CDN CSV 순차 다운로드 병목
- [x] TASK D.15: 맵 세로줄 아티팩트 조사 → Texture Bleeding + Bilinear 필터링
