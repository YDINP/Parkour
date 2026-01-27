# 코드 리뷰 스킬

게임 코드 품질을 검사하고 개선점을 제안합니다.

## 역할

코드 버그, 성능 이슈, 보안 취약점을 식별하고 개선안을 제시합니다.

## 사용 시점

- "코드 리뷰해줘"
- "버그 있는지 확인해줘"
- "성능 개선점 알려줘"
- "보안 취약점 체크해줘"

## 검사 항목

### 1. 버그 및 오류
- null/undefined 참조
- 배열 범위 초과
- 비동기 오류 처리 누락
- 타입 불일치

### 2. 성능 이슈
- 메모리 누수 (이벤트 리스너 미해제)
- 불필요한 반복 연산
- 대규모 배열 처리
- 리소스 로딩 최적화

### 3. 보안 취약점
- 하드코딩된 비밀키
- 클라이언트 측 민감 데이터
- 입력값 검증 누락
- XSS 취약점

### 4. 코드 품질
- 코드 중복
- 복잡도 (깊은 중첩)
- 네이밍 컨벤션
- 주석 및 문서화

## 에이전트 시스템

`C:\Users\a\Desktop\Hi5\agents\` 에서 자동화된 에이전트 실행 가능:

```bash
cd agents
npm install

# 개별 실행
npm run code-review    # 코드 품질 검사
npm run qa             # 게임 로직 검증
npm run localization   # 번역 검사
npm run resource-check # 리소스 검사
npm run design-check   # 디자인 데이터 검사

# 전체 실행
npm run all
```

## 에이전트 종류

| 에이전트 | 파일 | 기능 |
|----------|------|------|
| CodeReviewAgent | code-review-agent.ts | 버그, 메모리 누수, 보안 |
| QAAgent | qa-agent.ts | 게임 밸런스, 보상 로직 |
| LocalizationAgent | localization-agent.ts | 누락 키, 특수문자 |
| ResourceCheckAgent | resource-check-agent.ts | 리소스 참조, 미사용 파일 |
| DesignCheckAgent | design-check-agent.ts | 디자인 데이터 검증 |

## Cocos Creator 특화 검사

### 컴포넌트 생명주기
```typescript
// 올바른 cleanup
onDestroy() {
    this.node.off('event', this.handler, this);
    this.unscheduleAllCallbacks();
}
```

### 리소스 관리
```typescript
// 리소스 해제
resources.release('path/to/resource');
assetManager.releaseAsset(asset);
```

### 노드 풀링
```typescript
// 노드 풀 사용
const node = this.nodePool.get() || instantiate(this.prefab);
// 반환
this.nodePool.put(node);
```

## Puppeteer 웹 테스트

에이전트 검사 완료 후 브라우저에서 실제 테스트:

```
/web-test http://localhost:7456
```

| 테스트 | 명령 | 확인 |
|--------|------|------|
| SDK 초기화 | `evaluate` | window.Hi5 존재 |
| 버튼 동작 | `click` | 이벤트 발생 |
| 로컬라이징 | `evaluate` | getText() 반환 |
| 스크린샷 | `screenshot` | UI 상태 캡처 |

## 참조 문서

- agents/README.md
- README-Hi5-Integration-TS.md
- .claude/skills/web-test.md
