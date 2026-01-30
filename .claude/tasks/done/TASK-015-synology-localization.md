# TASK-015: 시놀로지 로컬라이징 시트 적용

## 상태: 🔴 Blocked - 시트 접근 필요

## 문제 설명
시놀로지 시트의 로컬라이징 문서를 게임에 적용 필요.
프렌즈 정보 / 펫 팝업의 스킬 내용 길이 확인 시급.

## 관련 파일
- `assets/framework/Hi5/Localization/LocalizationManager.ts` - 로컬라이징 매니저
- `assets/framework/Hi5/Localization/Parkour - *.json` - 로컬라이징 JSON 파일들
- CDN: `https://raw.githubusercontent.com/TinycellCorp/kakao_localization/main/49FriendsRunner/`

## 분석
### 현재 로컬라이징 시스템
- CDN 기반 로컬라이징 사용 중
- 프로젝트 ID: `49FriendsRunner`
- 지원 언어: ko/en/cn

### 로컬라이징 JSON 파일 구조
- `main.json` - 메인 UI 텍스트
- `hero.json` - 히어로 관련 텍스트
- `pet.json` - 펫 관련 텍스트
- `Level.json` - 레벨 텍스트
- `Prop.json` - 아이템/프롭 텍스트
- `skin.json` - 스킨 텍스트
- `guide.json` - 튜토리얼 텍스트
- `shopCap.json` - 상점 캡션

## 필요한 정보
1. 시놀로지 시트 URL 또는 내용
2. 업데이트할 키-값 목록
3. 스킬 설명 텍스트 최대 길이 제한

## 수정 계획
1. 시트에서 로컬라이징 데이터 추출
2. 해당 JSON 파일 업데이트
3. CDN에 업로드 또는 로컬 파일 수정
4. `/l10n-sync` 커맨드로 동기화 확인

## 스킬 설명 길이 관련
- 현재 2줄 → 3줄 확장 필요 (에디터 작업)
- 텍스트 길이에 맞춰 UI 조정 필요

## 차단 사유
시놀로지 시트 접근 권한 및 URL 필요
