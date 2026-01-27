# TASK-013: 캐릭터 전환 시 다른 캐릭터 표시 버그

## 상태: ✅ Done (2026-01-23)

## 문제 설명
프렌즈 정보에서 캐릭터 변경 시 순간적으로 다른 캐릭터 모습이 보이는 현상 발생.

## 관련 파일
- `assets/Game/Script/ui/heroItem.ts` - 히어로 아이템 (lines 231-250: Spine 로딩)
- `assets/Game/Script/ui/UIHeroShop.ts` - 히어로 샵 UI

## 분석
### 현재 캐릭터 전환 로직 (heroItem.ts)
```typescript
// lines 231-250: Spine 애니메이션 로드
cc.resources.load(heroSpinePaths[data.id], sp.SkeletonData, (err, skeletonData) => {
    if (!err) {
        this.skeleton.skeletonData = skeletonData;
        this.skeleton.setAnimation(0, "Idle", true);
    }
});
```

### 문제 원인
1. **비동기 로딩**: 새 Spine 데이터 로딩 중 이전 캐릭터가 표시됨
2. **순간 깜빡임**: 이전 애니메이션 → 새 데이터 로드 → 새 애니메이션 전환 시 잔상

### 유사 문제
펫 팝업에서도 동일한 문제 가능성 있음 (확인 필요)

## 수정 계획

### 옵션 1: 로딩 전 숨김 처리
```typescript
// 로딩 시작 시 스켈레톤 숨김
this.skeleton.node.active = false;

cc.resources.load(heroSpinePaths[data.id], sp.SkeletonData, (err, skeletonData) => {
    if (!err) {
        this.skeleton.skeletonData = skeletonData;
        this.skeleton.setAnimation(0, "Idle", true);
        // 로딩 완료 후 표시
        this.skeleton.node.active = true;
    }
});
```

### 옵션 2: 페이드 효과 추가
```typescript
// 페이드 아웃 → 교체 → 페이드 인
cc.tween(this.skeleton.node)
    .to(0.1, { opacity: 0 })
    .call(() => {
        cc.resources.load(heroSpinePaths[data.id], sp.SkeletonData, (err, skeletonData) => {
            if (!err) {
                this.skeleton.skeletonData = skeletonData;
                this.skeleton.setAnimation(0, "Idle", true);
                cc.tween(this.skeleton.node).to(0.1, { opacity: 255 }).start();
            }
        });
    })
    .start();
```

### 옵션 3: 이전 캐릭터 ID 체크
```typescript
if (this.currentHeroId === data.id) return; // 동일 캐릭터면 스킵
this.currentHeroId = data.id;
// ... 로딩 로직
```

## 권장: 옵션 1 + 옵션 3 조합
- 동일 캐릭터 재로딩 방지
- 로딩 중 깜빡임 방지

## 테스트 시나리오
1. 캐릭터 빠르게 전환 시 잔상 없음 확인
2. 동일 캐릭터 재선택 시 불필요한 로딩 없음 확인
3. 전환 애니메이션 자연스러움 확인

---

## ✅ 실제 코드 변경 (2026-01-23)

### 파일: `assets/Game/Script/ui/heroItem.ts`

**변경: updateHeroSpine() 메서드 전체 수정 (옵션 1 + 3 조합)**
```typescript
// 변경 전
private updateHeroSpine(heroId: string) {
    const spinePath = heroSpinePaths[heroId];

    if (!spinePath) {
        console.warn(`Hero spine path not found for hero ID: ${heroId}`);
        return;
    }

    cc.loader.loadRes(spinePath, sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
        if (err) {
            console.error(`Failed to load hero spine: ${spinePath}`, err);
            return;
        }

        if (this.headIconSp && skeletonData) {
            this.headIconSp.skeletonData = skeletonData;
            this.headIconSp.setAnimation(0, "Idle", true);
        }
    });
}

// 변경 후
private currentHeroId: string = null;

/**
 * 영웅 ID에 맞는 스파인 데이터 로드 및 적용
 * 캐릭터 전환 시 깜빡임 방지를 위해 로딩 중 숨김 처리
 */
private updateHeroSpine(heroId: string) {
    // 동일 캐릭터면 재로딩 스킵
    if (this.currentHeroId === heroId) return;
    this.currentHeroId = heroId;

    const spinePath = heroSpinePaths[heroId];

    if (!spinePath) {
        console.warn(`Hero spine path not found for hero ID: ${heroId}`);
        return;
    }

    // 로딩 전 숨기기 (깜빡임 방지)
    if (this.headIconSp && this.headIconSp.node) {
        this.headIconSp.node.opacity = 0;
    }

    cc.loader.loadRes(spinePath, sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
        if (err) {
            console.error(`Failed to load hero spine: ${spinePath}`, err);
            // 에러 시에도 표시 복구
            if (this.headIconSp && this.headIconSp.node) {
                this.headIconSp.node.opacity = 255;
            }
            return;
        }

        if (this.headIconSp && skeletonData) {
            this.headIconSp.skeletonData = skeletonData;
            this.headIconSp.setAnimation(0, "Idle", true);
            // 로딩 완료 후 페이드 인
            cc.tween(this.headIconSp.node).to(0.15, { opacity: 255 }).start();
        }
    });
}
```

### 변경 요약
1. **동일 캐릭터 재로딩 방지**: `currentHeroId` 필드 추가하여 중복 로딩 스킵
2. **로딩 중 숨김**: 로딩 시작 시 `opacity = 0`으로 설정
3. **페이드 인 효과**: 로딩 완료 후 0.15초 페이드 인으로 자연스러운 전환
4. **에러 복구**: 로딩 실패 시에도 opacity 복구
