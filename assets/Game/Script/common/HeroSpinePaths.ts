/**
 * 영웅 ID -> 스파인 리소스 경로 매핑
 * 전역으로 관리되는 매핑 테이블
 */
export const heroSpinePaths: { [id: string]: string } = {
    "1": "Textures/kakao/heros/01choonsik",
    "2": "Textures/kakao/heros/02Ryan",
    "3": "Textures/kakao/heros/06Frodo",      // 머스킷병
    "4": "Textures/kakao/heros/03Apeach",     // 마법사
    "5": "Textures/kakao/heros/08Jay-G",      // 망치신
    "6": "Textures/kakao/heros/04Tube",
    "7": "Textures/kakao/heros/05Muzi",       // 화염의 드래곤
    "8": "Textures/kakao/heros/07Neo",        // 마녀
};

/**
 * 영웅 ID로 스파인 경로 가져오기
 */
export function getHeroSpinePath(heroId: string): string | undefined {
    return heroSpinePaths[heroId];
}
