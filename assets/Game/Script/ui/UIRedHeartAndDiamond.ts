import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import Platform from "../../../framework/extension/Platform";
import { Loading } from "../../../framework/ui/LoadingManager";
import ccUtil from "../../../framework/utils/ccUtil";
import PlayerInfoDC, { pdata } from "../data/PlayerInfo";
import { Res, ResType } from "../game/model/BaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRedHeartAndDiamond extends cc.Component {

    @property({
        type: cc.Enum(ResType),
        displayName: "获得的资源"
    })
    res = ResType.Diamond

    @property(Number)
    lab_num: number = 0;

    @property(cc.Label)
    lab_num1: cc.Label = null;

    succCallBack: Function;
    cancelCallBack: Function;

    onLoad() { }

    start() {
        let name = this.res == ResType.Diamond ? "钻石" : "红心";
        this.lab_num1.string = name + "+" + this.lab_num;
    }

    onShow(call?, cancelCall?) {
        this.succCallBack = call;
        this.cancelCallBack = cancelCall;
    }

    click_get() {
         
        Loading.show(1)
        Platform.watch_video(() => {
            Loading.hide();
            let str;
            if (this.res == ResType.Diamond)
                str = "diamond";
            else str = "energy";
            pdata[str] += this.lab_num;
            pdata.save(str);
            this.scheduleOnce(() => {
                this.succCallBack && this.succCallBack();
                this.succCallBack = null;
            }, 1)
        })

    }

    private click_closes() {
         
        this.cancelCallBack && this.cancelCallBack();

        vm.hide(this);
    }

    onHidden() {
        this.succCallBack = null;
        this.cancelCallBack = null;
        pdata.sendToServer("diamond,energy");
    }

    // update (dt) {}
}
