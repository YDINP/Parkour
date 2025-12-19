# Localization System Guide

Cocos Creator 2.x 프로젝트의 다국어(로컬라이징) 시스템 사용 가이드입니다.

---

## 목차

1. [파일 구조](#1-파일-구조)
2. [JSON 파일 형식](#2-json-파일-형식)
3. [초기화 설정](#3-초기화-설정)
4. [Label 로컬라이징](#4-label-로컬라이징-자동)
5. [코드에서 텍스트 가져오기](#5-코드에서-텍스트-가져오기)
6. [노드/Label 수동 로컬라이징](#6-노드label-수동-로컬라이징)
7. [프리펩 인스턴스화](#7-프리펩-인스턴스화-자동-로컬라이징)
8. [이미지 로컬라이징](#8-이미지-로컬라이징) ⭐ NEW
9. [언어 변경](#9-언어-변경)
10. [동적 JSON 추가](#10-동적-json-추가-런타임)
11. [사용 예시](#11-사용-예시)
12. [키 네이밍 컨벤션](#12-키-네이밍-컨벤션)
13. [디버그 모드](#13-디버그-모드)
14. [체크리스트](#14-체크리스트)
15. [주의사항](#15-주의사항)
16. [다른 프로젝트로 복사](#16-다른-프로젝트로-복사) ⭐ NEW

---

## 1. 파일 구조

```
assets/Localization/
├── LocalizationManager.ts      # 로컬라이징 매니저 (TypeScript)
├── LocalizationManager.js      # 로컬라이징 매니저 (JavaScript)
├── README-Localization.md      # 이 문서
├── Parkour - main.json         # 메인 UI 텍스트
├── Parkour - hero.json         # 영웅 관련 텍스트
├── Parkour - pet.json          # 펫 관련 텍스트
├── Parkour - skin.json         # 스킨 관련 텍스트
├── Parkour - Level.json        # 레벨 관련 텍스트
├── Parkour - Prop.json         # 아이템 관련 텍스트
├── Parkour - guide.json        # 가이드 텍스트
└── Parkour - shopCap.json      # 상점 캡션 텍스트
```

---

## 2. JSON 파일 형식

각 JSON 파일은 언어 코드별로 키-값 쌍을 포함합니다.

```json
{
  "ko": {
    "btn.confirm": "확인",
    "btn.cancel": "취소",
    "text.level": "레벨 {0}"
  },
  "en": {
    "btn.confirm": "Confirm",
    "btn.cancel": "Cancel",
    "text.level": "Level {0}"
  },
  "cn": {
    "btn.confirm": "确定",
    "btn.cancel": "取消",
    "text.level": "等级 {0}"
  }
}
```

### 지원 언어 코드
| 코드 | 언어 |
|------|------|
| `ko` | 한국어 |
| `en` | 영어 |
| `cn` | 중국어 (간체) |

---

## 3. 초기화 설정

### 3.1 씬에 LocalizationManager 추가

1. 로딩 씬에 빈 노드 생성 (예: `LocalizationManager`)
2. `LocalizationManager.ts` 컴포넌트 추가
3. Inspector에서 설정:

| 속성 | 설명 | 기본값 |
|------|------|--------|
| `localizationJsonFiles` | JSON 파일 배열 (드래그 앤 드롭) | `[]` |
| `defaultLanguage` | 기본 언어 코드 | `"ko"` |
| `autoLocalizeOnStart` | 시작 시 자동 로컬라이징 | `true` |
| `autoLocalizeOnSceneLoaded` | 씬 로드 시 자동 로컬라이징 | `true` |
| `keyPrefix` | 로컬라이징 키 접두사 | `"@"` |
| `debugMode` | 디버그 로그 출력 | `false` |
| `warnOnDuplicate` | 중복 키 경고 | `true` |
| `localizedImages` | 로컬라이징 이미지 목록 (키별 언어별 이미지) | `[]` |

### 3.2 JSON 파일 등록

Inspector에서 `localizationJsonFiles` 배열에 JSON 파일들을 드래그하여 추가합니다.
여러 파일을 추가하면 자동으로 병합됩니다 (나중에 추가된 파일이 우선).

---

## 4. Label 로컬라이징 (자동)

### 4.1 접두사 방식

Label의 String 필드에 `@` 접두사 + 키를 입력하면 자동으로 로컬라이징됩니다.

**예시:**
```
Label.string = "@btn.confirm"    →  "확인" (ko)
Label.string = "@mode.challenge" →  "챌린지 모드" (ko)
```

### 4.2 자동 로컬라이징 동작

1. **씬 로드 시**: `autoLocalizeOnSceneLoaded = true`면 자동 실행
2. **시작 시**: `autoLocalizeOnStart = true`면 자동 실행
3. **View 표시 시**: ViewManager, mvcView에서 자동 실행

---

## 5. 코드에서 텍스트 가져오기

### 5.1 기본 텍스트 가져오기

**TypeScript:**
```typescript
import { LocalizationManager } from "../../Localization/LocalizationManager";

// 방법 1: @ 접두사 포함
const text1 = LocalizationManager.getText("@btn.confirm");

// 방법 2: @ 접두사 없이
const text2 = LocalizationManager.getText("btn.confirm");

// 결과: "확인" (ko), "Confirm" (en), "确定" (cn)
```

**JavaScript:**
```javascript
const LocalizationManager = require("LocalizationManager");

// 방법 1: @ 접두사 포함
const text1 = LocalizationManager.getText("@btn.confirm");

// 방법 2: @ 접두사 없이
const text2 = LocalizationManager.getText("btn.confirm");
```

### 5.2 인자가 있는 텍스트

JSON에서 `{0}`, `{1}` 등의 플레이스홀더 사용:

```json
{
  "ko": {
    "unlockEndlessLevel": "레벨 {0}에 도달시 잠금 해제",
    "reward.message": "{0}님이 {1}골드를 획득했습니다!"
  }
}
```

```typescript
// 단일 인자
const text = LocalizationManager.getTextWithArgs("@unlockEndlessLevel", 10);
// 결과: "레벨 10에 도달시 잠금 해제"

// 복수 인자
const msg = LocalizationManager.getTextWithArgs("@reward.message", "플레이어", 500);
// 결과: "플레이어님이 500골드를 획득했습니다!"
```

### 5.3 특수 문자 처리

JSON에서 줄바꿈과 공백:
```json
{
  "ko": {
    "multiline": "첫번째 줄\\n두번째 줄",
    "with_space": "여기에\\s공백"
  }
}
```

`\\n` → 줄바꿈, `\\s` → 공백으로 자동 변환됩니다.

---

## 6. 노드/Label 수동 로컬라이징

### 6.1 단일 Label 로컬라이징

```typescript
const label = node.getComponent(cc.Label);
LocalizationManager.localizeLabel(label);
```

### 6.2 노드와 모든 자식 로컬라이징

```typescript
// 특정 노드와 모든 자식의 Label 로컬라이징
LocalizationManager.localizeNode(someNode);

// 반환값: 로컬라이징된 Label 개수
const count = LocalizationManager.localizeNode(parentNode);
console.log(`${count}개 Label 로컬라이징 완료`);
```

### 6.3 현재 씬 전체 로컬라이징

```typescript
// Canvas 아래의 모든 Label 로컬라이징
LocalizationManager.localizeScene();
```

---

## 7. 프리펩 인스턴스화 (자동 로컬라이징)

### 7.1 instantiatePrefab

```typescript
// 프리펩 생성 + 자동 로컬라이징
const node = LocalizationManager.instantiatePrefab(prefab);
parent.addChild(node);
```

### 7.2 addChildWithLocalization

```typescript
// 자식 추가 + 자동 로컬라이징
const node = cc.instantiate(prefab);
LocalizationManager.addChildWithLocalization(node, parent);
```

---

## 8. 이미지 로컬라이징

언어별로 다른 이미지를 사용해야 할 때 (예: 텍스트가 포함된 버튼 이미지, 국기 등)

### 8.1 Inspector에서 이미지 설정

`LocalizationManager` 노드의 Inspector에서 `localizedImages` 배열에 이미지를 등록합니다.

```
LocalizationManager (Node)
└── localizedImages:
    ├── [0] key: "flag_icon"
    │       ko: flag_ko.png (SpriteFrame)
    │       en: flag_en.png (SpriteFrame)
    │       cn: flag_cn.png (SpriteFrame)
    ├── [1] key: "btn_start"
    │       ko: btn_start_ko.png
    │       en: btn_start_en.png
    │       cn: (비워두면 ko 사용)
    └── ...
```

### 8.2 코드에서 이미지 가져오기

**TypeScript:**
```typescript
import { LocalizationManager } from "../../Localization/LocalizationManager";

// 방법 1: SpriteFrame만 가져오기
const spriteFrame = LocalizationManager.getImage("flag_icon");
this.spr_flag.spriteFrame = spriteFrame;

// 방법 2: 노드에 키 설정 (언어 변경 시 자동 업데이트)
LocalizationManager.setImageKey(this.spr_flag.node, "flag_icon");
```

**JavaScript:**
```javascript
const LocalizationManager = require("LocalizationManager");

// 방법 1: SpriteFrame만 가져오기
const spriteFrame = LocalizationManager.getImage("flag_icon");
this.spr_flag.spriteFrame = spriteFrame;

// 방법 2: 노드에 키 설정 (언어 변경 시 자동 업데이트)
LocalizationManager.setImageKey(this.spr_flag.node, "flag_icon");
```

### 8.3 자동 업데이트

`setImageKey()`로 설정한 노드는 언어 변경 시 자동으로 이미지가 업데이트됩니다.

```typescript
// 이미지 키 설정
LocalizationManager.setImageKey(this.spr_flag.node, "flag_icon");

// 언어 변경 시 자동으로 해당 언어 이미지로 변경됨
LocalizationManager.setLanguage("en");
```

### 8.4 폴백 (Fallback) 로직

이미지가 없는 언어의 경우 자동으로 한국어(ko) 이미지를 사용합니다.

```
getImage("btn_start") 호출 시:
1. 현재 언어(en)의 이미지 확인 → 있으면 반환
2. 없으면 ko 이미지 반환 (기본값)
3. ko도 없으면 null 반환
```

### 8.5 추적 해제

```typescript
// 노드의 이미지 키 추적 해제 (언어 변경 시 더 이상 업데이트 안함)
LocalizationManager.removeImageKey(this.spr_flag.node);
```

> **참고**: 노드가 `destroy`되면 자동으로 추적 목록에서 제거됩니다.

---

## 9. 언어 변경

### 9.1 런타임에 언어 변경

```typescript
// 한국어로 변경
LocalizationManager.setLanguage("ko");

// 영어로 변경
LocalizationManager.setLanguage("en");

// 중국어로 변경
LocalizationManager.setLanguage("cn");
```

언어 변경 시:
1. 현재 씬의 모든 로컬라이징된 Label 자동 업데이트
2. `setImageKey()`로 등록된 모든 이미지 자동 업데이트
3. `localStorage`에 선택한 언어 저장 (`game_language` 키)
4. 다음 실행 시 저장된 언어로 자동 시작

### 9.2 현재 언어 확인

```typescript
const currentLang = LocalizationManager.getLanguage();
console.log(currentLang); // "ko", "en", "cn"
```

### 9.3 지원 언어 목록

```typescript
const languages = LocalizationManager.getSupportedLanguages();
console.log(languages); // ["ko", "en", "cn"]
```

---

## 10. 동적 JSON 추가 (런타임)

### 10.1 JSON 데이터 직접 추가

```typescript
LocalizationManager.addJsonData({
  ko: { "custom.key": "커스텀 텍스트" },
  en: { "custom.key": "Custom Text" },
  cn: { "custom.key": "自定义文本" }
});

// 기존 키 덮어쓰기 허용
LocalizationManager.addJsonData(newData, true);
```

### 10.2 JsonAsset 병합

```typescript
cc.resources.load("Localization/extra", cc.JsonAsset, (err, jsonAsset) => {
  LocalizationManager.mergeJsonAsset(jsonAsset);
});
```

---

## 11. 사용 예시

### 11.1 Toast 메시지

```typescript
import { LocalizationManager } from "../../Localization/LocalizationManager";
import { Toast } from "../../framework/ui/ToastManager";

// 간단한 메시지
Toast.make(LocalizationManager.getText("@text.not_enough_silver"));

// 인자 포함 메시지
Toast.make(LocalizationManager.getTextWithArgs("@unlockEndlessLevel", 15));
```

### 11.2 다이얼로그/팝업

```typescript
MessageBox.showWith({
    title: LocalizationManager.getText("@ImgConfirm.title"),
    content: LocalizationManager.getText("@text.confirm_use"),
    confirmTxt: LocalizationManager.getText("@btn.confirm"),
    cancelText: LocalizationManager.getText("@btn.cancel"),
    onConfirm: () => { /* ... */ }
});
```

### 11.3 동적 텍스트 조합

```typescript
// 타입에 따른 리소스명 가져오기
const resourceName = resType === ResType.Gold
    ? LocalizationManager.getText("@currency.silver")
    : LocalizationManager.getText("@currency.dia");

Toast.make(resourceName + LocalizationManager.getText("@text.not_enough_resource"));
```

---

## 12. 키 네이밍 컨벤션

### 권장 네이밍 규칙

| 패턴 | 용도 | 예시 |
|------|------|------|
| `UI이름.요소` | UI별 텍스트 | `UILevel.gamestart`, `UIPet.title` |
| `btn.동작` | 버튼 텍스트 | `btn.confirm`, `btn.cancel` |
| `text.설명` | 일반 텍스트 | `text.not_enough_silver` |
| `엔티티.id.속성` | 엔티티 데이터 | `hero.1.name`, `pet.1.desc` |
| `currency.타입` | 재화 이름 | `currency.dia`, `currency.silver` |
| `mode.모드명` | 게임 모드 | `mode.challenge`, `mode.eternal` |

---

## 13. 디버그 모드

Inspector에서 `debugMode = true` 설정 시:

```
[LocalizationManager] 초기화 완료
  - 로드된 파일: 8개
  - 현재 언어: ko
  - 지원 언어: ko, en, cn
  - ko: 245개 키
  - en: 245개 키
  - cn: 245개 키
[LocalizationManager] 병합 중: Parkour - main
  - ko: 124개 키 추가
[LocalizationManager] 45개 Label 로컬라이징 (12ms)
```

---

## 14. 체크리스트

- [ ] 로딩 씬에 `LocalizationManager` 컴포넌트 추가
- [ ] JSON 파일들을 `localizationJsonFiles` 배열에 등록
- [ ] `defaultLanguage` 설정 (ko/en/cn)
- [ ] Label의 String에 `@키이름` 형식으로 입력
- [ ] 코드에서 `LocalizationManager.getText()` 사용
- [ ] 인자가 필요한 경우 `getTextWithArgs()` 사용
- [ ] 언어 변경 UI 구현 시 `setLanguage()` 호출

---

## 15. 주의사항

1. **초기화 순서**: `LocalizationManager`는 다른 컴포넌트보다 먼저 초기화되어야 합니다.
   - 로딩 씬에 배치하고 `PersistRootNode`로 유지됩니다.

2. **키 중복**: 여러 JSON 파일에서 같은 키가 있으면 나중에 로드된 파일이 우선합니다.
   - `warnOnDuplicate = true`면 콘솔에 경고가 출력됩니다.

3. **키를 찾을 수 없을 때**: 해당 키 문자열이 그대로 반환됩니다.
   - 디버그 모드에서 경고 로그가 출력됩니다.

4. **@ 접두사**: `getText()`와 `getTextWithArgs()`는 `@` 접두사를 자동으로 제거합니다.
   - `getText("@btn.confirm")` === `getText("btn.confirm")`

5. **동적 생성 노드**: `cc.instantiate()` 후 반드시 `localizeNode()` 호출이 필요합니다.
   - 또는 `LocalizationManager.instantiatePrefab()` 사용

6. **이미지 폴백**: 언어별 이미지가 없으면 자동으로 한국어(ko) 이미지를 사용합니다.
   - ko 이미지도 없으면 null 반환

---

## 16. 다른 프로젝트로 복사

다른 Cocos Creator 프로젝트에서 이 로컬라이징 시스템을 사용하려면 다음 파일들을 복사하세요.

### 16.1 필수 파일

```
assets/Localization/
├── LocalizationManager.ts      # TypeScript 버전 (둘 중 하나 선택)
├── LocalizationManager.js      # JavaScript 버전 (둘 중 하나 선택)
└── README-Localization.md      # 문서 (선택)
```

> **참고**: TypeScript 프로젝트는 `.ts`, JavaScript 프로젝트는 `.js` 파일을 사용하세요.

### 16.2 복사 후 설정

1. **로딩 씬에 노드 생성**
   - 빈 노드 생성 후 `LocalizationManager` 컴포넌트 추가

2. **JSON 파일 생성**
   ```json
   {
     "ko": { "key": "한국어 텍스트" },
     "en": { "key": "English text" },
     "cn": { "key": "中文文本" }
   }
   ```

3. **Inspector 설정**
   - `localizationJsonFiles`: JSON 파일들 드래그 앤 드롭
   - `defaultLanguage`: 기본 언어 설정
   - `localizedImages`: 필요한 경우 이미지 등록

### 16.3 로컬라이징 추출 도구 (선택)

기존 프로젝트의 하드코딩된 텍스트를 자동으로 추출하고 변환하는 도구입니다.

```
tools/localization-extractor/
├── index.ts                    # CLI 진입점
├── package.json
├── tsconfig.json
├── types.ts                    # 타입 정의
├── config.ts                   # 설정
├── extractors/
│   ├── PrefabExtractor.ts      # Prefab 텍스트 추출
│   └── ScriptExtractor.ts      # TypeScript 텍스트 추출
├── generators/
│   ├── KeyGenerator.ts         # 키 생성
│   └── JsonGenerator.ts        # JSON 파일 생성
└── transformers/
    ├── PrefabTransformer.ts    # Prefab 변환
    └── ScriptTransformer.ts    # Script 변환
```

> **참고**: 추출 도구의 자세한 사용법은 `tools/localization-extractor/README.md`를 참고하세요.
