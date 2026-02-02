/**
 * 게임 버전 정보
 * 커밋 시 버전을 업데이트하세요.
 *
 * 버전 형식: major.minor.patch (예: 0.0.1, 0.1.0, 1.0.0)
 */
export const GameVersion = {
    /** 게임 버전 */
    version: "0.1.9",

    /** 프로젝트 이름 */
    projectName: "49FriendsRunner"
};

// window 객체에 노출 (HTML에서 접근용)
if (typeof window !== 'undefined') {
    (window as any).GameVersion = GameVersion;
}
