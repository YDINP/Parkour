import FizzBody, { FizzCollideInterface } from "../../../../framework/fizzx/components/FizzBody";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BodyBase extends cc.Component implements FizzCollideInterface {

    private _body: FizzBody;
    private _inited: boolean = false;
    @property()
    inActive: boolean = true;

    get body() {
        if (this._body == null) {
            this._body = this.getComponent(FizzBody);
        }
        return this._body;
    }

    onEnable() {
        this._inited = true;
    }

    onDisable() {
        if (this._inited) {
            if (this.body.y + this.body.hh < 0) {
                console.log("낙하!" + this.node.name)
                this.onFalloff();
            }
        }
    }

    /**
     * 跳崖
     */
    onFalloff() {

    }

    onFizzCollideEnter(b: FizzBody, nx: number, ny: number, pen: number) {
    }
    onFizzCollideExit(b: FizzBody, nx: number, ny: number, pen: number) {
    }
    onFizzCollideStay(b: FizzBody, nx: number, ny: number, pen: number) {
    }

    update(dt) {
        if (!this.inActive) {
            return;
        }
        this.onUpdate(dt)
    }

    onUpdate(dt?) {

    }

    destroyComponent() {
        this.body.destroy();
    }

    removeBody() {
        this.body.remove();
        this._body = null;
    }

    respawnBody() {
        this.body.respawn();
    }

}