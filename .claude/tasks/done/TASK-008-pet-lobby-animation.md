# TASK-008: 펫 로비 애니메이션 추가

## 메타데이터

| 항목 | 값 |
|------|-----|
| Task ID | TASK-008 |
| 우선순위 | Medium |
| 상태 | 🟢 Ready |
| 예상 영향 범위 | Home.ts, Home.fire |
| 관련 문서 | MODIFICATION-GUIDE.md #4 |

---

## 1. 개요

### 1.1 문제 정의
로비에서 펫이 정적 이미지로 표시되고 있어 생동감이 없습니다.

### 1.2 목표
- 펫이 로비에서 애니메이션(run, idle 등)을 재생하도록 수정
- Sprite 컴포넌트를 Skeleton 컴포넌트로 변경

---

## 2. 수정 상세

### 2.1 대상 파일
1. `assets/Game/Script/game/Home.ts`
2. `assets/Game/Scenes/Home.fire` (씬 수정 필요 시)

### 2.2 수정 내용

#### Step 1: 프로퍼티 타입 변경 (Home.ts 52-53번 라인)
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
- Cocos Creator에서 Home 씬 열기
- petModel 프로퍼티에 Skeleton 컴포넌트가 있는 노드 연결
- 기존 Sprite 참조 제거

---

## 3. 검증

### 3.1 테스트 항목
- [ ] 로비에서 펫이 움직이는지 확인
- [ ] 펫 선택 변경 시 애니메이션이 적용되는지 확인
- [ ] 콘솔에 에러가 없는지 확인
- [ ] 펫이 없을 때(selPet == "0") 오류 없는지 확인

---

## 4. 주의사항

### 4.1 씬 연결 필요
- TypeScript 코드만 수정하면 씬에서 프로퍼티 연결이 끊어질 수 있음
- Cocos Creator에서 씬을 열어 petModel 재연결 필요

### 4.2 애니메이션 이름 확인
- 펫 스켈레톤에 "run", "idle" 등의 애니메이션이 있는지 확인 필요
- 없는 경우 다른 애니메이션 이름 사용

---

## 5. 체크리스트

- [ ] Home.ts 파일 백업
- [ ] 프로퍼티 타입 변경
- [ ] 애니메이션 코드 추가
- [ ] Home.fire 씬 수정 (필요시)
- [ ] 인게임 테스트
