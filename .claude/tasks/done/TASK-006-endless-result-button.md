# TASK-006: 무한모드 결과 팝업 보상 버튼 키 변경

## 메타데이터

| 항목 | 값 |
|------|-----|
| Task ID | TASK-006 |
| 우선순위 | High |
| 상태 | 🟢 Ready |
| 예상 영향 범위 | UIEndPage |
| 관련 문서 | MODIFICATION-GUIDE.md #2 |

---

## 1. 개요

### 1.1 문제 정의
무한모드 결과 팝업의 보상 버튼 텍스트가 잘못된 로컬라이징 키를 사용하고 있습니다.

### 1.2 목표
- 보상 버튼 키를 `@receive.normal`에서 `@Fail.continue`로 변경
- "이어하기" 텍스트가 올바르게 표시되도록 수정

---

## 2. 수정 상세

### 2.1 대상 파일
`assets/resources/prefabs/UIEndPage.prefab`

### 2.2 수정 위치
4669-4670번 라인

### 2.3 수정 내용

```json
// 수정 전:
"_string": "@receive.normal",
"_N$string": "@receive.normal",

// 수정 후:
"_string": "@Fail.continue",
"_N$string": "@Fail.continue",
```

---

## 3. 검증

### 3.1 테스트 항목
- [ ] 무한 모드 플레이 후 결과 화면 확인
- [ ] 왼쪽 보상 버튼 텍스트가 "이어하기"로 표시되는지 확인
- [ ] 다른 언어로 변경 시 텍스트가 바뀌는지 확인

---

## 4. 체크리스트

- [ ] prefab 파일 백업
- [ ] 문자열 변경 적용
- [ ] JSON 유효성 확인
- [ ] 무한모드 테스트
