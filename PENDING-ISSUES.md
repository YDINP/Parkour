# 49FriendsRunner (Parkour) - 미완료 수정사항

> 작성일: 2025-01-12
> 상태: 추가 정보 필요

---

## 개요

다음 4개 이슈는 추가 정보가 필요하여 대기 중입니다.

---

## 1. 캐릭터 특성/스킬에 맞게 신규 캐릭터 매칭 수정

### 문제
기존 캐릭터에 맞는 신규 캐릭터를 매치시킨 것이 아닙니다. 각 기존 캐릭터 특성/스킬에 맞게 신규 캐릭터로 교체 필요.

### 현재 영웅 데이터 (HeroInfo.csv)

| ID | 이름 | 무기 | 등급 | 스킬 | 특성 |
|----|------|------|------|------|------|
| 1 | 精灵射手 (정령 사수) | bow | D | skill-5 | 연발 5초 |
| 2 | 战士 (전사) | sword | C | skill-2 | 광도 2-3회 공격 |
| 3 | 火枪手 (화총수) | gun | D | skill-5 | 화포 5초 |
| 4 | 法师 (법사) | tornado | B | skill-2 | 토네이도 2초 |
| 5 | 锤神 (햄머 신) | thunderHammer | A | skill-2 | 번개 2초, 피해감소 |
| 6 | 兽战士 (수전사) | pigcrowd | B | skill-2-3 | 돼지떼 2초 |
| 7 | 烈火龙 (열화룡) | fireball | A | skill-5 | 파이어볼 3초 |
| 8 | 恶魔女 (악마녀) | wands | A | blackhole-3 | 블랙홀 3초, 3단점프 |

### 수정 파일
- `assets/resources/Config/csv/HeroInfo.csv`
- `assets/resources/heros/hero001-008/` (프리팹)
- `assets/Game/Skeletons/` (스켈레톤 애니메이션)

### 필요한 정보
- [ ] 어떤 기존 영웅을 어떤 신규 캐릭터(카카오 프렌즈?)로 교체할지 매핑 정보
- [ ] 신규 캐릭터의 스켈레톤 파일 위치
- [ ] 신규 캐릭터의 이미지 리소스

---

## 2. 튜브 제외 캐릭터들 프렌즈 정보 크기 키우기

### 문제
튜브 캐릭터를 제외한 나머지 캐릭터들의 프렌즈 정보에서 크기가 작습니다.

### 수정 파일
- `assets/Game/Script/ui/heroItem.ts` - 영웅 아이템 UI 스케일
- `assets/resources/prefabs/UIHeroShop.prefab` - 영웅 상점 프리팹
- 또는 개별 영웅 프리팹의 스케일 값

### 수정 방법 (예시)
```typescript
// heroItem.ts에서 스케일 조정
// 튜브가 아닌 캐릭터의 경우 스케일 증가
if (heroId !== TUBE_HERO_ID) {
    this.heroSprite.node.scale = 1.2;  // 또는 적절한 값
}
```

또는 prefab에서 직접 스케일 수정:
```json
// UIHeroShop.prefab 내 각 영웅 노드
"_scale": {
    "__type__": "cc.Vec3",
    "x": 1.2,
    "y": 1.2,
    "z": 1
}
```

### 필요한 정보
- [ ] "튜브"가 어떤 캐릭터인지 (ID 또는 이름)
- [ ] 나머지 캐릭터들을 얼마나 키울지 (배율 또는 픽셀 값)

---

## 3. 캐릭터 구매 팝업 정렬 수정

### 문제
캐릭터 구매할 때 띄워주는 팝업에서 내용과 버튼이 한쪽으로 쏠려 있습니다.

### 수정 파일
- `assets/resources/prefabs/UIHeroShop.prefab` - 영웅 상점 프리팹
- `assets/Game/Script/ui/UIHeroShop.ts` - 영웅 상점 스크립트
- 구매 확인 팝업 관련 prefab (UIImgComfirm.prefab 등)

### 수정 방법 (예시)
```json
// prefab 파일에서 Layout 또는 Widget 컴포넌트 조정
// 중앙 정렬 예시:
"_anchorPoint": {
    "__type__": "cc.Vec2",
    "x": 0.5,
    "y": 0.5
}

// 또는 Layout 컴포넌트 추가
"_components": [
    {
        "__type__": "cc.Layout",
        "_resizeMode": 1,
        "_layoutType": 1,  // HORIZONTAL
        "_horizontalDirection": 1,  // CENTER
        "_paddingLeft": 0,
        "_paddingRight": 0
    }
]
```

### 필요한 정보
- [ ] 어느 방향으로 정렬해야 하는지 (중앙/좌/우)
- [ ] 현재 쏠림 방향 (좌/우)
- [ ] 스크린샷 또는 구체적인 정렬 요구사항

---

## 4. 결과 팝업 캐릭터 사이즈 수정

### 문제
결과 팝업에서 나오는 캐릭터들의 사이즈 조정이 필요합니다.

### 수정 파일
- `assets/resources/prefabs/UIEndPage.prefab` - 결과 페이지 프리팹
- `assets/Game/Script/ui/UIEndPage.ts` - 결과 페이지 스크립트

