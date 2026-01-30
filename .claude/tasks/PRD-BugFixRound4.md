# PRD: Bug Fix Round 4

## 이슈 목록

### 이슈 1: 고급펫 뽑기 광고 사운드 타이밍 수정 ✅
**증상**: 고급펫 뽑기 광고에서 무료 버튼 터치 시, 바로 획득 연출음이 나오는 것 같습니다. 광고시청을 완료한 후 그 다음에 연출 및 사운드가 나와야합니다.

**원인**: UIhatchPet.ts:129에서 `Device.playSfx(csv.Audio.sfx_openEgg)`가 광고 시작 전에 호출됨

**수정 완료**:
- UIhatchPet.ts의 click_hatch() 함수에서 Device.playSfx 호출을 광고 완료 콜백 내부로 이동

---

### 이슈 2: 고급 펫 무료 광고 일일 1회 제한 + 횟수 표시 ✅
**요청**: 고급 펫 무료 광고는 일일 1회로 설정. 고급알 타이틀 하단에 "남은횟수/1" 표기

**수정 완료**:
1. PlayerInfo.ts에 `freePetHatchCount`, `freePetHatchDate` 필드 추가
2. PlayerInfo.ts에 `checkDailyPetHatchReset()`, `canWatchPetHatchAd()`, `usePetHatchAdCount()` 메서드 추가
3. eggItem.ts에 `updateAdCountDisplay()` 메서드 추가 - lab_count 라벨에 횟수 표시
4. UIhatchPet.ts의 click_hatch()에서 광고 횟수 체크 및 차감 로직 추가

---

### 이슈 3: 하트 부족 토스트 알림 제거 ✅
**증상**: 하트(energy) 부족 시 토스트 알림과 하트 충전 팝업이 동시에 표시됨

**수정 완료**: 5개 파일에서 Toast.make 제거
- UILevels.ts:230
- UILevelItem.ts:65
- UIFail.ts:29
- UIEndPage.ts:338
- UIReady.ts:248

---

### 이슈 4: 장애물 충돌 판정 이슈 ✅
**증상**: 장애물이 걸려야 할 부분에 슬라이드하지않아도 걸리지 않는 이슈

**원인**: Player.ts의 slide() 함수에서 setShape 파라미터 순서 오류
- 기존 코드: `setShape(height/2, width, ...)` (잘못된 순서)
- 정상 형식: `setShape(width, height, ...)` 

**수정 완료**:
- Player.ts의 slide() 메서드에서 setShape 파라미터 순서 수정
- 슬라이드 시 히트박스: 너비 유지, 높이 절반 (넓고 낮은 형태)

---

### 이슈 5: 챌린지 모드 맵 이름 매칭 ✅
**증상**: 챌린지 모드 실제 맵 컨셉과 맵 이름 매칭이 안되고 있음

**수정 완료**: localization.json 수정
- 한국어 오타 수정: "감옥옥 4" → "감옥 4", "감옥옥 5" → "감옥 5"
- 중복 이름 수정: map.name.35 "암흑 4" → "암흑 5" (한국어/중국어 모두)

---

## 완료 요약

| 이슈 | 상태 | 수정 파일 |
|------|------|-----------|
| 이슈 1 | ✅ 완료 | UIhatchPet.ts |
| 이슈 2 | ✅ 완료 | PlayerInfo.ts, eggItem.ts, UIhatchPet.ts |
| 이슈 3 | ✅ 완료 | UILevels.ts, UILevelItem.ts, UIFail.ts, UIEndPage.ts, UIReady.ts |
| 이슈 4 | ✅ 완료 | Player.ts |
| 이슈 5 | ✅ 완료 | localization.json |
