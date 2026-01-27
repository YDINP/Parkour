# TASK-010: 캐릭터 등급별 정렬

## 상태: ✅ Done (2026-01-23)

## 문제 설명
프렌즈 정보에서 캐릭터를 등급별로 정렬해야 함.
현재는 등급 무관하게 순서가 섞여 있음.

## 원하는 순서
춘식 > 프로도 > 라이언 > 어피치 > 튜브 > 제이지 > 무지 > 네오

## 관련 파일
- `assets/Game/Script/ui/UIHeroShop.ts` - 히어로 리스트 로드 (line 46 주석 처리된 정렬)
- `assets/Game/Script/common/HeroSpinePaths.ts` - 히어로 ID 매핑
- `assets/resources/Config/csv/HeroInfo.csv` - 히어로 데이터

## 분석
### 현재 HeroSpinePaths 매핑
```typescript
const heroSpinePaths = {
    1: "hero/kakao/Choonsik",   // 춘식
    2: "hero/kakao/Ryan",       // 라이언
    3: "hero/kakao/Frodo",      // 프로도 (Musketeer)
    4: "hero/kakao/Apeach",     // 어피치 (Mage)
    5: "hero/kakao/Jay-G",      // 제이지 (Hammer)
    6: "hero/kakao/Tube",       // 튜브
    7: "hero/kakao/Muzi",       // 무지 (Flame Dragon)
    8: "hero/kakao/Neo"         // 네오 (Witch)
};
```

### 현재 HeroInfo.csv 등급 (quality)
| ID | 캐릭터 | 등급 |
|----|--------|------|
| 1 | 춘식 | D |
| 2 | 라이언 | C |
| 3 | 프로도 | D |
| 4 | 어피치 | B |
| 5 | 제이지 | A |
| 6 | 튜브 | B |
| 7 | 무지 | A |
| 8 | 네오 | A |

### 원하는 순서 (ID 기준)
1 (춘식) → 3 (프로도) → 2 (라이언) → 4 (어피치) → 6 (튜브) → 5 (제이지) → 7 (무지) → 8 (네오)

## 수정 방법
### 옵션 1: UIHeroShop.ts에서 하드코딩 순서 지정
```typescript
// UIHeroShop.ts line 46
const sortOrder = [1, 3, 2, 4, 6, 5, 7, 8];
this.listData.sort((a, b) => sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id));
```

### 옵션 2: HeroInfo.csv에 sortOrder 컬럼 추가
CSV에 `sortOrder` 필드 추가 후 정렬에 사용

## 권장: 옵션 1
빠르고 간단한 수정, CSV 구조 변경 불필요

## 예상 코드 변경
```typescript
// UIHeroShop.ts - init() 메서드 내
const displayOrder = [1, 3, 2, 4, 6, 5, 7, 8]; // 춘식, 프로도, 라이언, 어피치, 튜브, 제이지, 무지, 네오
this.listData.sort((a, b) => displayOrder.indexOf(a.id) - displayOrder.indexOf(b.id));
```

---

## ✅ 실제 코드 변경 (2026-01-23)

### 파일: `assets/Game/Script/ui/UIHeroShop.ts`

**변경: onShow() 메서드에 정렬 로직 추가**
```typescript
// 변경 전
onShow() {
    // this.listData.sort(v=>v.)
    this.render();
}

// 변경 후 (HeroData.id가 string 타입이므로 문자열 배열로 비교)
onShow() {
    // 캐릭터 순서: 춘식(1) > 프로도(3) > 라이언(2) > 어피치(4) > 튜브(6) > 제이지(5) > 무지(7) > 네오(8)
    // HeroData.id는 string 타입이므로 문자열 배열로 비교
    const displayOrder = ["1", "3", "2", "4", "6", "5", "7", "8"];
    this.listData.sort((a, b) => displayOrder.indexOf(a.id) - displayOrder.indexOf(b.id));
    this.render();
}
```
