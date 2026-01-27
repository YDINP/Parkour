# 49FriendsRunner (Parkour) - 수정 가이드

> 작성일: 2025-01-12
> 상태: 적용 대기

---

## 완료된 수정 가이드 체크리스트

### 1. 하트 상점 무료 버튼 로컬라이징 키 변경

- [ ] **적용 완료**

**파일**: `assets/resources/prefabs/UIRedHeartShop.prefab`

**위치**: 1421-1422번 라인

**수정 내용**:
```json
// 수정 전:
"_string": "무료",
"_N$string": "무료",

// 수정 후:
"_string": "@DiaShop.getFree",
"_N$string": "@DiaShop.getFree",
```

**테스트**:
- [ ] Cocos Creator에서 프로젝트 열기
- [ ] UIRedHeartShop 프리팹 확인
- [ ] 하트 상점 팝업에서 무료 버튼 텍스트가 로컬라이징 되는지 확인

---

### 2. 무한모드 결과 팝업 보상 버튼 키 변경

- [ ] **적용 완료**

**파일**: `assets/resources/prefabs/UIEndPage.prefab`

**위치**: 4669-4670번 라인

**수정 내용**:
```json
// 수정 전:
"_string": "@receive.normal",
"_N$string": "@receive.normal",

// 수정 후:
"_string": "@Fail.continue",
"_N$string": "@Fail.continue",
```

**테스트**:
- [ ] 무한 모드 플레이 후 결과 화면 확인
- [ ] 왼쪽 보상 버튼 텍스트가 "이어하기"로 표시되는지 확인

---

### 3. 로비 테이블이 캐릭터 위로 오게 수정

- [ ] **적용 완료**

**파일**: `assets/Game/Scenes/Home.fire`

**관련 노드**:
- `ui_img_lobby_deco_table` (428번 라인)
- `ui_img_lobby_deco_table2` (616번 라인)

**수정 방법**:

#### 방법 1: zIndex 수정 (권장)
```json
// Home.fire에서 테이블 노드 찾아서 zIndex 값 증가
"_zIndex": 100  // 캐릭터보다 높은 값으로 설정
```

#### 방법 2: siblingIndex 수정
```json
// 테이블 노드를 캐릭터 노드보다 뒤에 배치 (나중에 렌더링 = 위에 표시)
"_siblingIndex": 10  // 캐릭터보다 높은 값
```

#### 방법 3: Cocos Creator 에디터에서
1. Home 씬 열기
2. 테이블 노드 선택
3. Inspector에서 zIndex 값 증가
4. 또는 Hierarchy에서 노드 순서 조정 (아래에 있을수록 위에 렌더링)

**테스트**:
- [ ] Home 씬에서 테이블이 캐릭터 위에 표시되는지 확인
- [ ] 캐릭터 이동 시 테이블에 가려지는지 확인

---

### 4. 펫이 로비에서 움직이게 수정

- [ ] **적용 완료**

**파일**: `assets/Game/Script/game/Home.ts`

**수정 내용**:

#### Step 1: 프로퍼티 타입 변경 (52-53번 라인)
```typescript
// 수정 전:
@property(cc.Sprite)
petModel: cc.Sprite = null;

// 수정 후:
@property(sp.Skeleton)
petModel: sp.Skeleton = null;
```

#### Step 2: start() 함수에 애니메이션 코드 추가
```typescript
start() {
    // 기존 코드...

    // 펫 애니메이션 추가
    if (this.petModel && pdata.selPet != "0") {
        this.petModel.setAnimation(0, "run", true);  // 또는 "idle", "walk"
    }
}
```

#### Step 3: Home.fire 씬에서 petModel 컴포넌트 재연결
1. Cocos Creator에서 Home 씬 열기
2. petModel 프로퍼티에 Skeleton 컴포넌트가 있는 노드 연결
3. 기존 Sprite 참조 제거

**테스트**:
- [ ] 로비에서 펫이 움직이는지 확인
- [ ] 펫 선택 변경 시 애니메이션이 적용되는지 확인
- [ ] 콘솔에 에러가 없는지 확인

---

### 5. 빌드 후 HTML 언어 선택기 주입 스크립트

- [ ] **적용 완료**

**상태**: `post-build-inject.js` 파일 생성 완료

**파일**: `post-build-inject.js` (프로젝트 루트)

**기존 파일**:
- `build-templates/web-mobile/language-selector.js`
- `build-templates/web-mobile/language-selector.css`

**사용 방법**:
```bash
# 빌드 후 실행
node post-build-inject.js "./build/web-mobile"
```

**자동 실행 설정**:
Cocos Creator 빌드 설정에서 빌드 후 스크립트로 등록

**동작 설명**:
1. 빌드된 index.html에 language-selector.css 링크 주입
2. 빌드된 index.html에 language-selector.js 스크립트 주입
3. LocalizationManager.ts가 postMessage를 수신하여 언어 변경 처리
4. `<title>` 태그를 GameVersion의 projectName + version으로 수정
   - 예: `<title>49FriendsRunner v0.0.1</title>`

**테스트**:
- [ ] web-mobile 빌드 후 스크립트 실행
- [ ] 브라우저에서 언어 선택기 표시 확인
- [ ] 언어 변경 시 게임 내 텍스트 변경 확인

---

## 적용 순서 권장

1. UIRedHeartShop.prefab 수정 (간단한 텍스트 변경)
2. UIEndPage.prefab 수정 (간단한 텍스트 변경)
3. Home.fire 수정 (테이블 레이어)
4. Home.ts 수정 (펫 애니메이션 - 코드 변경 포함)
5. 빌드 시 `post-build-inject.js` 실행

---

## 빌드 전 체크리스트

- [ ] 모든 수정사항 적용 완료
- [ ] Cocos Creator에서 프로젝트 열기
- [ ] 콘솔 에러 없음 확인
- [ ] 각 기능 테스트 완료
- [ ] git commit 완료

---

## 관련 파일

- `PENDING-ISSUES.md` - 미완료 수정사항 (추가 정보 필요)
- `CLAUDE.md` - 프로젝트 가이드
- `PROJECT-STRUCTURE.md` - 프로젝트 구조
