import Buff from "./Buff";
import DataCenter from "../../core/DataCenter";
import gUtil from "../../core/gUtil";
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
            // 컴포넌트 생성 전에 buffData를 노드에 임시 저장
            // (addComponent 시 onEnable이 즉시 호출되므로)
            if (this.data) {
                this.node['_pendingBuffData'] = this.data;
            }
            this._bindComp = gUtil.getOrAddComponent(this.node, this.cls_data);
            // 컴포넌트 생성 후 buffData 할당 (이미 onEnable이 호출된 후)
            if (this.data) {
                this._bindComp['buffData'] = this.data;
                delete this.node['_pendingBuffData'];
            }
        }
        return this._bindComp;
    }

    onEnabled() {
        if (this.bindComp) {
            // comp
            // 버프 데이터를 컴포넌트에 전달 (startIndex 등)
            console.log(`[GenericBuff.onEnabled] ${this.name}:
  - this.data: ${JSON.stringify(this.data)}
  - bindComp.buffData: ${JSON.stringify(this.bindComp['buffData'])}`);

            // bindComp getter에서 이미 buffData를 할당했을 수 있음
            if (!this.bindComp['buffData']) {
                this.bindComp['buffData'] = this.data;
            }
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