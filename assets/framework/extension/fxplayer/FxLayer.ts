import Fx from "./Fx";
import PoolManager from "../../core/PoolManager";
import Platform from "../Platform";
import { EaseType } from "../qanim/EaseType";
import { evt } from "../../core/event";
import { LocalizationManager } from "../../Hi5/Localization/LocalizationManager";

const { ccclass, property, menu } = cc._decorator;
export interface EfxOption {
    pos: cc.Vec2 | cc.Vec3
    rotation?
    audio?,
    spriteframe?
    scale?: number
    scaleX?: number;
    scaleY?: number;
    delay?: number;
    dur?: number;
    str?: string;
}
@ccclass
@menu("mimgame/fxplayer/FxLayer")
export default class FxLayer extends cc.Component {

    private static _instances: { [index: string]: FxLayer } = {}

    private _poolmgr: PoolManager;

    @property
    layerName: string = "";

    @property
    path: string = ""

    onLoad() {
        this.layerName = this.layerName.length == 0 ? this.node.name : this.layerName;
        if (FxLayer._instances[this.layerName]) {
            return console.error("[FxLayer] failed to create FxLayer with same name!");
        }
        this._poolmgr = new PoolManager();
        this._poolmgr.name = this.layerName;
        FxLayer._instances[this.layerName] = this;
        if (CC_DEBUG) {
            window['fxlayer'] = FxLayer;
        }
    }
    onDestroy() {
        this._poolmgr.clear();
        delete FxLayer._instances[this.layerName]
    }

    start() {

    }

    static get(name) {
        return FxLayer._instances[name]
    }

    clear() {
        if (this._poolmgr)
            this._poolmgr.clear();
    }

    getFx(prefabPath): Promise<Fx> {
        prefabPath = this.path + prefabPath;
        return new Promise<Fx>((resolve, reject) => {
            let node = this._poolmgr.get(prefabPath)
            if (node == null) {
                if (prefabPath instanceof cc.Prefab) {
                    node = LocalizationManager.instantiatePrefab(prefabPath);
                    this._poolmgr.tag(node, this._poolmgr.getPool(prefabPath))
                } else {
                    cc.loader.loadRes(prefabPath, cc.Prefab, (e, prefab: cc.Prefab) => {
                        node = LocalizationManager.instantiatePrefab(prefab);
                        this._poolmgr.tag(node, this._poolmgr.getPool(prefabPath))
                        node.setParent(this.node);
                        let psfx = node.getComponent(Fx);
                        if (!psfx) {
                            psfx = node.addComponent(Fx);
                        }
                        psfx.name = prefabPath;
                        resolve(psfx);
                    })
                    return;
                }
            }
            node.setParent(this.node);
            node.active = false;
            let psfx = node.getComponent(Fx);
            if (!psfx) {
                psfx = node.addComponent(Fx);
            }
            psfx.reset();
            resolve(psfx);
        })
    }

    preload(prefabPath, num) {
        for (var i = 0; i < num; i++) {
            this.getFx(prefabPath).then(fx => {
                this.finish(fx);
            });
        }
    }


    finish(fx: Fx) {
        this._poolmgr.put(fx.node);
    }

    async play(prefabPath, option: EfxOption) {
        let fx = await this.getFx(prefabPath);
        if (option.delay) {
            await evt.sleepSafe(fx, option.delay)
        }
        if (option.pos) {
            fx.node.setPosition(option.pos);
        }
        if (option.scale) {
            fx.node.scale = option.scale;
        } else {
            fx.node.scaleX = option.scaleX == null ? 1 : option.scaleX;
            fx.node.scaleY = option.scaleY == null ? 1 : option.scaleY;
        }
        if (option.str) {
            fx.string = option.str;
        }
        fx.duration = option.dur || 0;
        fx.node.angle = option.rotation || 0;
        fx.play(option.audio, option.spriteframe).then(v => {
            this.finish(fx);
        })
        return fx;
    }
}
