# PRD: 웹페이지 타이틀 동적 변경

## 개요

웹 빌드(web-mobile)에서 게임 버전 정보(`GameVersion.ts`)를 기반으로 브라우저 탭 타이틀을 동적으로 업데이트합니다. iframe 내에서 실행될 때 부모 페이지의 타이틀도 함께 변경합니다.

## 현재 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| `index.html` 타이틀 로직 | O 구현됨 | `build-templates/web-mobile/index.html` |
| `GameVersion.ts` | O 구현됨 | `assets/Game/Script/common/GameVersion.ts` |
| window 객체 노출 | ? 확인 필요 | `window.GameVersion` 접근 가능 여부 |

## 기능 명세

### 1. 초기 타이틀 설정 (index.html)

```html
<title>49FriendsRunner v0.1.0</title>
<script>
    var gameTitle = '49FriendsRunner v0.1.0';
    document.title = gameTitle;
    if (window.parent && window.parent !== window) {
        window.parent.document.title = gameTitle;  // iframe 부모
    }
</script>
```

### 2. 동적 타이틀 업데이트

```javascript
window.addEventListener('load', function() {
    setTimeout(function() {
        if (window.GameVersion) {
            var title = window.GameVersion.projectName + ' v' + window.GameVersion.version;
            document.title = title;
            // iframe 부모 페이지도 업데이트
            if (window.parent && window.parent !== window) {
                window.parent.document.title = title;
            }
        }
    }, 500);  // Cocos 엔진 로드 대기
});
```

### 3. GameVersion 구조

```typescript
// assets/Game/Script/common/GameVersion.ts
export const GameVersion = {
    version: "0.1.0",
    projectName: "49FriendsRunner"
};
```

## 필요 작업

### TASK 1: GameVersion window 노출

현재 `GameVersion`은 TypeScript 모듈로 export되어 있어 `window.GameVersion`으로 접근 불가능합니다.

**해결 방법 A: GameVersion.ts에서 직접 노출**
```typescript
export const GameVersion = {
    version: "0.1.0",
    projectName: "49FriendsRunner"
};

// window 객체에 노출
if (typeof window !== 'undefined') {
    (window as any).GameVersion = GameVersion;
}
```

**해결 방법 B: 게임 시작 시 노출**
```typescript
// Loading 씬 또는 main.ts에서
import { GameVersion } from './common/GameVersion';
(window as any).GameVersion = GameVersion;
```

### TASK 2: (선택) 캐시 제어 메타 태그 추가

Kapi 프로젝트처럼 캐시 제어 메타 태그 추가:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### TASK 3: (선택) 타이틀 업데이트 타이밍 개선

500ms 대기 대신 이벤트 기반으로 변경:
```javascript
// Cocos 씬 로드 완료 시 타이틀 업데이트
cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function() {
    if (window.GameVersion) {
        document.title = window.GameVersion.projectName + ' v' + window.GameVersion.version;
    }
});
```

## 의존성

- `assets/Game/Script/common/GameVersion.ts`
- `build-templates/web-mobile/index.html`

## 테스트 계획

1. 웹 빌드 후 브라우저에서 실행
2. 브라우저 탭 타이틀이 `49FriendsRunner v0.1.0`으로 표시되는지 확인
3. 개발자 도구 콘솔에서 `window.GameVersion` 접근 가능 여부 확인
4. iframe 내 로드 시 부모 페이지 타이틀도 변경되는지 확인

## 버전 업데이트 가이드

버전 업데이트 시 다음 파일들을 수정해야 합니다:

1. `assets/Game/Script/common/GameVersion.ts` - version 값 수정
2. `build-templates/web-mobile/index.html` - title 태그 및 gameTitle 변수 수정 (선택사항, 동적 업데이트로 덮어씀)
