# TASK-016: 영웅 레벨 표시 조건부 활성화

## 상태: ✅ Done (2026-01-23)

## 문제 설명
영웅 리스트에서 레벨 표시를 영웅 상태에 따라 조건부로 표시해야 함.
- **잠금(lock) 상태**: 레벨 라벨 숨김 (active=false)
- **구매/보유 중인 영웅**: 레벨 라벨 표시 (active=true)

## 관련 파일
- `assets/Game/Script/ui/heroItem.ts` - 영웅 아이템 컴포넌트

## 분석
### 현재 잠금 상태 판단 로직 (heroItem.ts)
```typescript
let lv = pdata.getHeroLevel(data.id)
// lv <= 0 이면 잠금 상태
this.lock_mask.active = lv <= 0;
```

### 현재 레벨 표시 로직
```typescript
this.lvLab.string = "LV." + pdata.getHeroLevel(data.id);
```
→ 잠금 여부와 관계없이 항상 표시됨

## 수정 계획
```typescript
// heroItem.ts - set() 메서드
let lv = pdata.getHeroLevel(data.id)

// 레벨 라벨: 보유 영웅만 표시
if (this.lvLab && this.lvLab.node) {
    this.lvLab.node.active = lv > 0;  // 잠금 상태면 숨김
    this.lvLab.string = "LV." + lv;
}

// 잠금 마스크
this.lock_mask.active = lv <= 0;
```

## 테스트 시나리오
1. 미해금 영웅 → 레벨 라벨 숨김 확인
2. 보유 영웅 → 레벨 라벨 표시 확인 (LV.1 이상)
3. 영웅 구매 후 → 레벨 라벨 표시로 전환 확인

---

## ✅ 실제 코드 변경 (2026-01-23)

### 파일: `assets/Game/Script/ui/heroItem.ts`

**변경: set() 메서드 - 레벨 라벨 조건부 활성화**
```typescript
// 변경 전
this.lvLab.string = "LV." + pdata.getHeroLevel(data.id);

// 변경 후
// 레벨 라벨: 보유 영웅만 표시 (잠금 상태면 숨김)
if (this.lvLab && this.lvLab.node) {
    this.lvLab.node.active = lv > 0;
}
this.lvLab.string = "LV." + lv;
```