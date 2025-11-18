import DataCenter from "../core/DataCenter";
import { evt } from "../core/event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DCUI extends cc.Component {

    @property()
    dataBind: string = "";
    onLoad()
    {
    }

    setDCKey(k)
    {
        this.dataBind = k;
        this.setListener()
    }


    private setListener()
    {
        DataCenter.off(this.dataBind,this.dataChanged,this)
        DataCenter.on(this.dataBind,this.dataChanged,this)
    }

    onValueChanged(v)
    {
    }

    setDCValue(v)
    {
        DataCenter.set(this.dataBind, v);
    }

    dataChanged(v,old): any {
        this.onValueChanged(v);
    }

    onEnable () {
        this.setListener()
        this.onValueChanged(DataCenter.get(this.dataBind));
    }

    onDisable()
    {
        DataCenter.off(this.dataBind,this.dataChanged,this)
    }
    onDestroy() {
        // DataCenter.off(this)
        evt.off(this);
    }
}
