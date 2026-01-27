# TASK-009: 사운드 설정 버그 수정

## 상태: ✅ Done (2026-01-23)

## 문제 설명
설정에서 사운드를 조작하다 보면 모든 사운드가 꺼지는 현상 발생.
설정한대로만 사운드가 켜지고 꺼져야 함.

## 관련 파일
- `assets/Game/Script/ui/UISetting.ts` - 설정 UI 컴포넌트
- `assets/framework/extension/weak_net_game/SettingInfo.ts` - 설정 데이터 저장
- `assets/framework/core/Device.ts` - 오디오 제어

## 분석
### 현재 구조
1. **UISetting.ts**: BGM, SFX, 진동 토글 버튼 클릭 핸들러
2. **SettingInfo.ts**: `music`, `effect`, `vibrate`, `volume_bgm` 저장
3. **Device.ts**: `setBGMEnable()`, `setSFXEnable()` 정적 메서드

### 의심되는 원인
- 토글 상태와 실제 오디오 상태 불일치
- `saveSettings()` 호출 순서 문제
- BGM 재생 중 SFX 토글 시 모두 꺼지는 현상

## 수정 계획
1. `UISetting.ts` 클릭 핸들러 로직 검토
2. `SettingInfo.ts`의 `saveSettings()` 호출 시점 확인
3. `Device.ts`의 `setBGMEnable()/setSFXEnable()` 상호 영향 검토
4. 토글 시 다른 설정에 영향 없도록 독립적 처리

## 예상 수정 내용
```typescript
// UISetting.ts - 각 토글이 독립적으로 동작하도록 수정
click_musicOn() {
    SettingInfo.music = true;
    Device.setBGMEnable(true);
    // SFX 상태는 건드리지 않음
}

click_musicOff() {
    SettingInfo.music = false;
    Device.setBGMEnable(false);
    // SFX 상태는 건드리지 않음
}
```

## 테스트 시나리오
1. BGM ON → SFX OFF → SFX ON → BGM 재생 확인
2. SFX ON → BGM OFF → BGM ON → SFX 재생 확인
3. 앱 재시작 후 설정 유지 확인

---

## ✅ 실제 코드 변경 (2026-01-23)

### 파일: `assets/Game/Script/ui/UISetting.ts`

**변경 1: 진동 토글 visibility 수정**
```typescript
// 변경 전 (잘못된 연결 - music에 연결됨)
this.onVisible(this.hendleControlOn, () => !SettingInfo.music);
this.onVisible(this.hendleControlOff, () => SettingInfo.music);

// 변경 후 (올바른 연결 - vibrate에 연결)
this.onVisible(this.hendleControlOn, () => !SettingInfo.vibrate);
this.onVisible(this.hendleControlOff, () => SettingInfo.vibrate);
```

**변경 2: 진동 클릭 핸들러 수정**
```typescript
// 변경 전 (주석 처리된 빈 핸들러)
click_hendleControlOn() {
    // SettingInfo.music = true;
    // SettingInfo.save("music");
    this.render();
}

click_hendleControlOff() {
    // SettingInfo.music = true;
    // SettingInfo.save("music");
    this.render();
}

// 변경 후 (실제 진동 설정 변경)
click_hendleControlOn() {
    Device.setVibrateEnable(true);
    SettingInfo.saveSettings();
    this.render();
}

click_hendleControlOff() {
    Device.setVibrateEnable(false);
    SettingInfo.saveSettings();
    this.render();
}
