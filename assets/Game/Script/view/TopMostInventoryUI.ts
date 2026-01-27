import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import gUtil from "../../../framework/core/gUtil";
import Fx from "../../../framework/extension/fxplayer/Fx";
import FxHelpher from "../../../framework/extension/fxplayer/FxHelpher";
import ccUtil from "../../../framework/utils/ccUtil";

let { ccclass, property } = cc._decorator

const FlyGoldInfo = { from: cc.v2(-300, 200), to: cc.v2(-300, -30) }
const FlyDiamondInfo = { from: cc.v2(0, 200), to: cc.v2(0, -30) }
const FlyHeartInfo = { from: cc.v2(300, 200), to: cc.v2(300, -30) }
@ccclass
export default class InventoryUI extends cc.Component {



    @property(cc.Node)
    anchorNode: cc.Node = null;

    @property(cc.Node)
    node_coinField: cc.Node = null;

    @property(cc.Prefab)
    prefab_coin: cc.Prefab = null;



    @property(cc.Node)
    node_diamondField: cc.Node = null;

    @property(cc.Prefab)
    prefab_diamond: cc.Prefab = null;


    @property(cc.Node)
    node_energy: cc.Node = null;

    @property(cc.Prefab)
    prefab_energy: cc.Prefab = null;



    public static instance: InventoryUI = null;

    topPriorityNode: cc.Node = null;

    onLoad() {
        // evt.on("PlayerInfo.cue_cards", this.onGetHints, this)
        evt.on("pdata.diamond", this.onGetDiamond, this);
        evt.on("pdata.gold", this.onGetCoin, this);
        evt.on("pdata.energy", this.onGetEnergy, this);
        this.node.zIndex = 9999999;

        InventoryUI.instance = this;

    }


    onDestroy() {
        evt.off(this);
        InventoryUI.instance = null;
    }

    start() {

    }

    setTarget(node: cc.Node) {
        this.topPriorityNode = node;
    }

    onGetDiamond(nv, v) {

        if (nv < v) {
            Device.playSfx(csv.Audio.sfx_subgemOrGold);
            //扣资源 
            let f = this.getFrom();
            let p = cc.Vec2.ZERO;
            if (f) {
                p = ccUtil.getWorldPosition(f)
                p = this.node.convertToNodeSpaceAR(p)
                p.x -= 40; // 위치 x값 조정
                p.y += 100; // 위치 y값 조정
            }
            FxHelpher.playWithText("top", "loseDiamond", nv - v, p);
            return;
        } else if (nv > v) {
            Device.playSfx(csv.Audio.sfx_addgemOrGold);
            if (nv < v) return;
            let f = this.getFrom();
            ccUtil.flyToInventory(this.anchorNode, this.prefab_diamond, this.node_diamondField || FlyDiamondInfo, f, "diamond_icon", v, nv, Math.min(5, nv - v))
        }
        this.topPriorityNode = null;
    }

    onGetCoin(nv, v) {
        if (nv < v) {
            Device.playSfx(csv.Audio.sfx_subgemOrGold);
            //扣资源
            let f = this.getFrom();
            let p = cc.Vec2.ZERO;
            if (f) {
                p = ccUtil.getWorldPosition(f)
                p = this.node.convertToNodeSpaceAR(p)
                p.y += 100; // 버튼 중앙 상단으로 위치 조정
            }
            FxHelpher.playWithText("top", "loseCoin", nv - v, p)
            return;
        } else if (nv > v) {
            Device.playSfx(csv.Audio.sfx_addgemOrGold);
            let f = this.getFrom();
            ccUtil.flyToInventory(this.anchorNode, this.prefab_coin, this.node_coinField || FlyGoldInfo, f, "coin_icon", v, nv, Math.min(5, nv - v))
        }
        this.topPriorityNode = null;
    }

    onGetEnergy(nv, v) {
        if (nv > v) {
            let f = this.getFrom();
            ccUtil.flyToInventory(this.anchorNode, this.prefab_energy, this.node_energy || FlyHeartInfo, f, "heart_icon", v, nv, Math.min(5, nv - v))
        } else if (nv < v) {
            //扣资源
            let f = this.getFrom();
            let p = cc.Vec2.ZERO;
            if (f) {
                p = ccUtil.getWorldPosition(f)
                p = this.node.convertToNodeSpaceAR(p)
                p.y += 100; // 버튼 중앙 상단으로 위치 조정
            }
            FxHelpher.playWithText("top", "loseEnergy", nv - v, p)
        }
        this.topPriorityNode = null;

    }

    getFrom() {
        let from
        if (this.topPriorityNode) {
            from = this.topPriorityNode;
        } else {
            let evt = gUtil.lastEvent;
            from = evt && evt.target
        }
        return from;
    }


    // onGetHints(nv, v) {
    //     if (nv < v) return;
    //     let from
    //     if (this.topPriorityNode) {
    //         from = this.topPriorityNode;
    //     } else {
    //         let evt = g.lastEvent;
    //         from = evt && evt.target
    //     }
    //     ccUtil.flyToInventory(this.anchorNode_Left, this.prefab_hint, this.node_hint || FlyInfo, from, "icon-hint", v, nv, nv - v)
    //     this.topPriorityNode = null;
    // }
}