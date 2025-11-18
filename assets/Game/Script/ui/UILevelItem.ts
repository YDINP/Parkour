import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import { Loading } from "../../../framework/ui/LoadingManager";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import LoadingScene from "../common/LoadingScene";
import { pdata } from "../data/PlayerInfo";
import InventoryUI from "../view/TopMostInventoryUI";
import UILevels from "./UILevels";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILevelItem extends mvcView {
    @property(cc.Label)
    level: cc.Label = null;

    @property(cc.Node)
    itemBtn: cc.Node = null;

    @property(cc.Node)
    lockNode: cc.Node = null;

    idx: number = null;
    onLoad() {
        this.register(this.level, _ => { return _.toString() });
        this.onVisible(this.lockNode, _ => _ > pdata.level);
        this.node.on(cc.Node.EventType.TOUCH_START, this.click_start, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.click_Item, this);
        evt.on("UILevel.render", this.renderLock, this);
    }

    onLaterRender() {
        this.idx = this.getData();
    }

    renderLock() {
        this.lockNode.active = this.idx > pdata.level;
    }

    click_start() {

        cc.tween(this.node)
            .to(0.15, { scale: 1.3 })
            .to(0.1, { scale: 1 })
            .start()
    }

    click_Item() {
        if (UILevels.instance.isInTouch) return;
        Device.playSfx(csv.Audio.btn_click);
        if (this.lockNode.active) {
            Toast.make("未解锁");
            return;
        }
        let d = this.getData() as number;
        pdata.playinglv = this.idx;
        this.click_start_game();
    }

    click_start_game() {
        if (pdata.energy <= 0) {
            Toast.make("红心不足！");
            vm.show("UIRedHeartShop", () => {
                InventoryUI.instance.setTarget(this.node)
                pdata.energy--;
                pdata.save("energy");
                vm.hide("UIRedHeartShop");
                Loading.show(0.5);
                this.scheduleOnce(() => {
                    LoadingScene.goto("Main")
                }, 0.5)
            })
            return
        }
        InventoryUI.instance.setTarget(this.node)
        pdata.energy--;
        pdata.save("energy");
        Loading.show(0.5);
        this.scheduleOnce(() => {
            LoadingScene.goto("Main")
        }, 0.5)
    }
    onDestroy() {
        evt.off(this);
    }
}
