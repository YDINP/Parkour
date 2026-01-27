# 로컬라이징 동기화 체크

CDN과 로컬 로컬라이징 데이터의 동기화 상태를 확인합니다.

## 인자

- `$ARGUMENTS`: 프로젝트 ID 또는 'all' (예: `47FriendsDefense` 또는 `all`)

---

동기화 상태를 확인합니다.

요청: $ARGUMENTS

## 작업 순서

1. **version.json 확인**
   - 로컬: `C:\Users\a\Documents\kakao_localization\version.json`
   - CDN: `https://raw.githubusercontent.com/TinycellCorp/kakao_localization/main/version.json`

2. **프로젝트별 키 수 비교**
   - CDN JSON 파일 키 수
   - 로컬 JSON 파일 키 수

3. **CDN URL 접근 테스트**
   ```
   https://raw.githubusercontent.com/TinycellCorp/kakao_localization/main/{ProjectId}/ko.json
   ```

4. **결과 보고**
   - 동기화 상태: 일치 / 불일치
   - 버전: CDN vs 로컬
   - 키 수: CDN vs 로컬

## 프로젝트 목록
| ID | 프로젝트명 |
|----|-----------|
| 47FriendsDefense | Kapi |
| 48TangTang | Z-tangtang |
| 49FriendsRunner | Parkour |
| 50FriendsBongBong | FriendMaker |
| 51FriendsTileMatch | FriendsTileMatch |
| 52FriendsMatchPuzzle | FriendMatchPuzzle |

## 참조
- .claude/skills/localization.md
