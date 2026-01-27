# Skill 개발 가이드

Claude Code 스킬 개발을 위한 공통 가이드입니다.

---

## 디렉토리 구조

```
.claude/skills/
├── SKILL-GUIDE.md              # 이 문서 (공통 가이드)
├── {skill-name}/
│   ├── SKILL.md                # 스킬 정의 (필수)
│   ├── STRUCTURE.md            # 구조 문서 (권장)
│   ├── templates/              # 템플릿 파일들 (선택)
│   │   └── *.md
│   └── scripts/                # 스크립트 파일들 (선택)
│       └── *.sh
```

---

## SKILL.md 작성 규칙

### 1. Frontmatter (필수)

```yaml
---
name: {skill-name}
description: |
  {한 줄 설명}
  사용 시점: {언제 사용하는지}
  전제조건: {필요 조건}
  입력: {입력 데이터}
allowed-tools: "Read, Write, Edit, Glob, Grep"  # 선택적 권한 제한
---
```

**예시:**
```yaml
---
name: balance-checker
description: |
  게임 밸런스를 분석하고 조정안을 제시합니다.
  사용 시점: 새 레벨/유닛 추가 후
  전제조건: 게임 설정 파일 존재
  입력: Level*.json, GameConfig.js
---
```

### 2. 본문 섹션 (권장 순서)

| 섹션 | 필수 | 설명 |
|------|------|------|
| `# 스킬명` | ✅ | 스킬 제목 및 간단 설명 |
| `## 참조 문서` | 선택 | 관련 API 문서, 템플릿 링크 |
| `## 입출력` | ✅ | 입력/출력 데이터 정의 |
| `## 실행 절차` | ✅ | Step 1, 2, 3... 단계별 진행 |
| `## 에러 처리` | 권장 | 오류 상황 및 대응 방법 |
| `## 완료 조건` | 권장 | 스킬 완료 기준 체크리스트 |
| `## 사용 예시` | 권장 | 실제 대화 예시 |

---

## 템플릿 작성 규칙

### 1. 파일명 규칙

- 소문자 + 하이픈 사용
- 예: `code-patterns.md`, `integration-guide.md`

### 2. 변수 문법

**변수 출력:**
```
{{VARIABLE_NAME}}
```

**조건문:**
```
{{#if CONDITION}}
// 조건 충족 시 내용
{{else}}
// 기본 내용
{{/if}}
```

**반복문:**
```
{{#each ITEMS}}
- {{this.name}}: {{this.value}}
{{/each}}
```

### 3. 공통 변수

| 변수 | 설명 |
|------|------|
| `{{DATE}}` | 분석/생성 날짜 |
| `{{PROJECT_NAME}}` | 프로젝트명 |
| `{{ENGINE_VERSION}}` | Cocos Creator 버전 |

---

## 공통 패턴

### 1. 진행상태 표시

```markdown
### 현재 진행률

| 카테고리 | 완료 | 전체 |
|---------|------|------|
| 항목 A | 2 | 4 |
| 항목 B | 0 | 3 |

**전체:** 2/7 (28%)
```

### 2. 완료 알림

```markdown
✅ **완료:** [완료된 항목 설명]
```

### 3. 에러 메시지

```markdown
❌ **오류:** [오류 설명]

**원인:** [원인 설명]
**해결:** [해결 방법]
```

### 4. 사용자 확인

```markdown
AskUserQuestion:
  question: "이 수정을 적용할까요?"
  options:
    - "적용"
    - "수정 후 적용"
    - "건너뛰기"
```

### 5. 흐름도 (ASCII)

```
┌─────────────────┐
│  Step 1         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Step 2         │────▶│  분기 A         │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Step 3         │
└─────────────────┘
```

---

## MCP 도구 사용

### 1. Serena MCP (권장)

코드 분석에 사용:
```
mcp__serena__get_symbols_overview  # 파일별 심볼 개요
mcp__serena__find_symbol           # 특정 심볼 검색
mcp__serena__list_dir              # 디렉토리 목록
```

### 2. 기본 도구 (Fallback)

Serena 사용 불가 시:
```
Grep    # 패턴 검색
Glob    # 파일 검색
Read    # 파일 읽기
Edit    # 파일 수정
```

### 3. Fallback 패턴

```markdown
**Serena MCP 사용 가능 여부 확인**

가능한 경우:
→ Serena 도구로 분석 진행

불가능한 경우:
→ 옵션 A: Serena 설치 안내 후 재시도
→ 옵션 B: Grep/Glob 기반 분석 (정확도 낮음)
```

---

## 새 스킬 생성 체크리스트

- [ ] `{skill-name}/SKILL.md` 생성
- [ ] Frontmatter 작성 (name, description)
- [ ] 입출력 정의
- [ ] 실행 절차 작성 (Step 1, 2, 3...)
- [ ] 에러 처리 섹션 추가
- [ ] 사용 예시 추가
- [ ] (선택) `templates/` 폴더 생성
- [ ] (선택) `STRUCTURE.md` 작성
- [ ] 테스트 실행

---

## 참고

- 각 스킬의 상세 구조는 해당 폴더의 `STRUCTURE.md` 참조
- 언어: 한국어
- 코드 예시: TypeScript/JavaScript
