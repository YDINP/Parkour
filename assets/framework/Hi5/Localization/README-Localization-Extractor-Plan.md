# 로컬라이징 추출 도구 제작 계획

프로젝트의 하드코딩된 텍스트를 자동으로 찾아 로컬라이징 키로 변환하는 도구 제작 계획입니다.

---

## 1. 개요

### 1.1 목표
- Prefab 파일의 Label 텍스트 추출 및 키 변환
- TypeScript 코드의 하드코딩된 문자열 추출 및 키 변환
- 로컬라이징 JSON 파일 자동 생성

### 1.2 대상 파일
| 파일 유형 | 확장자 | 예상 개수 |
|----------|--------|----------|
| Prefab | `.prefab` | ~100개 |
| TypeScript | `.ts` | ~150개 |
| Scene | `.fire` | ~5개 |

---

## 2. 추출 대상 패턴

### 2.1 Prefab 파일 (JSON 형식)
```json
// Label 컴포넌트의 _string 속성
{
  "__type__": "cc.Label",
  "_string": "도전실패",  // ← 추출 대상
  ...
}
```

**추출 조건:**
- `_string` 값이 비어있지 않음
- `@`로 시작하지 않음 (이미 로컬라이징된 것 제외)
- 숫자만 있는 것 제외 (`"123"`, `"1"`)
- 플레이스홀더 제외 (`"LV.999"`, `"%d"`)

### 2.2 TypeScript 파일

**패턴 1: Label.string 직접 할당**
```typescript
this.labelTip.string = "登录失败"      // 중국어
this.label.string = "도전 시작"        // 한국어
label.string = "Loading..."           // 영어
```

**패턴 2: Toast 메시지**
```typescript
Toast.make("钻石不足！")
Toast.make("다이아 부족!")
```

**패턴 3: MessageBox 콘텐츠**
```typescript
MessageBox.showWith({
    title: "提示",
    content: "确定使用吗？",
    confirmTxt: "确定"
})
```

**추출 조건:**
- 한글/중국어/일본어 문자 포함
- 이미 `LocalizationManager.getText()` 사용하는 것 제외
- 주석 처리된 것 제외

---

## 3. 도구 구조

### 3.1 파일 구조
```
tools/
├── localization-extractor/
│   ├── index.ts              # 메인 진입점
│   ├── extractors/
│   │   ├── PrefabExtractor.ts    # Prefab 파일 추출기
│   │   ├── ScriptExtractor.ts    # TypeScript 파일 추출기
│   │   └── SceneExtractor.ts     # Scene 파일 추출기
│   ├── generators/
│   │   ├── KeyGenerator.ts       # 키 생성기
│   │   └── JsonGenerator.ts      # JSON 파일 생성기
│   ├── transformers/
│   │   ├── PrefabTransformer.ts  # Prefab 변환기
│   │   └── ScriptTransformer.ts  # TypeScript 변환기
│   ├── types.ts              # 타입 정의
│   └── config.ts             # 설정
```

### 3.2 실행 흐름
```
[1. 스캔]
    │
    ├── Prefab 스캔 → PrefabExtractor
    ├── Script 스캔 → ScriptExtractor
    └── Scene 스캔 → SceneExtractor
    │
    ▼
[2. 추출]
    │
    ├── 텍스트 추출
    ├── 컨텍스트 분석 (파일명, 노드명, 변수명)
    └── 중복 제거
    │
    ▼
[3. 키 생성]
    │
    ├── 컨텍스트 기반 키 생성
    ├── 기존 키와 충돌 확인
    └── 키 매핑 테이블 생성
    │
    ▼
[4. 변환]
    │
    ├── Prefab: "_string" 값을 "@키"로 변경
    ├── Script: 문자열을 LocalizationManager.getText("@키")로 변경
    └── 백업 파일 생성
    │
    ▼
[5. JSON 생성]
    │
    ├── 기존 JSON 병합
    └── 새 JSON 파일 출력
```

---

## 4. 키 생성 규칙

### 4.1 자동 키 생성 알고리즘