### 수정 방법 (예시)
```json
// UIEndPage.prefab에서 캐릭터 노드의 스케일 조정
// 캐릭터 스프라이트 또는 스켈레톤 노드 찾아서:
"_scale": {
    "__type__": "cc.Vec3",
    "x": 0.8,  // 줄이려면 1 미만, 키우려면 1 초과
    "y": 0.8,
    "z": 1
}
```

또는 스크립트에서:
```typescript
// UIEndPage.ts
this.heroNode.scale = 0.8;  // 또는 적절한 값
```

### 필요한 정보
- [ ] 현재 캐릭터가 너무 큰지/작은지
- [ ] 원하는 크기 비율 (현재 대비 몇 %)

---

## 완료된 수정사항 (참고)

다음 이슈들은 수정 가이드가 완료되었습니다:

| 이슈 | 파일 | 상태 |
|------|------|------|
| 하트 상점 무료 버튼 → `@DiaShop.getFree` | `prefabs/UIRedHeartShop.prefab` | ✅ 가이드 완료 |
| 무한모드 결과 보상버튼 → `@Fail.continue` | `prefabs/UIEndPage.prefab` | ✅ 가이드 완료 |
| 로비 테이블 레이어 수정 | `Scenes/Home.fire` | ✅ 가이드 완료 |
| 펫 로비 움직임 | `Script/game/Home.ts` | ✅ 가이드 완료 |

---

## 작업 진행 시 참고사항

### Prefab 수정 주의사항
- JSON 구조가 유효한지 확인
- `__id__` 참조가 올바른지 확인
- UUID가 기존 에셋을 참조하는지 확인
- Cocos Creator 에디터에서 테스트

### CSV 데이터 변경 시
```bash
npm run csv-dts  # TypeScript 타입 재생성
```

### 테스트 방법
1. Cocos Creator 2.4.13에서 프로젝트 열기
2. 콘솔 에러 확인
3. 프리뷰 모드에서 기능 테스트

---

## 5. 빈 타일 1픽셀 아티팩트 이슈

> 추가일: 2025-01-28

### 문제

- **발생 위치**: `bg_forest_bg` 이미지를 사용하는 맵 (forest 맵들)
- **증상**: 낭떠러지(빈 타일, GID=0) 부분에서 인접 땅 타일의 1픽셀이 보임
- **영향 범위**: 모든 forest_*.tmx 맵 (약 24개)

### 조사 결과

#### 타일셋 이미지 크기 불일치

| 항목 | 값 |
|------|-----|
| 실제 PNG 크기 | 386×322 픽셀 |
| 예상 크기 (6×5 타일) | 384×320 픽셀 |
| 여분 픽셀 | 오른쪽 2px, 아래쪽 2px |

**핵심 문제**: Cocos Creator는 TSX 파일의 width/height를 **무시**하고 **실제 텍스처 크기**로 UV 좌표를 계산함.

```
UV 계산:
386 / 64 = 6.03125 (정수 아님 → UV 경계에서 여분 픽셀 샘플링)
```

#### FIX_ARTIFACTS 매크로

```typescript
// PersistNode.ts:64
cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL_TMX = 1;
```

- **값 = 1**: UV를 0.5px 인셋 (타일 사이 검은 선 방지)
- **값 = 0**: 인셋 없음 (빈 타일 경계에서 인접 픽셀 블리딩)

### 시도한 해결책

| 시도 | 방법 | 결과 |
|------|------|------|
| 1 | TSX width/height 수정 (386→384) | ❌ Cocos가 무시함 |
| 2 | TSX margin="1" 추가 | ❌ 다른 타일에 gap 발생 |
| 3 | FIX_ARTIFACTS = 0 | ❌ 일부 타일 gap + 원래 문제 미해결 |
| 4 | PNG 리사이즈 (PowerShell) | ⚠️ 이미지 원본으로 복구됨 |

### 권장 해결책

**PNG 이미지 수정 필요**:

1. `assets/resources/map/forest/bg_forest_bg.png` 열기
2. 캔버스 크기를 **384×320**으로 크롭 (왼쪽 상단 기준)
3. 저장 후 Cocos Creator에서 리임포트

**요구사항**:
- 정확히 384×320 픽셀 (6열 × 5행 × 64px)
- Nearest Neighbor 보간 사용 (픽셀아트)
- 오른쪽 2px, 아래쪽 2px 제거

### 관련 파일

| 파일 | 설명 |
|------|------|
| `assets/resources/map/forest/bg_forest_bg.png` | 타일셋 이미지 (수정 필요) |
| `assets/resources/map/forest/bg_forest_bg.png.meta` | 텍스처 메타데이터 |
| `assets/resources/map/bg_forest_bg.tsx` | 타일셋 정의 |
| `assets/Game/Script/common/PersistNode.ts:64` | FIX_ARTIFACTS 설정 |

### 현재 상태

- **상태**: 🔴 미해결
- **원인**: PNG 이미지 크기(386×322)가 타일 그리드(384×320)와 불일치
- **필요 작업**: PNG 이미지를 384×320으로 정확히 수정

---

## 담당자 메모

추가 정보를 제공해주시면 수정 작업을 진행하겠습니다.

```
문의: 각 이슈별 필요한 정보를 위 체크리스트에서 확인해주세요.
```
