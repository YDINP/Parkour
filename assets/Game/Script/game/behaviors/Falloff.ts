import Signal from "../../../../framework/core/Signal";
import FizzBody from "../../../../framework/fizzx/components/FizzBody";

let { ccclass, property } = cc._decorator
@ccclass
export default class Falloff extends cc.Component {

    body: FizzBody = null;

    time: number = 1

    onFalloffEvent: Signal = new Signal;

    onLoad() {
        this.body = this.getComponent(FizzBody);
    }

    start() {

    }

    reset() {
        this.time = 1;
    }

    update() {
        if (this.time > 0) {
            if (this.body.y + this.body.hh < 0) {
                console.warn("fall off : " + this.node.name)
                this.onFalloffEvent.fire();
                this.onFalloff();
                this.time--;
            }
        }
    }

    onFalloff() {

    }

}