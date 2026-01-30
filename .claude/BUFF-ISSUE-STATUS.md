# 버프 아이템 미작동 이슈 - 진행 상황

## 최종 업데이트: 2024-01-28 (ULTRAWORK-RALPH 완료)

---

## 이슈 요약

버프 아이템(자석/별/골드) 획득 후 효과가 제대로 작동하지 않는 문제

---

## 완료된 수정 사항 (Oracle 검증 완료 ✅)

### 1. MagnetSuck - 좌표계 불일치 수정 ✅
**파일**: `assets/Game/Script/game/behaviors/player/MagnetSuck.ts`

**문제**:
- `FizzBody.seek(target)` 메서드가 `target - this.node.getPosition()` 계산
- `this.node.getPosition()`은 **로컬 좌표** (부모 기준)
- 펫의 **월드 좌표**를 그대로 전달하면 좌표계 불일치 → 아이템이 왼쪽으로만 날아감

**수정** (update() 메서드, line 151-165):
```typescript
// 변경 전
let pos = ccUtil.getWorldPosition(this.node);
let f = body.seek(pos, 1660)  // 좌표계 불일치!

// 변경 후
let petWorldPos = ccUtil.getWorldPosition(this.node);
let itemParent = body.node.parent;
let targetLocalPos = itemParent
    ? itemParent.convertToNodeSpaceAR(petWorldPos)  // 아이템 부모 기준 로컬 좌표로 변환
    : petWorldPos;
let f = body.seek(targetLocalPos, 1660)  // 같은 좌표계!
```

### 2. MagnetSuck/StarBuff/GoldBuff - 라이브 startIndex 사용 ✅
**파일들**: MagnetSuck.ts, StarBuff.ts, GoldBuff.ts

**문제**:
- `buffData.startIndex`가 버프 획득 시점에 캡처됨
- 초기화(`initializeIndex()`) 실행 시점까지 맵이 스크롤되어 startIndex 변경
- 이미 지나간 아이템부터 처리 시작 → 지연 발생

**수정** (initializeIndex() 메서드):
```typescript
// 변경 전
let data = this.buffData || this.node['_pendingBuffData'];
this.idx = data?.startIndex ?? root.itemLayer.startIndex;  // 캡처된 값

// 변경 후
this.idx = root.itemLayer.startIndex;  // 라이브 값 사용
```

### 3. MagnetSuck.doTag() - bfind 기본값 수정 ✅
**파일**: `assets/Game/Script/game/behaviors/player/MagnetSuck.ts`

**문제**: `schedule(this.tagUpdate)` → `tagUpdate(dt)` → `mark(undefined)` → `doTag(undefined)` → 무한 루프

**수정**:
```typescript
doTag(bfind = true) {
    // 무효/없는 노드는 항상 스킵
    this.itemIndex++;
}
```

### 4. GoldBuff.turnToCoins() 순서 수정 ✅
**파일**: `assets/Game/Script/game/behaviors/player/GoldBuff.ts`

**수정**:
```typescript
this.turnToCoins(obstacle);  // 먼저 데이터 수집
obstacle.node.destroy();      // 그 다음 파괴
```

### 5. activateBuff - gold 버프용 레이어 분리 ✅
**파일**: `assets/Game/Script/game/Game.ts`

**수정**:
```typescript
let startIndex = buff.name === 'gold'
    ? root.obstacleLayer.startIndex
    : root.itemLayer.startIndex;
```

---

## Oracle 검증 결과

### 전체 평가: ✅ **모든 수정사항이 올바르게 작성됨**

1. **좌표 변환**: `convertToNodeSpaceAR()` 사용이 완벽함
2. **라이브 인덱스**: 정확한 타이밍 보장
3. **사이드 이펙트**: 없음

---

## 테스트 체크리스트

### 1. 자석(magnet) 버프
- [ ] 아이템이 **펫 위치**로 날아오는가? (왼쪽이 아님)
- [ ] `[MagnetSuck.update] petWorldPos=...` 로그 확인
- [ ] idx가 계속 증가하는가? (무한 루프 해결)

### 2. 별(star) 버프
- [ ] 먹은 **직후** 화면의 콩이 별로 변환되는가? (지연 없음)
- [ ] `[StarBuff] this.idx: N (라이브 startIndex 사용)` 로그 확인

### 3. 골드(gold) 버프
- [ ] 먹은 **직후** 화면의 장애물이 골드로 변환되는가? (지연 없음)
- [ ] `[GoldBuff.turnToCoins]` 후 `[GoldBuff.update] 코인 생성` 로그 확인

---

## 관련 파일 목록

| 파일 | 수정 내용 |
|------|----------|
| `MagnetSuck.ts` | 좌표 변환 추가, 라이브 startIndex, doTag bfind 기본값 |
| `StarBuff.ts` | 라이브 startIndex |
| `GoldBuff.ts` | 라이브 startIndex, turnToCoins 순서 수정 |
| `Game.ts` | activateBuff 레이어 분리 |
| `GenericBuff.ts` | _pendingBuffData 패턴 |

---

## 히스토리

- **2024-01-28 (ULTRAWORK-RALPH)**:
  - MagnetSuck 좌표 변환 추가 (`convertToNodeSpaceAR`)
  - 모든 버프 라이브 startIndex 사용으로 변경
  - Oracle 검증 완료

- **2024-01-28 (이전 세션)**:
  - MagnetSuck doTag bfind 기본값 true 설정
  - GoldBuff turnToCoins 순서 수정
  - lazy init 패턴 적용
  - activateBuff 레이어 분리
