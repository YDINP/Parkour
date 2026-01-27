# TASK-003: 캐릭터 구매 팝업 정렬 수정

## 메타데이터

| 항목 | 값 |
|------|-----|
| Task ID | TASK-003 |
| 우선순위 | Medium |
| 상태 | 🔴 Blocked (추가 정보 필요) |
| 예상 영향 범위 | 구매 팝업 UI |
| 관련 이슈 | PENDING-ISSUES.md #3 |

---

## 1. 개요

### 1.1 문제 정의
캐릭터 구매할 때 띄워주는 팝업에서 내용과 버튼이 한쪽으로 쏠려 있습니다.

### 1.2 목표
- 팝업 내 콘텐츠(텍스트, 이미지, 버튼) 정렬 수정
- 시각적 균형과 사용성 개선
- 일관된 UI 경험 제공

---

## 2. 현황 분석

### 2.1 관련 파일

| 파일 | 역할 |
|------|------|
| `assets/resources/prefabs/UIHeroShop.prefab` | 영웅 상점 프리팹 |
| `assets/Game/Script/ui/UIHeroShop.ts` | 영웅 상점 스크립트 |
| `assets/resources/prefabs/UIImgComfirm.prefab` | 이미지 확인 팝업 (추정) |
| `assets/framework/ui/controller/MessageBox.ts` | 메시지박스 컨트롤러 |

### 2.2 추정 팝업 구조

```
구매 팝업 (Popup)
├── Background
├── Title (제목)
├── Content (내용)
│   ├── Hero Image/Skeleton
│   ├── Description Text
│   └── Price Info
└── Buttons (버튼)
    ├── Confirm Button
    └── Cancel Button
```

---

## 3. 요구사항 (Pending)

### 3.1 필수 입력 정보

| 항목 | 상태 | 설명 |
|------|------|------|
| 현재 쏠림 방향 | ❌ 미제공 | 좌/우 중 어느 방향으로 쏠려있는지 |
| 원하는 정렬 | ❌ 미제공 | 중앙/좌/우 중 원하는 정렬 |
| 스크린샷 | ❓ 미제공 | 현재 상태 스크린샷 (선택) |

### 3.2 참고 질문

```
1. 현재 팝업이 어느 방향으로 쏠려 있나요? (좌/우)
2. 어떻게 정렬하면 될까요?
   - 중앙 정렬
   - 좌측 정렬
   - 우측 정렬
3. 스크린샷을 제공해주실 수 있나요?
```

---

## 4. 수정 계획 (정보 제공 후)

### 4.1 방법 A: Widget 컴포넌트 수정

```json
// prefab 내 Widget 컴포넌트 조정
{
    "__type__": "cc.Widget",
    "_isAbsHorizontalCenter": true,
    "_horizontalCenter": 0,  // 중앙 정렬
    "_isAlignHorizontalCenter": true
}
```

### 4.2 방법 B: Layout 컴포넌트 추가/수정

```json
// 버튼 컨테이너에 Layout 추가
{
    "__type__": "cc.Layout",
    "_layoutType": 1,  // HORIZONTAL
    "_resizeMode": 1,  // CONTAINER
    "_horizontalDirection": 1,  // LEFT_TO_RIGHT
    "_paddingLeft": 20,
    "_paddingRight": 20,
    "_spacingX": 20
}
```

### 4.3 방법 C: 앵커/포지션 직접 수정

```json
// 노드 앵커 포인트 수정
"_anchorPoint": {
    "__type__": "cc.Vec2",
    "x": 0.5,  // 중앙
    "y": 0.5
}

// 위치 조정
"_position": {
    "__type__": "cc.Vec3",
    "x": 0,  // 중앙 기준
    "y": 0,
    "z": 0
}
```

### 4.4 방법 D: 스크립트 동적 정렬

```typescript
// UIHeroShop.ts 또는 관련 팝업 스크립트
onPopupShow() {
    // 버튼 컨테이너 중앙 정렬
    this.buttonContainer.x = 0;
    
    // 또는 Layout 사용
    const layout = this.buttonContainer.getComponent(cc.Layout);
    layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;
    layout.updateLayout();
}
```

---

## 5. 분석 필요 사항

### 5.1 확인할 파일 구조

1. **UIHeroShop.prefab** 분석
   - 구매 팝업 노드 구조
   - Widget/Layout 컴포넌트 설정

2. **UIImgComfirm.prefab** 분석 (있는 경우)
   - 확인 팝업 구조
   - 버튼 배치

3. **MessageBox.ts** 분석
   - 동적 팝업 생성 로직
   - 정렬 관련 코드

### 5.2 테스트 시나리오

| 시나리오 | 확인 사항 |
|---------|----------|
| 영웅 구매 클릭 | 팝업 정렬 상태 |
| 다양한 해상도 | 정렬 유지 여부 |
| 긴 텍스트 | 레이아웃 깨짐 여부 |

---

## 6. 체크리스트

### 정보 제공 체크리스트
- [ ] 현재 쏠림 방향 확인 (좌/우)
- [ ] 원하는 정렬 방식 확인
- [ ] 스크린샷 (선택)

### 구현 체크리스트 (정보 제공 후)
- [ ] 관련 prefab 분석
- [ ] Widget/Layout 설정 확인
- [ ] 정렬 수정 적용
- [ ] 다양한 해상도 테스트
- [ ] 다른 팝업 영향 확인

---

## 7. 담당자 액션

**정보 제공 요청:**
```
1. 팝업이 현재 어느 방향으로 쏠려 있나요? (좌/우)
2. 어떤 정렬을 원하시나요? (중앙/좌/우)
3. 가능하다면 현재 상태 스크린샷을 제공해주세요.
```
