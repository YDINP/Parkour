# 로컬라이징 버전 업데이트

프로젝트의 로컬라이징 버전을 증가시킵니다.

## 인자

- `$ARGUMENTS`: 프로젝트 ID와 버전 타입 (예: `47FriendsDefense patch`)

---

버전 업데이트를 시작합니다.

요청: $ARGUMENTS

## 작업 순서

1. **bump-version.js 실행**
   ```bash
   cd C:\Users\a\Documents\kakao_localization
   node scripts/bump-version.js --id {ProjectId} [--type {patch|minor|major}]
   ```

2. **버전 타입**
   - `patch`: 1.0.0 → 1.0.1 (기본값, 소규모 변경)
   - `minor`: 1.0.0 → 1.1.0 (새 기능)
   - `major`: 1.0.0 → 2.0.0 (대규모 변경)

3. **version.json 확인**
   ```bash
   cat C:\Users\a\Documents\kakao_localization\version.json
   ```

4. **CDN 캐시 퍼지 (선택)**
   ```bash
   curl -X POST "https://purge.jsdelivr.net/gh/TinycellCorp/kakao_localization@main/version.json"
   ```

## 참조
- .claude/skills/localization.md
- TaskMaster Task #14
