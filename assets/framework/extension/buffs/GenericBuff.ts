import Buff from "./Buff";
import DataCenter from "../../core/DataCenter";
import ccUtil from "../../utils/ccUtil";
export interface GenericBuffConfig {
    onEnable?: Function,
    onRecovery?: Function,
    onDisable?: Function,
    onStep?: Function,
}
export default class GenericBuff extends Buff {

    _bindComp: cc.Component;

    get bindComp() {
        if (this._bindComp == null) {
            this._bindComp = this.node.getOrAddComponent(this.cls_data)
        }
        return this._bindComp;
    }

    onEnabled() {
        if (this.bindComp) {
            // comp 
            this.bindComp.enabled = true;
        } else {
            let func = this.cls_data.onEnable;
            if (func) {
                func.call(this)
            }
        }
    }

    onRecovery() {
        let func = this.cls_data.onRecovery;
        if (func) {
            func.call(this)
        }
    }

    onDisabled() {
        if (this.bindComp) {
            // comp 
            this.bindComp.enabled = false;
        } else {
            let func = this.cls_data.onDisable;
            if (func) {
                func.call(this)
            }
        }
    }

    step() {
        if (this._bindComp) {
            let step_func = this.bindComp['onStep']
            step_func && step_func.call(this.bindComp)
        } else {
            let func = this.cls_data.onStep;
            if (func) {
                func.call(this)
            }
        }

    }

    onTimeLeftChanged() {

    }

    onPause() {
        if (this.bindComp) {
            // comp 
            let func = this.bindComp['onPause']
            func && func.call(this.bindComp)
        } else {
            let func = this.cls_data.onPause;
            if (func) {
                func.call(this)
            }
        }
    }

    onResume() {
        if (this.bindComp) {
            // comp 
            let func = this.bindComp['onResume']
            func && func.call(this.bindComp)
        } else {
            let func = this.cls_data.onResume;
            if (func) {
                func.call(this)
            }
        }
    }

    onDestroy() {
        if (this.bindComp) {
            // comp 
            this.bindComp.destroy();
        } else {
            let func = this.cls_data.onDestroy;
            if (func) {
                func.call(this)
            }
        }
    }

    onNotify(name, data) {
        if (this.bindComp) {
            // comp 
            let func = this.bindComp['onNotify']
            func && func.call(this.bindComp, name, data)
        } else {
            let func = this.cls_data.onDestroy;
            if (func) {
                func.call(this, name, data)
            }
        }
    }

}