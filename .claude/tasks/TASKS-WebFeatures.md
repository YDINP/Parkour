# TASKS: 웹 빌드 기능 구현

> 관련 PRD:
> - [PRD-HTMLLanguageSelector.md](./PRD-HTMLLanguageSelector.md)
> - [PRD-WebpageTitleChange.md](./PRD-WebpageTitleChange.md)

## 작업 목록

### Phase 1: 핵심 연동 (필수)

#### TASK 1.1: LocalizationManager window 노출
- **파일**: `assets/framework/Hi5/Localization/LocalizationManager.ts`
- **내용**: `window.LocalizationManager` 노출 코드 추가/확인
- **우선순위**: 높음
- **예상 변경**:
```typescript
// 클래스 정의 후 또는 initialize() 내부에서
if (typeof window !== 'undefined') {
    (window as any).LocalizationManager = LocalizationManager;
}
```

#### TASK 1.2: GameVersion window 노출
- **파일**: `assets/Game/Script/common/GameVersion.ts`
- **내용**: `window.GameVersion` 노출 코드 추가
- **우선순위**: 높음
- **예상 변경**:
```typescript
if (typeof window !== 'undefined') {
    (window as any).GameVersion = GameVersion;
}
```

### Phase 2: 기능 검증

#### TASK 2.1: 언어 변경 실시간 반영 확인
- **파일**: `assets/framework/Hi5/Localization/LocalizationManager.ts`
- **내용**: `setLanguage()` 호출 시 활성 노드 갱신 확인
- **확인 사항**:
  - [ ] 언어 변경 시 `localizeAllActiveNodes()` 호출 여부
  - [ ] 이벤트 발송으로 외부 컴포넌트 갱신 여부

#### TASK 2.2: 웹 빌드 테스트
- **환경**: Cocos Creator 2.4.13
- **빌드 대상**: web-mobile
- **테스트 항목**:
  - [ ] 언어 선택기 표시
  - [ ] 언어 변경 시 게임 텍스트 갱신
  - [ ] 브라우저 탭 타이틀 동적 업데이트
  - [ ] iframe 내 실행 시 부모 타이틀 변경

### Phase 3: 개선 사항 (선택)

#### TASK 3.1: 캐시 제어 메타 태그 추가
- **파일**: `build-templates/web-mobile/index.html`
- **내용**: Cache-Control 메타 태그 추가
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

#### TASK 3.2: 스크립트 로드 순서 수정
- **파일**: `build-templates/web-mobile/index.html`
- **내용**: cocos2d-js-min.js가 main.js보다 먼저 로드되도록 수정
- **현재**:
```html
<script src="src/settings.js"></script>
<script src="main.js"></script>
<script src="cocos2d-js-min.js"></script>
```
- **변경**:
```html
<script src="src/settings.js"></script>
<script src="cocos2d-js-min.js"></script>
<script src="main.js"></script>
```

#### TASK 3.3: (선택) 프로덕션 빌드 시 'key' 언어 옵션 제거
- **파일**: `build-templates/web-mobile/language-selector.js`
- **내용**: DEBUG 플래그에 따라 'key' 옵션 조건부 표시

---

## 체크리스트

- [x] TASK 1.1: LocalizationManager window 노출 (이미 구현됨 - setupHtmlBridge())
- [x] TASK 1.2: GameVersion window 노출 (완료)
- [x] TASK 2.1: 언어 변경 실시간 반영 확인 (setLanguage() → updateAllLocalizedLabels() 호출 확인)
- [ ] TASK 2.2: 웹 빌드 테스트 (수동 테스트 필요)
- [x] TASK 3.1: 캐시 제어 메타 태그 추가 (완료)
- [x] TASK 3.2: 스크립트 로드 순서 수정 (완료)
- [ ] TASK 3.3: 'key' 언어 옵션 제거 (선택)

---

## 추가 완료 작업 (2024-01-25)

### TASK 4: 동적 언어 변경 최적화 (Kapi 패턴 적용)

#### TASK 4.1: heroItem.ts 최적화 ✅
- `set()`: 선택 플래그 애니메이션 조건부 실행 (wasSelected → isSelected 비교)
- `updateLabelsOnly()`: 언어 변경 시 텍스트만 업데이트 (스파인 재로드 없음)

#### TASK 4.2: UIHeroShop.ts 최적화 ✅
- `onLanguageChanged()`: `render()` 대신 각 아이템의 `updateLabelsOnly()` 호출

#### TASK 4.3: petItem.ts 최적화 ✅
- `set()`: 선택 플래그 애니메이션 조건부 실행
- `setSelected()`: 선택 상태 업데이트 메서드 추가
- `updateLabelsOnly()`: 언어 변경 시 텍스트만 업데이트
- `clickSelect()`: 전체 렌더링 대신 `updateSelectionOnly()` 사용

#### TASK 4.4: UIPet.ts 최적화 ✅
- `onLanguageChanged()`: `render()` 대신 각 아이템의 `updateLabelsOnly()` 호출
- `updateSelectionOnly()`: 특정 펫의 선택 상태만 업데이트 메서드 추가

## 완료 기준

1. 웹 빌드 실행 시 언어 선택기가 표시됨
2. 언어 변경 시 게임 내 모든 로컬라이즈 텍스트가 즉시 갱신됨
3. 브라우저 탭 타이틀에 `49FriendsRunner v{version}` 형식으로 표시됨
4. 개발자 도구에서 `window.LocalizationManager`와 `window.GameVersion` 접근 가능
