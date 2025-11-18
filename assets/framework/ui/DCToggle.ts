import DCUI from "./DCUI";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/UI/DCToggle")
export default class DCToggle extends DCUI {

    toggle: cc.Toggle;
    @property({ tooltip: "If reverse is enabled ,checked is false !, unchecked is true" })
    revserse: boolean = false;


    @property({ tooltip: " Make sure data bind type should be boolean" })
    autosync: boolean = true;

    isFromSelf: boolean;

    onLoad() {
        this.toggle = this.getComponent(cc.Toggle);
        if (this.autosync) {
            let listener = new cc.Component.EventHandler();
            listener.component = "DCToggle";
            listener.target = this.node;
            listener.handler = "onChecked";
            this.toggle.checkEvents.push(listener)
        }
    }

    onChecked(v) {
        if (this.isFromSelf) return;
        if (this.revserse) {
            this.setDCValue(!v.isChecked);
        } else {
            this.setDCValue(v.isChecked);
        }
    }

    setChecked(b) {
        this.isFromSelf = true;
        if (b)
            this.toggle.check()
        else
            this.toggle.uncheck();
        this.isFromSelf = false
    }

    onValueChanged(v) {
        if (this.revserse) {
            this.setChecked(!v)
        } else {
            this.setChecked(v)
        }

    }

}
