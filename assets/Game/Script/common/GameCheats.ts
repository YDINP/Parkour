/**
 * GameCheats - 게임 치트 기능 모듈
 *
 * 사용법:
 *   GameCheats.init(); // Home 씬에서 초기화
 *
 * 치트 UI 활성화:
 *   - 데스크탑: Shift+Click
 *   - 모바일: 트리플 탭 (3번 연속 탭)
 */

import { pdata } from "../data/PlayerInfo";
import { Toast } from "../../../framework/ui/ToastManager";

// 챌린지 모드 최대 레벨 (Level.csv 기준)
const MAX_LEVEL = 100;
// 플레이어 최대 레벨 (User.csv 기준)
const MAX_PLAYER_LEVEL = 70;

export default class GameCheats {
    private static initialized = false;

    /**
     * 치트 시스템 초기화
     * Home 씬 진입 시 한 번 호출
     */
    static init() {
        if (this.initialized) return;
        if (typeof cheat === 'undefined') {
            console.warn('[GameCheats] cheat.js가 로드되지 않았습니다.');
            return;
        }

        // 치트 UI 초기화
        cheat();

        // 상태라인 설정 (버전 정보 표시)
        cheat.statusline((opt) => {
            return [
                `Lv.${pdata.level}/${MAX_LEVEL}`,
                `💰${pdata.gold}`,
                `💎${pdata.diamond}`,
                `❤️${pdata.energy}`
            ];
        });

        // 치트 그룹 등록
        this.registerCurrencyCheats();
        this.registerLevelCheats();
        this.registerMiscCheats();

        this.initialized = true;
        console.log('[GameCheats] 초기화 완료');
    }

    /**
     * 재화 관련 치트
     */
    private static registerCurrencyCheats() {
        cheat.addGroup(['재화', '코인/다이아/에너지'], {
            '💰+10K': [() => {
                pdata.gold += 10000;
                pdata.save('gold');
                Toast.make('코인 +10,000');
                cheat.statusline.refresh();
            }, '코인 10,000 추가'],

            '💰+100K': [() => {
                pdata.gold += 100000;
                pdata.save('gold');
                Toast.make('코인 +100,000');
                cheat.statusline.refresh();
            }, '코인 100,000 추가'],

            '💎+100': [() => {
                pdata.diamond += 100;
                pdata.save('diamond');
                Toast.make('다이아 +100');
                cheat.statusline.refresh();
            }, '다이아 100 추가'],

            '💎+1000': [() => {
                pdata.diamond += 1000;
                pdata.save('diamond');
                Toast.make('다이아 +1,000');
                cheat.statusline.refresh();
            }, '다이아 1,000 추가'],

            '❤️ MAX': [() => {
                pdata.energy = 99;
                pdata.save('energy');
                Toast.make('에너지 MAX (99)');
                cheat.statusline.refresh();
            }, '에너지 99로 설정'],

            '💰💎 MAX': [() => {
                pdata.gold = 9999999;
                pdata.diamond = 99999;
                pdata.energy = 99;
                pdata.save('gold');
                pdata.save('diamond');
                pdata.save('energy');
                Toast.make('모든 재화 MAX!');
                cheat.statusline.refresh();
            }, '모든 재화 최대치']
        });
    }

    /**
     * 레벨 관련 치트
     */
    private static registerLevelCheats() {
        cheat.addGroup(['레벨', '챌린지 모드 레벨'], {
            '레벨+10': [() => {
                const newLevel = Math.min(pdata.level + 10, MAX_LEVEL);
                pdata.level = newLevel;
                pdata.save('level');
                Toast.make(`레벨 → ${newLevel}`);
                cheat.statusline.refresh();
            }, '현재 레벨 +10'],

            '레벨+50': [() => {
                const newLevel = Math.min(pdata.level + 50, MAX_LEVEL);
                pdata.level = newLevel;
                pdata.save('level');
                Toast.make(`레벨 → ${newLevel}`);
                cheat.statusline.refresh();
            }, '현재 레벨 +50'],

            '전체해금': [() => {
                pdata.level = MAX_LEVEL;
                pdata.save('level');
                Toast.make(`모든 레벨 해금! (${MAX_LEVEL})`);
                cheat.statusline.refresh();
            }, `모든 레벨 해금 (${MAX_LEVEL})`],

            '레벨 리셋': [() => {
                pdata.level = 1;
                pdata.save('level');
                Toast.make('레벨 1로 리셋');
                cheat.statusline.refresh();
            }, '레벨 1로 리셋'],

            '플레이어Lv+10': [() => {
                const newLevel = Math.min(pdata.playerlv + 10, MAX_PLAYER_LEVEL);
                pdata.playerlv = newLevel;
                pdata.save('playerlv');
                Toast.make(`플레이어 레벨 → ${newLevel}`);
                cheat.statusline.refresh();
            }, '플레이어 레벨 +10'],

            '플레이어Lv MAX': [() => {
                pdata.playerlv = MAX_PLAYER_LEVEL;
                pdata.save('playerlv');
                Toast.make(`플레이어 레벨 MAX (${MAX_PLAYER_LEVEL})`);
                cheat.statusline.refresh();
            }, `플레이어 레벨 ${MAX_PLAYER_LEVEL}`],

            '플레이어 레벨 리셋': [() => {
                 pdata.playerlv = 1;
                pdata.save('playerlv');
                Toast.make('플레이어 레벨 1로 리셋');
                cheat.statusline.refresh();
            }, '플레이어 레벨 1로 리셋'],
        });
    }

    /**
     * 기타 치트
     */
    private static registerMiscCheats() {
        cheat.addGroup(['기타', '영웅/펫/버프'], {
            '영웅 전체해금': [() => {
                for (let i = 1; i <= 8; i++) {
                    pdata.heros[i.toString()] = 1;
                }
                pdata.save('heros');
                Toast.make('모든 영웅 해금!');
            }, '모든 영웅 해금'],

            '영웅 MAX': [() => {
                for (let i = 1; i <= 8; i++) {
                    pdata.heros[i.toString()] = 10;
                }
                pdata.save('heros');
                Toast.make('모든 영웅 레벨 MAX!');
            }, '모든 영웅 레벨 10'],

            '버프 +10': [() => {
                pdata.buffs.giant += 10;
                pdata.buffs.protect += 10;
                pdata.buffs.speed += 10;
                pdata.buffs.pet_hatch += 10;
                pdata.save('buffs');
                Toast.make('모든 버프 아이템 +10');
            }, '모든 버프 아이템 +10'],

            '능력 MAX': [() => {
                pdata.abilitys.lifeup = 10;
                pdata.abilitys.beanup = 10;
                pdata.save('abilitys');
                Toast.make('모든 능력 MAX!');
            }, '모든 능력 레벨 10'],

            '일일제한 리셋': [() => {
                pdata.freeDiamondCount = 3;
                pdata.freeDiamondDate = '';
                pdata.save('freeDiamondCount');
                pdata.save('freeDiamondDate');
                Toast.make('일일 다이아 광고 횟수 리셋');
            }, '무료 다이아 광고 횟수 리셋']
        });
    }
}
