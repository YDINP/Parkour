# 로컬라이제이션 관리 스킬

CDN 기반 로컬라이징 시스템을 관리합니다.

## 역할

프로젝트의 다국어 번역 데이터를 CDN에서 호스팅하고 동기화합니다.

## 사용 시점

- "로컬라이징 데이터 확인해줘" → `/l10n check` 또는 `/l10n-sync`
- "CDN 동기화 상태 체크" → `/l10n-sync {ProjectId}`
- "새 프로젝트 로컬라이징 세팅" → `/l10n-setup {ProjectId} "{ProjectPath}"`
- "버전 업데이트" → `/l10n-bump {ProjectId}`
- "번역 데이터 업데이트" → `/l10n-update {ProjectId}`
- "기존 프로젝트 마이그레이션" → `/l10n-migrate {ProjectId} "{SourcePath}"`

## 슬래시 커맨드 목록

| 커맨드 | 설명 | 예시 |
|--------|------|------|
| `/l10n` | 일반 로컬라이징 작업 | `/l10n check` |
| `/l10n-setup` | 신규 프로젝트 셋업 | `/l10n-setup 53NewGame "C:\Projects\NewGame"` |
| `/l10n-bump` | 버전 업데이트 | `/l10n-bump 47FriendsDefense patch` |
| `/l10n-sync` | 동기화 체크 | `/l10n-sync 47FriendsDefense` |
| `/l10n-update` | 번역 데이터 업데이트 | `/l10n-update 47FriendsDefense "shop 수정"` |
| `/l10n-migrate` | 프로젝트 마이그레이션 | `/l10n-migrate 53NewGame "C:\..."` |

## 프로젝트 목록

| 프로젝트 | CDN ID | 버전 | 로컬 경로 |
|----------|--------|------|-----------|
| Kapi | 47FriendsDefense | 1.0.1 | `C:\Users\a\Documents\Kapi` |
| Z-tangtang | 48TangTang | 1.0.0 | `C:\Users\a\Documents\Z-tangtang` |
| Parkour | 49FriendsRunner | 1.0.0 | `C:\Users\a\Documents\Parkour` |
| FriendMaker | 50FriendsBongBong | 1.0.0 | `C:\Users\a\Documents\FriendMaker` |
| FriendsTileMatch | 51FriendsTileMatch | 1.0.0 | `C:\Users\a\Documents\FriendsTileMatch` |
| FriendMatchPuzzle | 52FriendsMatchPuzzle | 1.0.1 | `C:\Users\a\Documents\FriendMatchPuzzle` |

## CDN URL

### GitHub Raw (권장 - 캐시 없음)
```
https://raw.githubusercontent.com/TinycellCorp/kakao_localization/main/{ProjectId}/ko.json
```

### jsdelivr (캐시 최대 24시간 지연)
```
https://cdn.jsdelivr.net/gh/TinycellCorp/kakao_localization@main/{ProjectId}/ko.json
```

## 스크립트 사용법

### 1. 신규 프로젝트 세팅 (setup-localization.js)
```bash
cd C:\Users\a\Documents\kakao_localization
node scripts/setup-localization.js --id {ProjectId} --path "{ProjectPath}" --engine {2|3} [--lang {js|ts}]
```

**수행 작업:**
1. LocalizationManager 템플릿 복사 (엔진 버전에 맞게)
2. CDN 레포에 프로젝트 폴더 생성 (ko.json, en.json, cn.json)
3. version.json 업데이트
4. Git 커밋 및 푸시

### 2. 버전 업데이트 (bump-version.js)
```bash
cd C:\Users\a\Documents\kakao_localization
node scripts/bump-version.js --id {ProjectId} [--type {patch|minor|major}] [--no-push]
```

**버전 타입:**
- `patch`: 1.0.0 → 1.0.1 (소규모 변경)
- `minor`: 1.0.0 → 1.1.0 (새 기능)
- `major`: 1.0.0 → 2.0.0 (대규모 변경)

### 3. 프로젝트 목록 확인
```bash
node scripts/bump-version.js --list
```

## CDN 레포 경로

```
C:\Users\a\Documents\kakao_localization\
├── README.md
├── version.json           # 프로젝트별 버전 관리
├── scripts/
│   ├── setup-localization.js    # 신규 프로젝트 셋업
│   └── bump-version.js          # 버전 업데이트
├── templates/
│   ├── LocalizationManager_3x.ts  # Cocos Creator 3.x
│   └── LocalizationManager_2x.js  # Cocos Creator 2.x
├── 47FriendsDefense/
│   ├── ko.json
│   ├── en.json
│   └── cn.json
├── 48TangTang/
├── 49FriendsRunner/
├── 50FriendsBongBong/
├── 51FriendsTileMatch/
└── 52FriendsMatchPuzzle/
```

## LocalizationManager 파일 위치

- **Kapi**: `assets/_script/LocalizationManager.js`
- **Z-tangtang**: `assets/localization/LocalizationManager.ts`
- **Parkour**: `assets/framework/Hi5/Localization/LocalizationManager.ts`
- **FriendMaker**: `assets/localization/LocalizationManager.ts`
- **FriendsTileMatch**: `assets/localization/LocalizationManager.ts`
- **FriendMatchPuzzle**: `assets/localization/LocalizationManager.ts`

## 캐시 관리

### LocalizationManager 캐시 방지
- `loadFromCDN`: `?t=${Date.now()}`
- `fetchFromCDNWithVersion`: `?v=${serverVersion}`

### CDN 캐시 퍼지 (긴급)
```bash
curl -X POST "https://purge.jsdelivr.net/gh/TinycellCorp/kakao_localization@main/{ProjectId}/ko.json"
curl -X POST "https://purge.jsdelivr.net/gh/TinycellCorp/kakao_localization@main/version.json"
```

## TaskMaster Tasks

| Task ID | 제목 | 상태 |
|---------|------|------|
| #13 | 신규 프로젝트 로컬라이징 셋업 자동화 | done |
| #14 | 버전 관리 및 업데이트 자동화 | done |
| #15 | 52FriendsMatchPuzzle CDN 통합 | done |
| #16 | 로컬라이징 데이터 업데이트 워크플로우 | pending |

## 참조 문서

- PRD_Localization_Hosting.md
- PRD_Localization_Data_Audit.md
- Localization/README-Localization-Extractor-Plan.md