```typescript
function generateKey(context: ExtractContext): string {
    const { fileName, nodeName, componentName, originalText } = context;

    // 1. 파일명에서 UI 이름 추출
    // UIFail.prefab → "Fail"
    // UIHeroShop.prefab → "HeroShop"
    const uiName = extractUIName(fileName);

    // 2. 노드명에서 요소 타입 추출
    // "btn_confirm" → "btn"
    // "lab_title" → "title"
    const elementType = extractElementType(nodeName);

    // 3. 텍스트 해시 (충돌 방지)
    const textHash = hashText(originalText).substring(0, 4);

    // 4. 키 조합
    // 예: "Fail.title", "HeroShop.btn.confirm"
    return `${uiName}.${elementType}.${textHash}`;
}
```

### 4.2 키 네이밍 예시

| 원본 텍스트 | 파일/노드 | 생성된 키 |
|------------|----------|----------|
| `도전실패` | UIFail.prefab / lab_title | `Fail.title` |
| `확인` | btn_confirm | `btn.confirm` |
| `登录失败` | LoadingScene.ts | `loading.login_failed` |
| `钻石不足！` | Toast.make() | `toast.diamond_not_enough` |

---

## 5. 구현 상세

### 5.1 PrefabExtractor

```typescript
interface PrefabExtractResult {
    filePath: string;
    items: {
        nodeId: number;
        nodeName: string;
        componentType: string;
        propertyName: string;
        originalText: string;
        lineNumber: number;
    }[];
}

class PrefabExtractor {
    extract(prefabPath: string): PrefabExtractResult {
        const json = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));
        const items = [];

        // JSON 배열 순회
        for (let i = 0; i < json.length; i++) {
            const node = json[i];

            // Label 컴포넌트 찾기
            if (node.__type__ === 'cc.Label') {
                const text = node._string;

                // 필터링
                if (this.shouldExtract(text)) {
                    items.push({
                        nodeId: i,
                        nodeName: this.getNodeName(json, i),
                        componentType: 'Label',
                        propertyName: '_string',
                        originalText: text,
                        lineNumber: this.findLineNumber(prefabPath, text)
                    });
                }
            }

            // RichText 컴포넌트
            if (node.__type__ === 'cc.RichText') {
                // ... 유사 로직
            }
        }

        return { filePath: prefabPath, items };
    }

    shouldExtract(text: string): boolean {
        if (!text || text.trim() === '') return false;
        if (text.startsWith('@')) return false;  // 이미 로컬라이징됨
        if (/^\d+$/.test(text)) return false;    // 숫자만
        if (/^[LV\.\d%]+$/i.test(text)) return false;  // LV.123, 20%

        // CJK 문자 포함 여부
        const hasCJK = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(text);

        return hasCJK || text.length > 3;
    }
}
```

### 5.2 ScriptExtractor

```typescript
interface ScriptExtractResult {
    filePath: string;
    items: {
        lineNumber: number;
        columnStart: number;
        columnEnd: number;
        pattern: 'label.string' | 'Toast.make' | 'MessageBox' | 'other';
        originalText: string;
        fullMatch: string;
    }[];
}

class ScriptExtractor {
    private patterns = [
        // label.string = "텍스트"
        /(\w+\.string)\s*=\s*["']([^"']+)["']/g,

        // Toast.make("텍스트")
        /Toast\.make\(\s*["']([^"']+)["']\s*\)/g,

        // title: "텍스트", content: "텍스트"
        /(title|content|confirmTxt|cancelText):\s*["']([^"']+)["']/g,
    ];

    extract(scriptPath: string): ScriptExtractResult {
        const content = fs.readFileSync(scriptPath, 'utf8');
        const lines = content.split('\n');
        const items = [];

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];

            // 주석 제외
            if (line.trim().startsWith('//')) continue;

            // 이미 LocalizationManager 사용 중이면 제외
            if (line.includes('LocalizationManager.getText')) continue;

            for (const pattern of this.patterns) {
                let match;
                while ((match = pattern.exec(line)) !== null) {
                    const text = match[2] || match[1];

                    if (this.shouldExtract(text)) {
                        items.push({
                            lineNumber: lineNum + 1,
                            columnStart: match.index,
                            columnEnd: match.index + match[0].length,
                            pattern: this.detectPattern(match[0]),
                            originalText: text,
                            fullMatch: match[0]
                        });
                    }
                }
            }
        }

        return { filePath: scriptPath, items };
    }
}
```

