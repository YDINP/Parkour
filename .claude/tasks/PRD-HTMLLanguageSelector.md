# PRD: HTML 언어선택기 기능

## 개요

웹 빌드(web-mobile)에서 HTML 레이어에 드래그 가능한 언어 선택기 UI를 제공하여, 사용자가 게임 내에서 실시간으로 언어를 변경할 수 있도록 합니다.

## 현재 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| `language-selector.js` | O 구현됨 | `build-templates/web-mobile/` |
| `language-selector.css` | O 구현됨 | `build-templates/web-mobile/` |
| `index.html` 통합 | O 구현됨 | CSS/JS 로드 및 Bridge 코드 포함 |
| LocalizationManager 연동 | ? 확인 필요 | `window.LocalizationManager` 노출 여부 |

## 기능 명세

### 1. 언어선택기 UI (language-selector.js)

```
지원 언어:
- ko: 한국어 (flag: 🇰🇷)
- en: English (flag: 🇺🇸)
- cn: 中文 (flag: 🇨🇳)
- key: 키값 (flag: 🔑) - 개발용
```

#### 기능
- **드래그 가능**: 사용자가 위치 이동 가능, localStorage에 위치 저장
- **언어 저장**: localStorage `game_language` 키에 저장
- **실시간 변경**: postMessage를 통해 Cocos 엔진과 통신

### 2. HTML ↔ Cocos 통신 (Bridge)

```javascript
// HTML → Cocos (언어 변경)
window.postMessage({
    type: 'LANGUAGE_CHANGE',
    language: 'ko',
    source: 'language-selector'
}, '*');

// Cocos → HTML (언어 동기화)
window.syncLanguageToHTML('ko');

// 선택기 표시/숨김
window.showLanguageSelector();
window.hideLanguageSelector();
```

### 3. LocalizationManager 연동

```typescript
// LocalizationManager에서 window 객체에 노출 필요
(window as any).LocalizationManager = LocalizationManager;
```

## 필요 작업

### TASK 1: LocalizationManager window 노출 확인

- [ ] `LocalizationManager.ts`에서 `window.LocalizationManager` 노출 여부 확인
- [ ] 미노출 시 코드 추가

### TASK 2: 언어 변경 시 전체 씬 갱신

- [ ] `setLanguage()` 호출 시 현재 씬의 모든 Label 갱신 로직 확인
- [ ] 필요 시 `localizeAllActiveNodes()` 자동 호출

### TASK 3: (선택) 키값 모드 제거

- [ ] 프로덕션 빌드 시 `key` 언어 옵션 제거 고려

## 의존성

- `assets/framework/Hi5/Localization/LocalizationManager.ts`
- `build-templates/web-mobile/index.html`
- `build-templates/web-mobile/language-selector.js`
- `build-templates/web-mobile/language-selector.css`

## 테스트 계획

1. 웹 빌드 후 브라우저에서 실행
2. 언어 선택기가 화면 우상단에 표시되는지 확인
3. 언어 변경 시 게임 내 텍스트가 즉시 변경되는지 확인
4. 새로고침 후 선택한 언어가 유지되는지 확인
5. 드래그로 위치 이동 후 새로고침해도 위치가 유지되는지 확인
