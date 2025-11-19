import FxHelpher from "../../../../framework/extension/fxplayer/FxHelpher";
import ccUtil from "../../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../../Localization/LocalizationManager";
import { root } from "../Game";
import Player from "../Player";

let { ccclass, property } = cc._decorator
@ccclass
export default class ShieldBuff extends cc.Component {

    player: Player = null;

    shieldNode: cc.Node = null;

    onLoad() {
        this.player = this.getComponent(Player);
    }

    onEnable() {
        if (this.shieldNode == null) {
            ccUtil.getRes("effects/prefabs/shield", cc.Prefab).then(v => {
                this.shieldNode = LocalizationManager.instantiatePrefab(v as unknown as cc.Prefab);
                this.shieldNode.parent = this.node;
                this.shieldNode.setPosition(0, 0);
            })
        } else {
            this.shieldNode.active = true;
        }
        // root.invisibleRectsEnabled = true;
    }

    onDisable() {
        this.shieldNode.active = false;
        // root.invisibleRectsEnabled = false;
    }
}