import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import FizzBody from "../../../../../framework/fizzx/components/FizzBody";
import Player from "../../Player";

let { ccclass, property } = cc._decorator
@ccclass
export default class Stronger extends cc.Component {
    body: FizzBody = null;
    player: Player = null;

    onLoad() {
        this.body = this.getComponent(FizzBody);
        this.player = this.getComponent(Player);
    }

    scale_: number = 1

    onEnable() {
        this.player.setDoubleSize();
        FxHelpher.play("screen", "tip_bd", cc.v2(-cc.winSize.width * 0.25, 0))
    }

    onDisable() {
        this.player.setNormalSize();
    }

}