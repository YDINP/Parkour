import Device from "../../../framework/core/Device";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import LoadingScene from "../common/LoadingScene";
import { root } from "../game/Game"
import { pdata } from "../data/PlayerInfo";

let { ccclass, property } = cc._decorator
@ccclass
export default class UIPause extends mvcView {

    onLoad() {
        this.onClick("btn_continue", this.click_continue)
        this.onClick("btn_home", this.click_home)
    }

    onShow() {
        root.pause();
    }

    onHidden() {
        root.resume();
    }

    click_continue() {
         
        root.resume();
        vm.hide(this);
    }

    click_home() {

        // 카카오 게임로그: exit_play(user_exit) — 플레이 중 "그만하기→홈" 이탈(result 미확정).
        //   정상종료(사망/완주/무한모드 종료)는 pdata.endGame()→complete_play 가 처리하므로,
        //   아직 종료 안 한 판(!isGameEnd)일 때만 발사 + isGameEnd 가드로 한 판 종료로그 1건 보장.
        try {
            if (!pdata.isGameEnd) {
                const kakaoSdk = require("../../../framework/Hi5/business/kakaoSdk");
                if (kakaoSdk && kakaoSdk.isKakao && kakaoSdk.isKakao()) {
                    kakaoSdk.exitPlay("user_exit");
                }
                pdata.isGameEnd = true;   // complete_play 와 중복 차단 (이후 endGame 가드)
            }
        } catch (e) { console.warn("[UIPause] kakao exit_play 로그 예외:", e); }

        Loading.show(0.5);
        this.scheduleOnce(() => {
            LoadingScene.goto("Home")
        }, 0.5)
    }
}