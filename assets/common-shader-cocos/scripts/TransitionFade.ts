import mathf from "../../framework/utils/mathf";

let { ccclass, property } = cc._decorator
@ccclass
export default class TransitionFade extends cc.Component {

    sp: cc.Sprite;

    texture: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    texture0: cc.SpriteFrame;

    time: number = 0;

    onLoad() {
        this.sp = this.getComponent(cc.Sprite)
        this.texture = this.sp.spriteFrame;

        let self = this;
        Object.defineProperty(this.sp, "spriteFrame", {
            set(v) {
                self.play(v);
            }
        })
    }


    start() {

    }

    setUniforms() {
        let material = this.sp.getMaterial(0);
        material.setProperty("texture", this.texture.getTexture())
        if (this.texture0) {
            material.setProperty("texture0", this.texture0.getTexture())
        } else {
            material.setProperty("texture0", null)
        }
    }

    play(sf: cc.SpriteFrame) {
        if (this.texture0 != null) {
            this.texture = this.texture0;
        }
        this.texture0 = sf;
        this.time = 0;
        this.setUniforms();
        this._paused = false;
    }

    _paused = true;

    update(dt) {
        if (this._paused) return;
        this.time += dt
        this.time = mathf.Clamp01(this.time);
        if (this.time > 1) {
            this._paused = true;
        }
        let material = this.sp.getMaterial(0);
        if (material) {
            material.setProperty("u_time", this.time)
        }
    }

}