### 5.3 PrefabTransformer

```typescript
class PrefabTransformer {
    transform(
        prefabPath: string,
        keyMap: Map<string, string>
    ): void {
        // 1. 백업 생성
        const backupPath = prefabPath + '.backup';
        fs.copyFileSync(prefabPath, backupPath);

        // 2. JSON 파싱
        let content = fs.readFileSync(prefabPath, 'utf8');
        const json = JSON.parse(content);

        // 3. 변환
        for (const node of json) {
            if (node.__type__ === 'cc.Label' && node._string) {
                const key = keyMap.get(node._string);
                if (key) {
                    node._string = `@${key}`;
                }
            }
        }

        // 4. 저장 (포맷 유지)
        fs.writeFileSync(prefabPath, JSON.stringify(json, null, 2));
    }
}
```

### 5.4 ScriptTransformer

```typescript
class ScriptTransformer {
    transform(
        scriptPath: string,
        keyMap: Map<string, string>
    ): void {
        // 1. 백업 생성
        fs.copyFileSync(scriptPath, scriptPath + '.backup');

        // 2. 내용 읽기
        let content = fs.readFileSync(scriptPath, 'utf8');

        // 3. import 문 추가 (없으면)
        if (!content.includes('LocalizationManager')) {
            const importStatement =
                'import { LocalizationManager } from "../../Localization/LocalizationManager";\n';
            content = importStatement + content;
        }

        // 4. 패턴별 변환
        for (const [original, key] of keyMap) {
            // label.string = "텍스트" → label.string = LocalizationManager.getText("@키")
            content = content.replace(
                new RegExp(`(\\.string\\s*=\\s*)["']${this.escapeRegex(original)}["']`, 'g'),
                `$1LocalizationManager.getText("@${key}")`
            );

            // Toast.make("텍스트") → Toast.make(LocalizationManager.getText("@키"))
            content = content.replace(
                new RegExp(`Toast\\.make\\(\\s*["']${this.escapeRegex(original)}["']\\s*\\)`, 'g'),
                `Toast.make(LocalizationManager.getText("@${key}"))`
            );
        }

        // 5. 저장
        fs.writeFileSync(scriptPath, content);
    }
}
```

---

## 6. JSON 생성기

### 6.1 JsonGenerator

```typescript
interface LocalizationEntry {
    key: string;
    ko: string;
    en: string;
    cn: string;
    source: string;  // 원본 파일 경로
}

class JsonGenerator {
    generate(entries: LocalizationEntry[]): void {
        // 1. 기존 JSON 로드
        const existingData = this.loadExistingJson();

        // 2. 새 데이터 병합
        const output = {
            ko: { ...existingData.ko },
            en: { ...existingData.en },
            cn: { ...existingData.cn }
        };

        for (const entry of entries) {
            // 원본 텍스트 언어 감지
            const sourceLang = this.detectLanguage(entry.ko);

            output.ko[entry.key] = entry.ko;
            output.en[entry.key] = sourceLang === 'en' ? entry.ko : entry.key;
            output.cn[entry.key] = sourceLang === 'cn' ? entry.ko : entry.key;
        }

        // 3. 파일 출력
        fs.writeFileSync(
            'assets/Localization/Parkour - extracted.json',
            JSON.stringify(output, null, 2)
        );
    }

