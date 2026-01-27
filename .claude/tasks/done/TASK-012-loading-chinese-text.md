# TASK-012: 로딩 화면 중국어 텍스트 로컬라이징

## 상태: ✅ Done (2026-01-23)

## 문제 설명
챌린지 모드 레벨 클리어 후 결과팝업 등장 직전, 입장/퇴장 시 로딩 텍스트가 중국어로 표시됨.

## 관련 파일
- `assets/Game/Script/common/LoadingScene.ts` - 메인 로딩 화면 (184-220줄)
- `assets/framework/ui/game/SubpackageLoader.ts` - 서브패키지 로더 (64, 84줄)
- `assets/framework/Hi5/Localization/LocalizationManager.ts` - 로컬라이징 매니저

## 분석
### 하드코딩된 중국어 텍스트

**LoadingScene.ts (lines 184-220)**
```typescript
this.labelTip.string = "登录失败"      // 로그인 실패
this.labelTip.string = "加载中"        // 로딩 중
this.labelTip.string = "登录中"        // 로그인 중
this.labelTip.string = "加载配置"      // 설정 로딩
this.labelTip.string = "加载本地配置"   // 로컬 설정 로딩
this.labelTip.string = "加载网络配置"   // 네트워크 설정 로딩
this.labelTip.string = "加载分享配置"   // 공유 설정 로딩
this.labelTip.string = "进入游戏..."    // 게임 진입...
```

**SubpackageLoader.ts (lines 64, 84)**
```typescript
this.label.string = "加载[" + name + "]中"      // [name] 로딩 중
this.label.string = "加载失败,请点击重试!"      // 로딩 실패, 다시 시도하세요
```

## 수정 계획

### 1. 로컬라이징 키 추가
CDN JSON 또는 로컬 JSON에 키 추가:
```json
{
  "loading.failed": "로딩 실패",
  "loading.progress": "로딩 중",
  "loading.login": "로그인 중",
  "loading.config": "설정 로딩",
  "loading.config.local": "로컬 설정 로딩",
  "loading.config.network": "네트워크 설정 로딩",
  "loading.config.share": "공유 설정 로딩",
  "loading.entering": "게임 진입 중...",
  "loading.subpackage": "{0} 로딩 중",
  "loading.retry": "로딩 실패. 다시 시도해주세요"
}
```

### 2. LoadingScene.ts 수정
```typescript
// 변경 전
this.labelTip.string = "登录失败"

// 변경 후
this.labelTip.string = LocalizationManager.getText("loading.failed")
```

### 3. SubpackageLoader.ts 수정
```typescript
// 변경 전
this.label.string = "加载[" + name + "]中"

// 변경 후
this.label.string = LocalizationManager.getText("loading.subpackage").replace("{0}", name)
```

## 예상 수정 파일
1. `LoadingScene.ts` - 8개 텍스트 로컬라이징 적용
2. `SubpackageLoader.ts` - 2개 텍스트 로컬라이징 적용
3. 로컬라이징 JSON - 10개 키 추가

## 참고
`LoadingSceneBase.ts`는 이미 `LocalizationManager.getText()` 사용 중 - 패턴 참조 가능

---

## ✅ 실제 코드 변경 (2026-01-23)

### 파일 1: `assets/Game/Script/common/LoadingScene.ts`

**변경 1: status setter 수정**
```typescript
// 변경 전
set status(v) {
    this._status = v;
    if (v == -1) {
        this.labelTip.string = "登录失败"
    } else if (v == 1) {
        this.labelTip.string = "加载中"
    } else {
        this.labelTip.string = "加载中"
    }
}

// 변경 후
set status(v) {
    this._status = v;
    const { LocalizationManager } = require("../../../framework/Hi5/Localization/LocalizationManager");
    if (v == -1) {
        this.labelTip.string = LocalizationManager.getText("@loading.login_failed") || "로그인 실패"
    } else if (v == 1) {
        this.labelTip.string = LocalizationManager.getText("@loading.progress") || "로딩 중"
    } else {
        this.labelTip.string = LocalizationManager.getText("@loading.progress") || "로딩 중"
    }
}
```

**변경 2: loginProgress() 메서드 수정**
```typescript
// 변경 후 (모든 중국어 텍스트 → LocalizationManager 적용)
loginProgress(evt) {
    const { LocalizationManager } = require("../../../framework/Hi5/Localization/LocalizationManager");
    switch (evt) {
        case 'login':
            this.labelTip.string = LocalizationManager.getText("@loading.login") || "로그인 중"
            // ...
        case 'config':
            this.labelTip.string = LocalizationManager.getText("@loading.config") || "설정 로딩"
            // ...
        case 'local_csv':
            this.labelTip.string = LocalizationManager.getText("@loading.config_local") || "로컬 설정 로딩"
            // ...
        case "csv":
            this.labelTip.string = LocalizationManager.getText("@loading.config_network") || "네트워크 설정 로딩"
            // ...
        case 'share_config':
            this.labelTip.string = LocalizationManager.getText("@loading.config_share") || "공유 설정 로딩"
            // ...
        case "complete":
            this.labelTip.string = LocalizationManager.getText("@loading.entering") || "게임 진입 중..."
            // ...
    }
}
```

### 파일 2: `assets/framework/ui/game/SubpackageLoader.ts`

**변경 1: showStatus() 메서드**
```typescript
// 변경 전
if (this.label)
    this.label.string = "加载[" + name + "]中"

// 변경 후
if (this.label) {
    const { LocalizationManager } = require("../../Hi5/Localization/LocalizationManager");
    const loadingText = LocalizationManager.getText("@loading.subpackage") || "[{0}] 로딩 중";
    this.label.string = loadingText.replace("{0}", name);
}
```

**변경 2: catch 블록 에러 메시지**
```typescript
// 변경 전
if (this.label)
    this.label.string = "加载失败,请点击重试!"

// 변경 후
if (this.label) {
    const { LocalizationManager } = require("../../Hi5/Localization/LocalizationManager");
    this.label.string = LocalizationManager.getText("@loading.retry") || "로딩 실패. 다시 시도해주세요";
}
```

### 파일 3: `assets/framework/Hi5/Localization/Parkour - main.json`

**추가된 로컬라이징 키 (ko/en/cn 모두)**
```json
"loading.login_failed": "로그인 실패",
"loading.progress": "로딩 중",
"loading.login": "로그인 중",
"loading.config": "설정 로딩",
"loading.config_local": "로컬 설정 로딩",
"loading.config_network": "네트워크 설정 로딩",
"loading.config_share": "공유 설정 로딩",
"loading.entering": "게임 진입 중...",
"loading.subpackage": "[{0}] 로딩 중",
"loading.retry": "로딩 실패. 다시 시도해주세요"
```
