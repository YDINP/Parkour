import Device from "../../../../framework/core/Device";
import gUtil from "../../../../framework/core/gUtil";
import Fx from "../../../../framework/extension/fxplayer/Fx";
import FxHelpher from "../../../../framework/extension/fxplayer/FxHelpher";
import FxLayer from "../../../../framework/extension/fxplayer/FxLayer";
import FrameAnim from "../../../../framework/extension/qanim/FrameAnim";
import GameEntity from "../../../../framework/extension/shooter/SGameEntity";
import FizzBody from "../../../../framework/fizzx/components/FizzBody"
import FizzHelper from "../../../../framework/fizzx/components/FizzHelper";
import FizzManager from "../../../../framework/fizzx/components/FizzManager";
import ccUtil from "../../../../framework/utils/ccUtil";
import { pdata, PlayerActionType } from "../../data/PlayerInfo";
import RemoveIfOOS from "../behaviors/items/RemoveIfOOS";
import Invincible from "../behaviors/player/Invincible";
import RushBuff from "../behaviors/player/RushBuff";
import Game, { root } from "../Game";
import MobData from "../model/MobData";
import Player from "../Player";

let { ccclass, property } = cc._decorator
@ccclass
export default class Obstacle extends GameEntity {

    body: FizzBody = null;

    data: MobData = null;

    // 블랙홀에 의해 빨려들어가는 중인지 표시 (충돌 무시용)
    isBeingSuckedByBlackhole: boolean = false;

    onLoad() {
        super.onLoad();
    }

    onEnable() {
        super.onEnable();
        // 재사용 시 플래그 초기화
        this.isBeingSuckedByBlackhole = false;
    }

    setBody(node?: cc.Node) {
        node = node || this.node;
        this.body = gUtil.getOrAddComponent(node, FizzBody);
        node.group = 'obstacle'
        this.body.setTarget(this);
        // 재사용 시 플래그 초기화
        this.isBeingSuckedByBlackhole = false;
        return this.body;
    }


    set(name) {
        this.data = ccUtil.get(MobData, name)
        if (!this.data) {
            console.warn(name + " not found , " + name + " 레이어가 잘못되었을 수 있음! 또는 설정표가 비어있음, " + name + "을 Mob.csv에 추가하세요")
            return false;
        }
        return true;
        // if (this.data.anim) {
        //     let anim = this.getOrAddComponent(FrameAnim);
        //     anim.loadFrames(this.data.anim);
        // }
    }

    onDead() {
        let xy = ccUtil.getWorldPosition(this.node)
        let p = FxLayer.get("screen").node.convertToNodeSpaceAR(xy);
        FxHelpher.playWithText("screen", "blinkText&d=1", "+" + this.data.score, p);
        pdata.tmpScore += this.data.score || 0
        FxHelpher.playFxs("map", this.data.deadFxs, this.body.getPosition())
    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        // 블랙홀에 의해 빨려들어가는 중이면 충돌 무시
        if (this.isBeingSuckedByBlackhole) {
            return false;
        }
        // pdata.coin += this.data.coin;
        // pdata.score += this.data.score;
        // pdata.life += this.data.life;
        // this.node.destroy();
        //击退 
        let player = b.getComponent(Player)
        if (player) {
            let buffSystem = player.buffSystem;
            if (buffSystem.isEnabled("invincible")) {
                Device.playSfx(this.data.deadAudio);
                return false;
            }
            if (player.stronger || buffSystem.isEnabled("rush")) {
                // kill self 
                Device.playSfx(this.data.deadAudio);
                this.kill();
                return false;
            }
            if (buffSystem.isEnabled("shield")) {
                Device.playSfx(this.data.deadAudio);
                buffSystem.stop("shield")
                buffSystem.startBuff("invincible", 2, false)
                return false;
            }
            if (nx != 0) {
                b.xv = -nx * 1000;
                player.controller.disableMoveForSec(0.2);
            } else if (ny != 0) {
                b.xv = -player.controller.dir * 200;
                b.yv = 300;
                player.controller.disableMoveForSec(0.2);
            }

            //伤害重新计算
            pdata.lastAction = PlayerActionType.get_hit
            pdata.hp -= this.damage * (1 - player.damageReduce);
            buffSystem.startBuff("invincible", 2)
            // play hurt_loseHp

            let p = FizzManager.getHitPoint(this.body, b, nx, ny)
            FxHelpher.play("map", "hit_sparkle", p)
            FxHelpher.play("screen", "hurt_loseHp", cc.Vec2.ZERO)
            player.getHit();
        }

    }



    onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number) {
    }


    onFizzCollideStay?(b: FizzBody, nx: number, ny: number, pen: number) {
        let player = b.getComponent(Player)
        if (player) {
            if (player.buffSystem.isEnabled("invincible")) {
                return false;
            }
            if (player.buffSystem.isEnabled("shield")) {
                return false;
            }
        }

    }


}