    detectLanguage(text: string): 'ko' | 'en' | 'cn' {
        if (/[\uac00-\ud7af]/.test(text)) return 'ko';  // 한글
        if (/[\u4e00-\u9fff]/.test(text)) return 'cn';  // 중국어
        return 'en';
    }
}
```

---

## 7. 설정 파일

### 7.1 config.ts

```typescript
export const config = {
    // 스캔 경로
    paths: {
        prefabs: 'assets/resources/prefabs',
        scripts: 'assets/Game/Script',
        scenes: 'assets/Game/Scene',
        output: 'assets/Localization'
    },

    // 제외 패턴
    exclude: {
        // 파일 제외
        files: [
            '**/node_modules/**',
            '**/*.d.ts',
            '**/test/**'
        ],
        // 텍스트 제외 패턴
        texts: [
            /^\d+$/,           // 숫자만
            /^[LV\.\d%]+$/i,   // LV.123, 20%
            /^[a-zA-Z_]+$/,    // 영어 식별자
            /^\s*$/,           // 공백만
        ]
    },

    // 키 접두사 매핑
    keyPrefixes: {
        'UIFail': 'Fail',
        'UIHeroShop': 'HeroShop',
        'LoadingScene': 'loading',
        // ...
    },

    // 백업 설정
    backup: {
        enabled: true,
        suffix: '.backup'
    }
};
```

---

## 8. 실행 방법

### 8.1 CLI 인터페이스

```bash
# 전체 스캔 (미리보기만)
npm run extract-localization -- --preview

# Prefab만 스캔
npm run extract-localization -- --type=prefab --preview

# Script만 스캔
npm run extract-localization -- --type=script --preview

# 실제 변환 실행
npm run extract-localization -- --apply

# 특정 파일만
npm run extract-localization -- --file="UIFail.prefab" --apply

# JSON만 생성 (파일 변환 없이)
npm run extract-localization -- --json-only
```

### 8.2 대화형 모드

```
$ npm run extract-localization

🔍 스캔 중...
  - Prefab: 45개 파일
  - Script: 67개 파일

📝 추출 결과:
  - Prefab 텍스트: 156개
  - Script 텍스트: 89개
  - 중복 제거 후: 198개

키 생성 방식을 선택하세요:
  [1] 자동 생성 (컨텍스트 기반)
  [2] 수동 입력
  [3] 하이브리드 (자동 + 검토)

> 3

📋 검토 모드:
  [1/198] "도전실패" (UIFail.prefab)
          제안 키: Fail.title
          [Enter] 수락 / [s] 건너뛰기 / [e] 직접 입력

> [Enter]

  [2/198] "登录失败" (LoadingScene.ts:213)
          제안 키: loading.login_failed
          [Enter] 수락 / [s] 건너뛰기 / [e] 직접 입력

> e
  새 키 입력: loading.status.failed

...

✅ 변환 완료!
  - 변환된 Prefab: 23개
  - 변환된 Script: 15개
  - 생성된 JSON: Parkour - extracted.json
  - 백업 파일: 38개
