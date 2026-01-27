import { evt } from "../../../framework/core/event";
import mvcView from "../../../framework/ui/mvcView";
import { IView } from "../../../framework/ui/View";
import { pdata } from "../data/PlayerInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UISilverCoin extends mvcView implements IView {

    @property(cc.Layout)
    content: cc.Layout = null;

    // 다이아 표시 라벨 (ui_diamond 노드 하위)
    @property(cc.Label)
    lab_diamond: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.register(this.content, _ => csv.SilverCoin.values);
        
        // 다이아 표시 등록
        if (this.lab_diamond) {
            this.register(this.lab_diamond, _ => pdata.diamond);
        }
    }

    onShow() {
        this.render();
        
        // 다이아 변경 이벤트 리스너
        evt.on("pdata.diamond", this.onGetDiamond, this);
    }

    onHide() {
        evt.off("pdata.diamond", this.onGetDiamond, this);
    }

    start() {
    }

    // 다이아 업데이트 콜백
    onGetDiamond(n) {
        if (this.lab_diamond) {
            this.lab_diamond.string = n;
        }
    }

    // 다이아 상점 열기
    click_get_diamond() {
        vm.show("UIDiamondShop");
    }

    click_closes() {
        vm.hide(this);
    }

    // update (dt) {}
}
