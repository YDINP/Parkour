import Fx from "./Fx";
import FxLayer from "./FxLayer";

export class FxData {
    name: string;
    sx: number
    s: number;
    sy: number;
    x: number = 0
    y: number = 0
    r: number = 0;
    t: number = 0;
    d: number = 0;
    str: string
    public constructor(str: string) {
        // explode+sx=-1
        let d = str.split(/[,\+&;\s]/)
        this.name = d[0]
        for (let i = 1; i < d.length; i++) {
            let [k, v] = d[i].split('=')
            this[k] = Number(v);
        }
        if (this.s != null) {
            this.sx = this.s;
            this.sy = this.s;
        }
        this.sx = this.sx == null ? 1 : this.sx;
        this.sy = this.sy == null ? 1 : this.sy;
    }
}

export default class FxHelpher {

    static path: string = 'effects/prefabs/'

    static _cache = {}

    static parse(s: string): FxData[] {
        let d = this._cache[s];
        if (d == null)
            d = s.split("|").map(v => new FxData(v))
        this._cache[s] = d;
        return d;
    }

    static preload(s: string) {
        let fxs = this.parse(s);
        let ps = []
        fxs.forEach(v => {
            let p = new Promise((resolve, reject) => {
                cc.loader.loadRes(FxHelpher.path + v.name, cc.Prefab, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                })
            });
            ps.push(p)
        })
        return Promise.all(ps);
    }


    static play(fxLayerName, fxstr: string, pos: cc.Vec2 = cc.Vec2.ZERO): Promise<Fx> {
        let fxs = this.parse(fxstr);
        if (fxs.length == 1) {
            return this.playFx(fxLayerName, fxs[0], pos)
        } else {
            return this.playFxs(fxLayerName, fxs, pos)
        }
    }

    static playWithText(fxLayerName, fxstr: string, str, pos: cc.Vec2 = cc.Vec2.ZERO): Promise<Fx> {
        let fxs = this.parse(fxstr);
        if (fxs.length == 1) {
            fxs[0].str = str;
            return this.playFx(fxLayerName, fxs[0], pos)
        } else {
            if (Array.isArray(str)) {
                fxs.forEach((v, i) => v.str = str[i])
            } else {
                fxs.forEach((v, i) => v.str = str)
            }
            return this.playFxs(fxLayerName, fxs, pos)
        }
    }

    static playFx(fxLayerName, fxs: FxData, pos: cc.Vec2) {
        let fd: FxData = fxs;
        let layer = FxLayer.get(fxLayerName);
        if (!layer) {
            console.warn("no fxlayer named:" + fxLayerName)
            return null;
        }
        let p = layer.play(FxHelpher.path + fd.name, { dur: fd.d, pos: cc.v2(pos.x + fd.x, pos.y + fd.y), rotation: fd.r, scaleX: fd.sx, scaleY: fd.sy, delay: fd.t, str: fd.str })
        return p
    }

    private static _playFxs(fxLayerName, fxs: FxData[] | any, pos: cc.Vec2, i: number = 0, promise?) {
        let fd: FxData;
        let isArray = Array.isArray(fxs)
        if (isArray) {
            fd = fxs[i]
            if (fd == null) return;
        } else {
            fd = fxs;
        }
        let layer = FxLayer.get(fxLayerName);
        if (!layer) {
            return console.warn("no fxlayer named:" + fxLayerName)
        }
        promise = layer.play(FxHelpher.path + fd.name, { dur: fd.d, pos: cc.v2(pos.x + fd.x, pos.y + fd.y), rotation: fd.r, scaleX: fd.sx, scaleY: fd.sy, delay: fd.t, str: fd.str })
        if (isArray) {
            return this._playFxs(fxLayerName, fxs, pos, ++i, promise);
        }
        return promise
    }

    static playFxs(fxLayerName, fxs: FxData[] | any, pos: cc.Vec2, i: number = 0) {
        if (fxs.length == 1) {
            return this.playFx(fxLayerName, fxs[0], pos)
        } else {
            return this._playFxs(fxLayerName, fxs, pos)
        }
    }
}