```

---

## 9. 안전장치

### 9.1 백업 시스템
- 모든 변환 전 `.backup` 파일 생성
- 롤백 명령 지원: `npm run extract-localization -- --rollback`

### 9.2 검증
- 변환 후 JSON 파싱 테스트
- Prefab 무결성 검사
- TypeScript 구문 검사 (ts-node)

### 9.3 리포트 생성
```
extraction-report-2024-01-15.json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "scannedFiles": 112,
    "extractedTexts": 198,
    "transformedFiles": 38
  },
  "details": [
    {
      "file": "UIFail.prefab",
      "extracted": 3,
      "keys": ["Fail.title", "Fail.reason", "Fail.hint"]
    }
  ]
}
```

---

## 10. 구현 단계

### Phase 1: 스캔 및 추출 (1-2일)
- [ ] PrefabExtractor 구현
- [ ] ScriptExtractor 구현
- [ ] 필터링 로직 구현
- [ ] 미리보기 기능

### Phase 2: 키 생성 (1일)
- [ ] KeyGenerator 구현
- [ ] 컨텍스트 분석 로직
- [ ] 중복/충돌 검사

### Phase 3: 변환기 (2일)
- [ ] PrefabTransformer 구현
- [ ] ScriptTransformer 구현
- [ ] 백업 시스템
- [ ] import 문 자동 추가

### Phase 4: JSON 생성 (1일)
- [ ] JsonGenerator 구현
- [ ] 기존 JSON 병합
- [ ] 언어 감지

### Phase 5: CLI 및 마무리 (1일)
- [ ] CLI 인터페이스
- [ ] 대화형 모드
- [ ] 리포트 생성
- [ ] 문서화

**예상 총 소요 시간: 6-8일**

---

## 11. 주의사항

1. **Prefab 포맷 유지**: JSON 저장 시 Cocos Creator 호환 포맷 유지
2. **인코딩**: UTF-8 유지 (한글/중국어)
3. **상대 경로**: import 경로 계산 주의
4. **Git 커밋**: 변환 전후 커밋 분리 권장
5. **테스트**: 변환 후 에디터에서 Prefab 열어보기

---

## 12. getTextWithArgs 처리 (플레이스홀더)

### 12.1 프로젝트에서 사용 중인 플레이스홀더 패턴

| 패턴 | 예시 | 설명 |
|------|------|------|
| `{0}`, `{1}` | `"레벨 {0}에 도달시 잠금 해제"` | getTextWithArgs 용 |
| `%d` | `"재사용 대기시간 %d초"` | printf 스타일 (숫자) |
| `%s` | `"체력이 %s 포인트 증가"` | printf 스타일 (문자열) |

### 12.2 문자열 연결 패턴 → getTextWithArgs 변환

**변환 전 (TypeScript):**
```typescript
this.lvLab.string = "LV." + lv;
label.string = "+" + n;
label.string = "X" + reward.num.toString();
label.string = "코인: " + coins;
```

**변환 후:**
```typescript
this.lvLab.string = LocalizationManager.getTextWithArgs("@level.prefix", lv);
// JSON: "level.prefix": "LV.{0}"

label.string = LocalizationManager.getTextWithArgs("@reward.plus", n);
// JSON: "reward.plus": "+{0}"

label.string = LocalizationManager.getTextWithArgs("@reward.multiply", reward.num);
// JSON: "reward.multiply": "X{0}"

label.string = LocalizationManager.getTextWithArgs("@currency.coin_amount", coins);
// JSON: "currency.coin_amount": "코인: {0}"
```

### 12.3 ScriptExtractor - 동적 텍스트 패턴 추가

```typescript
class ScriptExtractor {
    private dynamicPatterns = [
        // "텍스트" + 변수
        /(\w+\.string)\s*=\s*["']([^"']+)["']\s*\+\s*(\w+(?:\.\w+)*(?:\(\))?)/g,

        // 변수 + "텍스트"
        /(\w+\.string)\s*=\s*(\w+(?:\.\w+)*)\s*\+\s*["']([^"']+)["']/g,

        // 템플릿 리터럴
        /(\w+\.string)\s*=\s*`([^`]*\$\{[^}]+\}[^`]*)`/g,
    ];

    extractDynamic(scriptPath: string): DynamicExtractResult[] {
        const content = fs.readFileSync(scriptPath, 'utf8');
        const results = [];

        for (const pattern of this.dynamicPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                results.push({
                    type: 'dynamic',
                    original: match[0],
                    staticPart: match[2],      // "LV."
                    dynamicPart: match[3],     // lv
                    suggestedKey: this.generateDynamicKey(match),
                    suggestedJson: this.generateJsonWithPlaceholder(match),
                    suggestedCode: this.generateGetTextWithArgs(match)
                });
            }
        }

        return results;
    }

    generateGetTextWithArgs(match: RegExpMatchArray): string {
        const [full, prop, staticText, dynamicVar] = match;
        const key = this.generateDynamicKey(match);

        // "LV." + lv → getTextWithArgs("@level.prefix", lv)
        return `${prop} = LocalizationManager.getTextWithArgs("@${key}", ${dynamicVar})`;
    }

    generateJsonWithPlaceholder(match: RegExpMatchArray): object {
        const [full, prop, staticText, dynamicVar] = match;

        // "LV." + lv → "LV.{0}"
        // "+" + n → "+{0}"
        return {
            ko: `${staticText}{0}`,
            en: `${staticText}{0}`,
            cn: `${staticText}{0}`
        };
    }
}
```

### 12.4 %d/%s → {0}/{1} 변환기

기존 printf 스타일을 getTextWithArgs 호환으로 변환:

```typescript
class PlaceholderConverter {
    /**
     * %d, %s 패턴을 {0}, {1} 패턴으로 변환
     */
    convert(text: string): string {
        let index = 0;
        return text.replace(/%[ds]/g, () => `{${index++}}`);
    }

