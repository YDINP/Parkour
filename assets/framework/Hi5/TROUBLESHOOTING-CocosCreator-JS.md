# Cocos Creator 2.x (JavaScript 기반) 빌드 문제 해결 가이드

## 문제 1: 모듈명 충돌 (JS/TS 파일 동시 존재)

**증상:**
```
Build Failed: Error: Compile error: Filename conflict, the module "XXX" both defined in "XXX.js" and "XXX.ts"
```

**원인:**
- 같은 이름의 `.js`와 `.ts` 파일이 동시에 존재
- Cocos Creator가 두 파일을 같은 모듈로 인식

**해결:**
- JS 기반 프로젝트: `.ts` 파일과 `.ts.meta` 삭제
- TS 기반 프로젝트: `.js` 파일과 `.js.meta` 삭제

---

## 문제 2: Node.js 모듈을 브라우저에서 로드 시도

**증상:**
```
Uncaught Error: Cannot find module 'fs'
```

**원인:**
- `assets/` 폴더 내 Node.js 전용 스크립트(빌드 도구 등)에 `.meta` 파일이 존재
- Cocos Creator가 해당 스크립트를 게임 빌드에 포함

**해결:**
- 개발 도구 스크립트의 `.meta` 파일 삭제
- 예: `assets/tools/*.meta` 전체 삭제

---

## 문제 3: 모듈명 대소문자 불일치

**증상:**
```
load script [./assets/XXX/Abc] failed : Error: Cannot find module './assets/XXX/Abc'
```

**원인:**
- 코드에서 `require("Abc")` 호출
- 실제 파일명은 `abc.js` (대소문자 다름)
- Windows에서는 개발 중 문제없지만 빌드 후 실패

**해결:**
- 파일명을 코드에서 요청하는 이름과 일치시킴
- `.meta` 파일도 함께 이름 변경

---

## 문제 4: Hi5 모듈을 찾을 수 없음

**증상:**
```
load script [../Hi5/Hi5] failed : Error: Cannot find module '../Hi5/Hi5'
load script [../../../framework/Hi5/Hi5] failed : Error: Cannot find module '../../../framework/Hi5/Hi5'
```

**원인:**
- `Hi5` 폴더에 `hi5.js` (소문자)와 `Hi5.ts` (대문자) 두 파일이 존재
- import 경로가 `Hi5/Hi5`로 되어있어 대소문자 불일치 발생
- Windows에서는 파일 시스템이 대소문자 구분을 안하지만, 모듈 로더는 구분함

**해결:**
import 경로를 소문자 `hi5`로 수정:

```typescript
// Before (에러 발생)
import _Hi5Import from "../../../framework/Hi5/Hi5";

// After (정상 동작)
import _Hi5Import from "../../../framework/Hi5/hi5";
```

**수정이 필요한 파일 목록:**
- `assets/Game/Script/data/PlayerInfo.ts`
- `assets/Game/Script/common/LoadingScene.ts`
- `assets/Game/Script/common/PersistNode.ts`
- `assets/Game/Script/game/Game.ts`
- `assets/framework/extension/Platform.ts`

---

## 문제 5: LocalizationManager를 찾을 수 없음

**증상:**
```
Uncaught TypeError: Cannot read properties of null (reading 'LocalizationManager')
```

**원인:**
- `LocalizationManager` import 경로가 잘못됨
- 잘못된 경로: `../../../Localization/LocalizationManager`
- 올바른 경로: `../../../framework/Hi5/Localization/LocalizationManager`

**해결:**
각 파일 위치에 따라 올바른 상대 경로 사용:

```typescript
// framework/core/, framework/ui/, framework/misc/ 폴더
import { LocalizationManager } from "../Hi5/Localization/LocalizationManager";

// framework/extension/ 폴더
import { LocalizationManager } from "../Hi5/Localization/LocalizationManager";

// framework/extension/*/  (하위 폴더)
import { LocalizationManager } from "../../Hi5/Localization/LocalizationManager";

// Game/Script/ui/, Game/Script/game/ 폴더
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";

// Game/Script/game/model/, Game/Script/game/behaviors/ 폴더
import { LocalizationManager } from "../../../../framework/Hi5/Localization/LocalizationManager";

// Game/Script/game/behaviors/player/ 폴더
import { LocalizationManager } from "../../../../../framework/Hi5/Localization/LocalizationManager";
```

---

## 빌드 전 체크리스트

- [ ] assets/ 폴더 내 동일 이름의 .js/.ts 파일 중복 확인
- [ ] 개발 도구 스크립트(fs, path 사용)에 .meta 파일 있는지 확인
- [ ] 모듈 require() 호출과 실제 파일명 대소문자 일치 확인
- [ ] README, 문서 파일에 불필요한 .meta 있는지 확인
- [ ] Hi5 모듈 import 경로가 소문자 `hi5`인지 확인
- [ ] LocalizationManager import 경로가 `framework/Hi5/Localization/` 기준인지 확인
