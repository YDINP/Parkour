# PRD: UI_signIn 획득 완료 연출 개선

## 개요
UI_signIn (출석체크) 화면에서 보상 획득 시 시각적 피드백을 강화하여 사용자 경험을 개선합니다.

## 현재 상태 분석

### 기존 로직 (UI_signIn.ts:96-110)
```typescript
private click_signIn(e, customEventData) {
    let num = Number(customEventData);
    let data = ccUtil.get(skinData, num);
    pdata[data.type] += data.num;           // 보상 즉시 지급
    pdata.signIn = { date: num, isSignIn: true };
    pdata.signInTime = Date.now();
    pdata.save();
    e.target.parent.getComponent(FxPlayer).play();  // FxPlayer 이펙트만 재생
    let img_isSignIn = ccUtil.find("btn_signIn/img_isSignIn", e.target.parent, cc.Sprite);
    ccUtil.setDisplay(img_isSignIn, "Textures/ui/signIn/title_signIn_1");
    ccUtil.setButtonEnabled(e.target, false)
    Toast.make(LocalizationManager.getText("@signInSuccess"));
}
```

### 현재 이펙트 시스템
1. **FxPlayer** - 버튼에 연결된 파티클/애니메이션 이펙트 (체크 표시 등)
2. **InventoryUI/TopMostInventoryUI** - 골드/다이아/하트 획득 시 flyToInventory 연출
   - `pdata.gold`, `pdata.diamond`, `pdata.energy` 변경 시 이벤트로 자동 트리거
   - `InventoryUI.instance.setTarget(node)` 로 시작 위치 지정

### 보상 타입 (skin.csv)
| Day | Type | Amount |
|-----|------|--------|
| 1 | energy | 5 |
| 2 | diamond | 5 |
| 3 | gold | 5000 |
| 4 | diamond | 8 |
| 5 | energy | 5 |
| 6 | gold | 8000 |
| 7 | diamond | 10 |

## 문제점
현재 `pdata[data.type] += data.num` 으로 값을 즉시 변경하면 `InventoryUI`가 이벤트를 받아 flyToInventory 연출이 실행되지만:
1. **시작 위치가 잘못됨** - `setTarget()`을 호출하지 않아 마지막 클릭 위치/기본 위치에서 시작
2. **FxPlayer 이펙트와 동기화 안됨** - 버튼 이펙트와 보상 획득 연출이 따로 놀음

## 해결 방안

### 옵션 A: setTarget 추가 (권장)
```typescript
private click_signIn(e, customEventData) {
    let num = Number(customEventData);
    let data = ccUtil.get(skinData, num);

    // 1. 획득 연출 시작 위치 설정
    if (InventoryUI.instance) {
        InventoryUI.instance.setTarget(e.target.parent);  // 보상 아이템 노드
    }

    // 2. 보상 지급 (이벤트 트리거 → flyToInventory 자동 실행)
    pdata[data.type] += data.num;

    // 3. 나머지 처리...
}
```

### 옵션 B: 완료 연출 순차 실행 (고급)
FxPlayer 완료 후 보상 지급:
```typescript
private async click_signIn(e, customEventData) {
    let num = Number(customEventData);
    let data = ccUtil.get(skinData, num);

    // 1. 버튼 비활성화 및 UI 업데이트
    ccUtil.setButtonEnabled(e.target, false);
    let img_isSignIn = ccUtil.find("btn_signIn/img_isSignIn", e.target.parent, cc.Sprite);
    ccUtil.setDisplay(img_isSignIn, "Textures/ui/signIn/title_signIn_1");

    // 2. FxPlayer 체크마크 이펙트 재생
    let fxPlayer = e.target.parent.getComponent(FxPlayer);
    if (fxPlayer) {
        await fxPlayer.play();  // Promise 반환
    }

    // 3. 획득 연출 시작 위치 설정
    if (InventoryUI.instance) {
        InventoryUI.instance.setTarget(e.target.parent);
    }

    // 4. 보상 지급 (flyToInventory 자동 트리거)
    pdata[data.type] += data.num;
    pdata.signIn = { date: num, isSignIn: true };
    pdata.signInTime = Date.now();
    pdata.save();

    // 5. 완료 토스트
    Toast.make(LocalizationManager.getText("@signInSuccess"));
}
```

## 구현 사양

### 필수 기능
1. 보상 획득 시 아이템이 버튼 위치에서 시작하여 상단 인벤토리로 이동
2. 골드/다이아/하트 각각의 타입에 맞는 아이콘으로 연출
3. 기존 FxPlayer 이펙트는 유지

### 선택 기능 (Phase 2)
1. FxPlayer 완료 후 보상 연출 순차 실행
2. 보상 수량에 따른 이펙트 강도 조절

---

# TASK 목록

## TASK-1: InventoryUI.setTarget 연동 (필수)
**파일**: `assets/Game/Script/ui/UI_signIn.ts`
**변경점**:
- `click_signIn()` 함수에 `InventoryUI.instance.setTarget()` 호출 추가
- 시작 위치로 보상 아이템 노드 (`e.target.parent`) 또는 이미지 노드 (`img_prize`) 지정

**예상 코드**:
```typescript
import InventoryUI from "../../view/TopMostInventoryUI";

// click_signIn 함수 내
if (InventoryUI.instance) {
    let img_prize = ccUtil.find("img_prize", e.target.parent);
    InventoryUI.instance.setTarget(img_prize || e.target.parent);
}
pdata[data.type] += data.num;
```

## TASK-2: 보상 지급 순서 최적화
**파일**: `assets/Game/Script/ui/UI_signIn.ts`
**변경점**:
- `pdata.save()` 호출 시점을 setTarget/보상지급 이후로 이동
- 데이터 무결성을 위해 save는 마지막에 실행

## TASK-3: 테스트 항목
1. 출석체크 1일차 (energy) - 하트가 버튼에서 상단으로 이동
2. 출석체크 2일차 (diamond) - 다이아가 버튼에서 상단으로 이동
3. 출석체크 3일차 (gold) - 코인이 버튼에서 상단으로 이동
4. FxPlayer 체크마크 이펙트 정상 작동 확인
5. 인벤토리 수량 정확히 증가 확인
