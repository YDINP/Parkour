# TASK-005: 하트 상점 무료 버튼 로컬라이징 키 변경

## 메타데이터

| 항목 | 값 |
|------|-----|
| Task ID | TASK-005 |
| 우선순위 | High |
| 상태 | 🟢 Ready |
| 예상 영향 범위 | UIRedHeartShop |
| 관련 문서 | MODIFICATION-GUIDE.md #1 |

---

## 1. 개요

### 1.1 문제 정의
하트 상점의 무료 버튼에 하드코딩된 "무료" 텍스트를 로컬라이징 키로 변경해야 합니다.

### 1.2 목표
- 무료 버튼 텍스트를 `@DiaShop.getFree` 로컬라이징 키로 변경
- 다국어 지원 가능하도록 수정

---

## 2. 수정 상세

### 2.1 대상 파일
`assets/resources/prefabs/UIRedHeartShop.prefab`

### 2.2 수정 위치
1421-1422번 라인

### 2.3 수정 내용

```json
// 수정 전:
"_string": "무료",
"_N$string": "무료",

// 수정 후:
"_string": "@DiaShop.getFree",
"_N$string": "@DiaShop.getFree",
```

---

## 3. 검증

### 3.1 테스트 항목
- [ ] Cocos Creator에서 프로젝트 열기
- [ ] UIRedHeartShop 프리팹 확인
- [ ] 하트 상점 팝업에서 무료 버튼 텍스트가 로컬라이징 되는지 확인
- [ ] 다른 언어로 변경 시 텍스트가 바뀌는지 확인

---

## 4. 체크리스트

- [ ] prefab 파일 백업
- [ ] 문자열 변경 적용
- [ ] JSON 유효성 확인
- [ ] 인게임 테스트
