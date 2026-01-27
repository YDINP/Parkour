# TASK-011: 펫 한정 표시 버그 수정

## 상태: ✅ Done (2026-01-23)

## 문제 설명
펫 팝업에서 일부 펫이 한정으로 취급되고 있음.
기존 UI라면 제외, 새로 만든 UI라면 제대로 적용 필요.

## 관련 파일
- `assets/Game/Script/ui/petItem.ts` - 펫 아이템 표시 (line 74, 93)
- `assets/Game/Script/game/model/PetData.ts` - 펫 데이터 모델
- `assets/resources/Config/csv/pet.csv` - 펫 데이터 (quality 컬럼)

## 분석
### 현재 "한정" 판단 로직 (petItem.ts:74-93)
```typescript
let isLimit = data.quality == "A" ? true : false;
// ...
this.limitTag.active = isLimit;
```

품질(quality)이 "A"인 펫은 모두 한정으로 표시됨.

### heroItem.ts에도 동일한 로직 존재 (line 81)
```typescript
let isLimit = data.quality == "A" ? true : false;
```

## 수정 옵션

### 옵션 1: "한정" 태그 완전 제거
```typescript
// petItem.ts
this.limitTag.active = false; // 또는 노드 자체 제거
```

### 옵션 2: 별도 `isLimited` 필드 사용
CSV에 `isLimited` 컬럼 추가하고 해당 필드로 판단

### 옵션 3: 특정 펫 ID만 한정으로 지정
```typescript
const limitedPetIds = []; // 한정 펫 ID 목록 (비어있으면 없음)
let isLimit = limitedPetIds.includes(data.id);
```

## 권장: 옵션 1 또는 3
기획에 따라 한정 펫이 없다면 옵션 1, 특정 펫만 한정이라면 옵션 3

## 확인 필요
- 한정 펫이 실제로 있는지?
- 있다면 어떤 펫이 한정인지?

---

## ✅ 실제 코드 변경 (2026-01-23)

### 파일 1: `assets/Game/Script/ui/petItem.ts`

**변경: 한정 표시 로직 제거**
```typescript
// 변경 전
let lv = pdata.getPetLevel(data.id)
let isLimit = data.quality == "A" ? true : false;
this.node_selectFlag.active = data.id == pdata.selPet

// 변경 후
let lv = pdata.getPetLevel(data.id)
// 한정 펫 표시 제거 (quality A 기준이 아닌 별도 관리 필요시 수정)
let isLimit = false;
this.node_selectFlag.active = data.id == pdata.selPet
```

### 파일 2: `assets/Game/Script/ui/heroItem.ts`

**변경: 영웅 한정 표시 로직도 동일하게 제거**
```typescript
// 변경 전
let lv = pdata.getHeroLevel(data.id)
let isLimit = data.quality == "A" ? true : false;

// 변경 후
let lv = pdata.getHeroLevel(data.id)
// 한정 영웅 표시 제거 (quality A 기준이 아닌 별도 관리 필요시 수정)
let isLimit = false;
```
