import Device from "../../../../framework/core/Device";
import gUtil from "../../../../framework/core/gUtil";
import FxHelpher from "../../../../framework/extension/fxplayer/FxHelpher";
import FxLayer from "../../../../framework/extension/fxplayer/FxLayer";
import FrameAnim from "../../../../framework/extension/qanim/FrameAnim";
import FizzBody from "../../../../framework/fizzx/components/FizzBody"
import ccUtil from "../../../../framework/utils/ccUtil";
import gameUtil from "../../../../framework/utils/gameUtil";
import { pdata } from "../../data/PlayerInfo";
import InventoryUI from "../../view/TopMostInventoryUI";
import RemoveIfOOS from "../behaviors/items/RemoveIfOOS";
import Game, { root } from "../Game";
import ItemData from "../model/ItemData";

let { ccclass, property } = cc._decorator

export let playEatItemSound = gameUtil.throttle(_ => Device.playSfx("pick_bean"), 0.1)
export let playEatCoinSound = gameUtil.throttle(_ => Device.playSfx("eat_coin"), 0.1)

@ccclass
export default class Item extends cc.Component {

    body: FizzBody = null;

    data: ItemData = null;

    sprite: cc.Sprite = null;

    onLoad() {
        this.body = gUtil.getOrAddComponent(this, FizzBody)
        this.body.isTrigger = true;
        this.node.group = 'item'
        this.sprite = this.getComponent(cc.Sprite)
    }

    start() {

    }

    setItem(name) {
        this.data = ccUtil.get(ItemData, name)
        if (this.data == null) {
            console.warn(name + " not found , " + name + " 레이어가 잘못되었을 수 있음!")
            return
        }
        if (this.data.anim) {
            let anim = gUtil.getOrAddComponent(this, FrameAnim);
            anim.loadFrames(this.data.anim);
        }
        return true;
    }

    changeItem(name) {
        // Game.instance.playFx(, this.body.getPosition());
        this.setItem(name)
        let imagePath = this.data.imagePath;
        ccUtil.setDisplay(this.sprite, imagePath);
    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
        // Device.playSfx(this.data.audioPath);
        if (b.node == null) return;
        FxHelpher.playFxs("map", this.data.deadFx, this.body.getPosition())
        // pdata.gold += this.data.coin;
        // pdata.score += this.data.score;
        pdata.tmpGold += this.data.coin;
        pdata.tmpScore += this.data.score;
        if (this.data.diamond) {
            InventoryUI.instance.setTarget(this.node);
            pdata.diamond++;
        }
        if (this.data.score >= 500) {
            let xy = ccUtil.getWorldPosition(this.node)
            let p = FxLayer.get("screen").node.convertToNodeSpaceAR(xy);
            FxHelpher.playWithText("screen", "blinkText&d=1", "+" + this.data.score, p);
        }
        let hp = pdata.hp + this.data.life;
        pdata.hp = Math.min(hp, pdata.maxHp)
        this.node.destroy();
        let buff = this.data.buff;
        if (buff) {
            root.activateBuff(buff);
        }
        if (this.data.coin > 0) {
            playEatCoinSound()
        } else {
            playEatItemSound();
        }
    }

    onFizzCollideExit?(b: FizzBody, nx: number, ny: number, pen: number) {

    }
    onFizzCollideStay?(b: FizzBody, nx: number, ny: number, pen: number) {

    }




}