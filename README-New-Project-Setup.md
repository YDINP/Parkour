# New Project Setup Guide

Cocos Creator 프로젝트에 MCP 서버, Hi5 SDK, 로컬라이징 시스템을 적용하는 가이드입니다.

> **전제 조건**: Claude Code `/init`은 이미 완료된 상태로 가정합니다.

---

## 목차

1. [사전 준비](#1-사전-준비)
2. [Phase 1: MCP 서버 설정](#2-phase-1-mcp-서버-설정)
3. [Phase 2: Hi5 SDK 적용](#3-phase-2-hi5-sdk-적용)
4. [Phase 3: 로컬라이징 적용](#4-phase-3-로컬라이징-적용)
5. [전체 워크플로우](#5-전체-워크플로우)
6. [Claude Code 프롬프트 예시](#6-claude-code-프롬프트-예시)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. 사전 준비

### 1.1 Claude Code 초기화 (이미 완료)

```bash
cd "프로젝트경로"
claude
/init
```

> `/init` 실행 후 `CLAUDE.md` 파일이 생성되어 있어야 합니다.

### 1.2 필요 파일 (Parkour 프로젝트에서 복사)

모든 파일을 `assets/framework/Hi5/` 폴더에 통합 관리합니다.

```
assets/framework/Hi5/
├── Hi5.ts                              # Hi5 SDK (TypeScript)
├── hi5.js                              # Hi5 SDK (JavaScript)
├── hi5Helper.js                        # Hi5 Helper 유틸리티
├── README-Hi5-Integration-TS.md        # Hi5 TS 가이드
├── README-Hi5-Integration-JS.md        # Hi5 JS 가이드
├── TROUBLESHOOTING-CocosCreator-JS.md  # Hi5 트러블슈팅
│
├── Localization/                       # 로컬라이징 시스템
│   ├── LocalizationManager.ts          # TS 버전
│   ├── LocalizationManager.js          # JS 버전
│   └── README-Localization.md          # 사용 가이드
│
└── localization-extractor/             # 추출 도구
    ├── index.ts
    ├── package.json
    ├── tsconfig.json
    ├── types.ts
    ├── config.ts                       # ⚠️ 프로젝트별 수정 필요
    ├── extractors/
    ├── generators/
    └── transformers/
```

### 1.3 환경 요구사항

- Node.js 16+
- Claude Code CLI 설치
- Cocos Creator 2.x 또는 3.x

---

## 2. Phase 1: MCP 서버 설정

Claude Code의 기능을 확장하기 위해 MCP(Model Context Protocol) 서버를 설정합니다.

### 2.1 MCP 서버 종류

| 서버 | 용도 |
|------|------|
| **Context7** | 라이브러리 문서 조회 (최신 API, 코드 예시) |
| **Serena** | 코드 심볼릭 분석/편집 (클래스, 함수 탐색 및 수정) |

### 2.2 Context7 설정

Context7은 라이브러리의 최신 문서와 코드 예시를 조회할 수 있게 해줍니다.

**설정 파일:** `~/.claude/mcp.json` (전역) 또는 `.claude/mcp.json` (프로젝트)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@anthropic/context7-mcp"]
    }
  }
}
```

**사용 예시:**
```
# Claude Code에서
"Cocos Creator 2.x의 cc.Label 사용법 알려줘"
"TypeScript의 Map 자료구조 문서 찾아줘"
```

### 2.3 Serena 설정

Serena는 코드베이스의 심볼(클래스, 함수, 변수)을 분석하고 편집할 수 있게 해줍니다.

**1. Serena 설치:**
```bash
# Python 환경 필요
pip install serena-mcp
# 또는
pipx install serena-mcp
```

**2. 설정 파일:** `~/.claude/mcp.json`

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@anthropic/context7-mcp"]
    },
    "serena": {
      "command": "serena-mcp",
      "args": ["--project-root", "."]
    }
  }
}
```

**3. 프로젝트별 설정 (권장):** `.claude/mcp.json`

```json
{
  "mcpServers": {
    "serena": {
      "command": "serena-mcp",
      "args": [
        "--project-root", ".",
        "--language", "typescript"
      ]
    }
  }
}
```

### 2.4 MCP 서버 확인

Claude Code에서 MCP 서버가 제대로 연결되었는지 확인:

```bash
# Claude Code 실행 후
/mcp
```

**정상 출력:**
```
MCP tools:
└ mcp__context7__resolve-library-id (context7)
└ mcp__context7__get-library-docs (context7)
└ mcp__serena__find_symbol (serena)
└ mcp__serena__get_symbols_overview (serena)
└ mcp__serena__replace_symbol_body (serena)
...
```

### 2.5 Serena 온보딩 (최초 1회)

프로젝트에서 Serena를 처음 사용할 때:

```
# Claude Code에서
"Serena 온보딩 해줘"
```

Serena가 프로젝트 구조를 분석하고 메모리에 저장합니다.

---

## 3. Phase 2: Hi5 SDK 적용

### 3.1 파일 복사

`assets/framework/Hi5/` 폴더 전체를 새 프로젝트에 복사합니다.

```
새프로젝트/
└── assets/
    └── framework/
        └── Hi5/
            ├── Hi5.ts (또는 hi5.js)
            ├── hi5Helper.js (또는 .ts)
            ├── README-*.md
            ├── Localization/           # 로컬라이징 시스템
            └── localization-extractor/ # 추출 도구
```

### 3.2 적용 순서

| 순서 | 작업 | 설명 |
|------|------|------|
| 1 | 파일 복사 | Hi5 폴더를 `assets/framework/` 아래에 복사 |
| 2 | SDK 초기화 | 로딩 씬에서 `Hi5SDK.Init_SDK()` 호출 |
| 3 | 메시지 핸들러 | `onHi5Message()` 콜백 구현 |
| 4 | 저장 키 설정 | `SAVE_KEY` 프로젝트별로 지정 |
| 5 | 상품/광고 정의 | `Hi5Helper`에 프로젝트 상품/광고 키 추가 |
| 6 | 데이터 구조 | `PlayerData` 인터페이스 정의 |

### 3.3 기본 초기화 코드 (TypeScript)

```typescript
import Hi5SDK, { Hi5Message, Hi5MessageData } from '../framework/Hi5/Hi5SDK';

// onLoad에서 호출
private initHi5SDK(): void {
    window.Hi5 = Hi5SDK;
    Hi5SDK.Init_SDK(this.onHi5Message.bind(this), {});
    Hi5SDK.LoadEnd();
}

private onHi5Message(data: Hi5MessageData): void {
    switch (data.fromhi5action) {
        case Hi5Message.GAME_DATA:
            // 저장 데이터 복원
            break;
        case Hi5Message.SHOW_AD:
            // 광고 결과 처리
            break;
        // ... 기타 메시지 처리
    }
}
```

> 상세 내용: `assets/framework/Hi5/README-Hi5-Integration-TS.md` 참고

---

## 4. Phase 3: 로컬라이징 적용

> **주의**: 이 프로젝트의 하드코딩된 텍스트는 **중국어(cn)**입니다.

### 4.1 Step 1: 추출 도구 설치

Hi5 폴더 복사 시 이미 포함되어 있습니다.

```bash
# 의존성 설치
cd assets/framework/Hi5/localization-extractor
npm install
```

### 4.2 Step 2: config.ts 수정

프로젝트 구조에 맞게 경로 및 설정 수정:

```typescript
export const config: ExtractorConfig = {
    // 경로 설정 (프로젝트에 맞게 수정)
    paths: {
        prefabs: 'assets/resources/prefabs',            // Prefab 경로
        scripts: 'assets/Scripts',                       // Script 경로
        output: 'assets/framework/Hi5/Localization',    // 출력 경로
        existingJson: []                                 // 첫 실행은 빈 배열
    },

    // ⚠️ 기본 언어: 중국어 (하드코딩된 언어)
    defaultLanguage: 'cn',

    // 지원 언어
    supportedLanguages: ['cn', 'ko', 'en'],

    // 키 접두사 매핑 (파일명 → 키 접두사)
    keyPrefixes: {
        'UIMain': 'main',
        'UIShop': 'shop',
        'UIGame': 'game',
        'UIFail': 'fail',
        'UIWin': 'win',
        // ... 프로젝트에 맞게 추가
    },

    // 제외 패턴
    exclude: {
        files: [
            '**/node_modules/**',
            '**/*.d.ts',
            '**/test/**'
        ],
        texts: [
            /^\d+$/,                        // 숫자만
            /^@/,                           // 이미 로컬라이징된 것
            /^https?:\/\//,                 // URL
            /^#[0-9A-Fa-f]{6,8}$/,          // 색상 코드
            /^[a-z_][a-z0-9_]*$/i,          // 변수명 스타일
            /^\s*$/,                        // 빈 문자열
        ]
    }
};
```

### 4.3 Step 3: 텍스트 추출 (Preview)

```bash
# 미리보기 - 변환 없이 추출 결과만 확인
npm run preview
# 또는
npx ts-node index.ts --preview
```

**생성되는 파일:**

| 파일 | 용도 |
|------|------|
| `key-mapping.csv` | 추출된 텍스트 → 키 매핑 테이블 |
| `extraction-report.json` | 상세 추출 리포트 |

### 4.4 Step 4: 키값 검토 및 조정

`assets/framework/Hi5/Localization/key-mapping.csv` 파일 검토:

```csv
Key,Chinese,Korean,English,Source File,Line
fail.retry,重试,,,UIFail.prefab,45
game.score,分数: {0},,,Game.ts,123
main.start,开始游戏,,,UIMain.prefab,12
shop.buy,购买,,,UIShop.ts,89
```

**검토 항목:**
- [ ] 키 네이밍이 적절한가?
- [ ] 불필요한 텍스트가 포함되었는가? (숫자, 기호 등)
- [ ] 동적 텍스트의 플레이스홀더가 올바른가? (`{0}`, `{1}` 등)

### 4.5 Step 5: JSON 파일 생성

```bash
# JSON만 생성 (파일 변환 없음)
npm run json-only
# 또는
npx ts-node index.ts --json-only
```

**생성되는 파일:** `assets/framework/Hi5/Localization/extracted-new.json`

```json
{
  "cn": {
    "fail.retry": "重试",
    "game.score": "分数: {0}",
    "main.start": "开始游戏",
    "shop.buy": "购买"
  },
  "ko": {
    "fail.retry": "",
    "game.score": "",
    "main.start": "",
    "shop.buy": ""
  },
  "en": {
    "fail.retry": "",
    "game.score": "",
    "main.start": "",
    "shop.buy": ""
  }
}
```

### 4.6 Step 6: 번역 작업

JSON 파일에 한국어/영어 번역 추가:

```json
{
  "cn": {
    "fail.retry": "重试",
    "game.score": "分数: {0}",
    "main.start": "开始游戏",
    "shop.buy": "购买"
  },
  "ko": {
    "fail.retry": "다시 시도",
    "game.score": "점수: {0}",
    "main.start": "게임 시작",
    "shop.buy": "구매"
  },
  "en": {
    "fail.retry": "Retry",
    "game.score": "Score: {0}",
    "main.start": "Start Game",
    "shop.buy": "Buy"
  }
}
```

### 4.7 Step 7: LocalizationManager 설치

Hi5 폴더 복사 시 이미 포함되어 있습니다.

```
새프로젝트/assets/framework/Hi5/Localization/
├── LocalizationManager.ts (또는 .js)
├── extracted-new.json (또는 프로젝트명.json으로 변경)
└── README-Localization.md
```

**로딩 씬 설정:**

1. 빈 노드 생성 → `LocalizationManager` 컴포넌트 추가
2. Inspector에서 설정:

| 속성 | 값 |
|------|-----|
| `localizationJsonFiles` | JSON 파일 드래그 |
| `defaultLanguage` | `"cn"` (또는 원하는 기본 언어) |
| `autoLocalizeOnStart` | `true` |
| `autoLocalizeOnSceneLoaded` | `true` |

### 4.8 Step 8: 변환 적용

```bash
# 실제 변환 적용 (Prefab + Script)
npm run apply
# 또는
npx ts-node index.ts --apply
```

**변환 내용:**

| Before (중국어 하드코딩) | After (키 참조) |
|-------------------------|-----------------|
| `label.string = "重试"` | `label.string = "@fail.retry"` |
| `Toast.make("保存成功")` | `Toast.make(LocalizationManager.getText("@save.success"))` |
| Prefab Label: `"开始游戏"` | Prefab Label: `"@main.start"` |

### 4.9 Step 9: 테스트 및 롤백

```bash
# Cocos Creator 에디터에서 실행 테스트

# 문제 발생 시 롤백
npm run rollback
# 또는
npx ts-node index.ts --rollback
```

### 4.10 Step 10: 중국어 주석 → 한글 변환 (선택)

코드의 중국어 주석을 한글로 변환합니다.

#### 10-1. 중국어 주석 추출

```bash
cd assets/framework/Hi5/localization-extractor
npx ts-node index.ts --comments
```

**생성되는 파일:**
- `comment-translations.csv` - 주석 번역용 CSV
- `comment-translations.json` - JSON 형식

**CSV 예시:**
```csv
File,Line,Type,Chinese,Korean (translated)
"assets/Game/Script/Player.ts",25,"single","初始化玩家数据",""
"assets/Game/Script/Game.ts",100,"jsdoc","游戏开始时调用",""
```

#### 10-2. 번역 입력

CSV 파일의 `Korean (translated)` 열에 번역 입력:

```csv
File,Line,Type,Chinese,Korean (translated)
"assets/Game/Script/Player.ts",25,"single","初始化玩家数据","플레이어 데이터 초기화"
"assets/Game/Script/Game.ts",100,"jsdoc","游戏开始时调用","게임 시작 시 호출"
```

#### 10-3. 번역 적용

```bash
npx ts-node index.ts --comments-apply
```

**변환 예시:**

| Before | After |
|--------|-------|
| `// 初始化玩家数据` | `// 플레이어 데이터 초기화` |
| `/** 游戏开始时调用 */` | `/** 게임 시작 시 호출 */` |

#### 10-4. 롤백 (문제 발생 시)

```bash
npx ts-node index.ts --comments-rollback
```

---

## 5. 전체 워크플로우

```
┌─────────────────────────────────────────────────────────────┐
│  0. Claude Code 초기화 (이미 완료)                          │
│     /init → CLAUDE.md 생성됨                                │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  1. MCP 서버 설정                                           │
│     - Context7 설정 (라이브러리 문서 조회)                  │
│     - Serena 설정 (코드 심볼릭 분석/편집)                   │
│     - /mcp 로 연결 확인                                     │
│     - Serena 온보딩 (최초 1회)                              │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Hi5 폴더 복사                                           │
│     - assets/framework/Hi5/ 전체 복사                       │
│     - (Hi5 SDK + Localization + extractor 포함)             │
│     - 로딩 씬에 SDK 초기화 코드 추가                        │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 추출 도구 설치                                          │
│     - cd assets/framework/Hi5/localization-extractor        │
│     - npm install                                           │
│     - config.ts 경로/언어 수정 (defaultLanguage: 'cn')      │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 텍스트 추출                                             │
│     npm run preview                                         │
│     → 중국어 하드코딩 텍스트 추출                           │
│     → key-mapping.csv 생성                                  │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 키값 검토                                               │
│     - key-mapping.csv 확인                                  │
│     - 불필요한 항목 제거                                    │
│     - 키 네이밍 조정                                        │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  6. JSON 파일 생성                                          │
│     npm run json-only                                       │
│     → extracted-new.json 생성                               │
│     → cn = 추출된 텍스트, ko/en = 빈 값                     │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  7. 번역 작업                                               │
│     - ko (한국어) 번역 추가                                 │
│     - en (영어) 번역 추가                                   │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  8. LocalizationManager 설치                                │
│     - LocalizationManager.ts 복사                           │
│     - 로딩 씬에 노드 추가                                   │
│     - JSON 파일 등록                                        │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  9. 변환 적용                                               │
│     npm run apply                                           │
│     → Prefab/Script의 중국어 → @키 변환                     │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  10. 테스트                                                 │
│     - Cocos Creator에서 실행                                │
│     - 언어 변경 테스트                                      │
│     - 문제 시: npm run rollback                             │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  11. (선택) 중국어 주석 → 한글 변환                         │
│     - npx ts-node index.ts --comments                       │
│     - CSV 파일에 번역 입력                                  │
│     - npx ts-node index.ts --comments-apply                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Claude Code 프롬프트 예시

### 6.1 MCP 서버 설정 요청

```
# Serena 온보딩
"Serena 온보딩 해줘"

# 문서 조회 (Context7 활용)
"Cocos Creator 2.x의 cc.Label 사용법 알려줘"
"TypeScript의 async/await 패턴 문서 찾아줘"

# 코드 분석 (Serena 활용)
"Player 클래스의 구조 분석해줘"
"PlayerInfo에서 gold 변수를 참조하는 모든 코드 찾아줘"
```

### 6.2 전체 자동화 요청

```
이 프로젝트에 로컬라이징 시스템을 적용해줘.
- 하드코딩된 텍스트는 중국어(cn)야
- 지원 언어: cn, ko, en
- 추출 → 키 생성 → JSON 생성 → 변환 순서로 진행해줘
```

### 6.3 단계별 요청

```
# Step 1: 추출
"Prefab과 Script에서 중국어 텍스트를 추출해서 key-mapping.csv 만들어줘"

# Step 2: JSON 생성
"추출된 텍스트로 로컬라이징 JSON 파일 생성해줘. 기본 언어는 cn이야"

# Step 3: 변환
"Prefab의 Label들을 @키 형식으로 변환해줘"
"Script의 하드코딩된 텍스트를 LocalizationManager.getText() 호출로 변환해줘"
```

### 6.4 Hi5 SDK 요청

```
"이 프로젝트에 Hi5 SDK를 적용해줘.
Parkour 프로젝트의 Hi5 폴더를 참고해서 로딩 씬에 초기화 코드 추가하고
데이터 저장 로직을 연동해줘"
```

---

## 7. 트러블슈팅

### 7.1 MCP 서버 연결 실패

**문제:** `/mcp` 실행 시 서버가 표시되지 않음

**해결:**
1. mcp.json 파일 위치 확인
   - 전역: `~/.claude/mcp.json` (Windows: `%USERPROFILE%\.claude\mcp.json`)
   - 프로젝트: `.claude/mcp.json`
2. JSON 문법 오류 확인 (쉼표, 따옴표 등)
3. Claude Code 재시작

**문제:** Serena 연결 오류

**해결:**
```bash
# Python 환경 확인
python --version

# Serena 재설치
pip uninstall serena-mcp
pip install serena-mcp

# 또는 pipx 사용
pipx install serena-mcp
```

**문제:** Context7 연결 오류

**해결:**
```bash
# npx 캐시 클리어
npx clear-npx-cache

# Node.js 버전 확인 (16+ 필요)
node --version
```

### 7.2 추출 도구 오류

**문제:** `npm run preview` 실행 시 경로 오류

**해결:**
```typescript
// config.ts 경로 확인 (assets/framework/Hi5/localization-extractor/config.ts)
paths: {
    prefabs: 'assets/resources/prefabs',           // 실제 Prefab 경로로 수정
    scripts: 'assets/Scripts',                      // 실제 Script 경로로 수정
    output: 'assets/framework/Hi5/Localization',   // 출력 경로
}
```

### 7.3 변환 후 텍스트가 안 보임

**문제:** `@키이름`이 그대로 표시됨

**해결:**
1. LocalizationManager 노드가 로딩 씬에 있는지 확인
2. JSON 파일이 Inspector에 등록되었는지 확인
3. `autoLocalizeOnStart = true` 확인

### 7.4 동적 텍스트 변환 실패

**문제:** `"分数: " + score` 같은 패턴이 제대로 변환되지 않음

**해결:** 수동으로 수정 필요
```typescript
// Before
label.string = "分数: " + score;

// After
label.string = LocalizationManager.getTextWithArgs("@game.score", score);

// JSON
{ "cn": { "game.score": "分数: {0}" } }
```

### 7.5 롤백 후에도 문제 지속

**해결:**
```bash
# Git으로 복원
git checkout -- assets/
```

---

## 부록: 파일 체크리스트

### MCP 서버 설정
- [ ] `~/.claude/mcp.json` 또는 `.claude/mcp.json` 생성
- [ ] Context7 설정 추가
- [ ] Serena 설치 (`pip install serena-mcp`)
- [ ] Serena 설정 추가
- [ ] `/mcp` 명령으로 연결 확인
- [ ] Serena 온보딩 실행 (최초 1회)

### Hi5 SDK 및 파일 복사
- [ ] `assets/framework/Hi5/` 폴더 전체 복사 (Hi5 + Localization + extractor 포함)
- [ ] 로딩 씬에 SDK 초기화 코드 추가
- [ ] `SAVE_KEY` 설정
- [ ] 상품/광고 키 정의
- [ ] 메시지 핸들러 구현

### 로컬라이징
- [ ] `cd assets/framework/Hi5/localization-extractor`
- [ ] `npm install` 실행
- [ ] `config.ts` 경로 수정
- [ ] `config.ts` 기본 언어를 `cn`으로 설정
- [ ] `npm run preview` 실행
- [ ] `key-mapping.csv` 검토
- [ ] `npm run json-only` 실행
- [ ] 번역 작업 (ko, en)
- [ ] `LocalizationManager.ts` 확인 (이미 복사됨)
- [ ] 로딩 씬에 노드 추가
- [ ] JSON 파일 등록
- [ ] `npm run apply` 실행
- [ ] 테스트

### 주석 번역 (선택)
- [ ] `npx ts-node index.ts --comments` 실행
- [ ] `comment-translations.csv`에 한글 번역 입력
- [ ] `npx ts-node index.ts --comments-apply` 실행
- [ ] 주석 변환 확인

---

## 관련 문서

- [Hi5 SDK Integration (TS)](assets/framework/Hi5/README-Hi5-Integration-TS.md)
- [Hi5 SDK Integration (JS)](assets/framework/Hi5/README-Hi5-Integration-JS.md)
- [Localization System Guide](assets/framework/Hi5/Localization/README-Localization.md)
- [Localization Extractor Tool](assets/framework/Hi5/localization-extractor/README.md)
