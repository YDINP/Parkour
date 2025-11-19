import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import ccUtil from "../../../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../../../Localization/LocalizationManager";
import { root } from "../../Game";
import Player from "../../Player"

let { ccclass, property } = cc._decorator
@ccclass
export default class RushBuff extends cc.Component {

    player: Player = null;

    rushTail: cc.Node = null;

    onLoad() {
        this.player = this.getComponent(Player);
    }

    onEnable() {
        this.player.controller.maxSpeed = 1111
        FxHelpher.play("screen", "tip_cc", cc.v2(-cc.winSize.width * 0.25, 0))
        let path = 'effects/prefabs/rush_tail'
        if (CC_JSB) {
            path = 'effects/prefabs/rush_tail3D'
        }
        if (this.rushTail == null) {
            ccUtil.getRes(path, cc.Prefab).then(v => {
                this.rushTail = LocalizationManager.instantiatePrefab(v as unknown as cc.Prefab);
                this.rushTail.parent = this.node;
                this.rushTail.zIndex = -1;
                this.rushTail.setPosition(0, 0);
            })
        } else {
            this.rushTail.active = true;
        }
        root.invisibleRectsEnabled = true;
    }

    onDisable() {
        if (this.player.controller) {
            this.player.controller.maxSpeed = 700
            this.rushTail.active = false;
            root.invisibleRectsEnabled = false;
        }
    }
}