    /**
     * JSON 파일 전체 변환
     */
    convertJsonFile(jsonPath: string): void {
        const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        for (const lang in json) {
            for (const key in json[lang]) {
                json[lang][key] = this.convert(json[lang][key]);
            }
        }

        fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
    }
}

// 사용 예시
const converter = new PlaceholderConverter();

// 변환 전: "재사용 대기시간 %d초"
// 변환 후: "재사용 대기시간 {0}초"
converter.convert("재사용 대기시간 %d초");

// 변환 전: "체력이 %s 포인트, 공격력 %d 증가"
// 변환 후: "체력이 {0} 포인트, 공격력 {1} 증가"
converter.convert("체력이 %s 포인트, 공격력 %d 증가");
```

### 12.5 동적 텍스트 검토 모드

```
📋 동적 텍스트 검토:

[1/15] UIReady.ts:144
  현재: this.lvLab.string = "LV." + lv;
  제안:
    - 키: "level.prefix"
    - JSON: { "ko": "LV.{0}", "en": "LV.{0}", "cn": "LV.{0}" }
    - 코드: this.lvLab.string = LocalizationManager.getTextWithArgs("@level.prefix", lv);

  [Enter] 수락 / [s] 건너뛰기 / [e] 편집

[2/15] UIEndPage.ts:173
  현재: label.string = "+" + n;
  제안:
    - 키: "reward.plus"
    - JSON: { "ko": "+{0}", "en": "+{0}", "cn": "+{0}" }
    - 코드: label.string = LocalizationManager.getTextWithArgs("@reward.plus", n);

  [Enter] 수락 / [s] 건너뛰기 / [e] 편집
```

### 12.6 기존 %d/%s JSON 마이그레이션

```bash
# 기존 JSON의 %d/%s를 {0}/{1}로 일괄 변환
npm run extract-localization -- --migrate-placeholders

# 특정 파일만
npm run extract-localization -- --migrate-placeholders --file="Parkour - hero.json"
```

**마이그레이션 결과:**

```json
// 변환 전 (Parkour - hero.json)
{
  "ko": {
    "hero.1.desc": "5초간 연속 발사, 재사용 대기시간 %d초"
  }
}

// 변환 후
{
  "ko": {
    "hero.1.desc": "5초간 연속 발사, 재사용 대기시간 {0}초"
  }
}
```

### 12.7 복잡한 동적 텍스트 처리

```typescript
// 복잡한 케이스 - 수동 검토 필요
label.string = name + "님이 " + gold + "골드를 획득했습니다!";

// 권장 변환
label.string = LocalizationManager.getTextWithArgs(
    "@reward.acquired",
    name,
    gold
);
// JSON: "reward.acquired": "{0}님이 {1}골드를 획득했습니다!"
```

---

## 13. 추가 고려사항

### 13.1 기타 동적 텍스트 처리
```typescript
// 템플릿 리터럴 - 자동 변환 어려움
label.string = `레벨 ${level}에 도달`;
```
→ 수동 검토 필요, `getTextWithArgs` 사용 안내

### 12.2 조건부 텍스트
```typescript
label.string = isKorean ? "확인" : "OK";
```
→ 이미 다국어 처리된 것으로 간주, 제외

### 12.3 CSV 데이터
```
Config.csv의 텍스트들도 로컬라이징 필요할 수 있음
```
→ 별도 CSV 처리기 구현 고려
