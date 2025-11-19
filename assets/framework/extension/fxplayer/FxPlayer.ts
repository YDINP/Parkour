import Fx from "./Fx";
import Device from "../../core/Device";
import gUtil from "../../core/gUtil";

const { ccclass, property, menu } = cc._decorator;

export interface PlayOptions {
    label?: string;
    spriteFrame?: cc.SpriteFrame;
    x?: number,
    y?: number,
    sx?: number;
    sy?: number;
}

@ccclass
@menu("mimgame/fxplayer/FxPlayer")
export default class FxPlayer extends cc.Component {

    @property(cc.Prefab)
    prefab: cc.Prefab = null

    @property
    prefabPath: string = '';

    // @property(PsFx)
    defaultFx: Fx = null;

    @property(cc.SpriteFrame)
    spriteFrame: cc.SpriteFrame = null

    @property({ type: cc.AudioClip })
    audioClip: cc.AudioClip;

    @property
    duration: number = -1;

    @property
    randomRotaion: boolean = false;

    @property
    scale: number = 1;
    onLoad() {
        // if (this.defaultFx == null)
        //     this.defaultFx = this.getComponent(PsFx);
    }

    start() {

    }


    loadPrefab() {
        if (this.prefabPath == null || gUtil.isEmpty(this.prefabPath)) return Promise.resolve();
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(this.prefabPath, (err, res) => {
                if (err) reject(err)
                this.prefab = res;
                resolve(res);
            })
        })
    }

    clear() {
        if (this.defaultFx) {
            this.defaultFx.node.destroy();
        }
        this.defaultFx = null;
        this.prefab = null;
    }

    get fx() {
        if (this.defaultFx == null && this.prefab) {
            let node = cc.instantiate(this.prefab);
            if (node == null) return null;
            let fx = node.getComponent(Fx)
            if (fx == null) {
                fx = node.addComponent(Fx);
            }
            node.setPosition(0, 0);
            node.parent = this.node;
            this.defaultFx = fx;
        }
        return this.defaultFx;
    }

    preload() {
        this.loadPrefab().then(v => {
            this.fx.node.active = false;
        }).catch(e => console.error(e))
    }

    get isPlaying() {
        if (!this.fx) return false;
        return this.fx.isPlaying;
    }

    onEnable() {

    }

    onDisable() {
        let fx = this.defaultFx;
        if (fx)
            fx.node.active = false;
    }

    sleep(sec) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(_ => {
                resolve();
            }, sec)
        })
    };

    hide() {
        if (this.fx && this.fx.node)
            this.fx.node.active = false;
    }

    setOptions(fx: Fx, options: PlayOptions) {
        if (options) {
            fx.node.x = options.x || fx.node.x
            fx.node.y = options.y || fx.node.y
            if (options.sx) {
                fx.node.scaleX = this.scale * (options.sx);
            } if (options.sy) {
                fx.node.scaleY = this.scale * (options.sy);
            }
            if (fx.label)
                fx.label.string = options.label || fx.label.string
        }
    }

    async play(options?: PlayOptions, audio?) {
        Device.playEffect(this.audioClip, false);
        let fx = this.fx;
        if (!fx) {
            if (this.prefab == null && this.prefabPath != null) {
                await this.loadPrefab();
            }
        }
        fx = this.fx;
        if (fx) {
            if (this.randomRotaion)
                fx.node.angle = gUtil.randomInt(0, 360);
            fx.reset();
            this.setOptions(fx, options);

            return fx.play(audio || this.audioClip, (options && options.spriteFrame) || this.spriteFrame);
        } else {
            if (this.duration > 0)
                await this.sleep(this.duration * 1000);
            this.hide();
        }
    }

    // update (dt) {}
}
