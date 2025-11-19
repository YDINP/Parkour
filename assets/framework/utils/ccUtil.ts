import SpriteFrameCache from "../extension/optimization/SpriteFrameCache";
import { evt } from "../core/event";
import display from "../core/display";
import PoolSpawner from "../extension/optimization/PoolSpawner";
import PoolManager from "../core/PoolManager";
import Signal from "../core/Signal";
import mathf from "./mathf";
interface FlyCoinConfig { dur?: number, num?: number, interval?: number, random_length?: number, scale?: number, scaleTo?: number };
export default class ccUtil {
    public static Instantiate(origin, position?: cc.Vec3, rotation?: cc.Quat): any {
        let node = cc.instantiate(origin)
        if (position)
            node.position = position;
        if (rotation)
            node.angle = rotation;
        return node;
    }

    static loadJson(path) {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(path, cc.JsonAsset, (errorcode, data) => {
                resolve(data.json)
            })
        })
    }


    public static playParticles(ps: cc.ParticleSystem) {
        let subs = ps["_subParticles"]
        if (subs == null) {
            subs = ps.node.getComponentsInChildren(cc.ParticleSystem);
            ps["_subParticles"] = subs;
        }
        subs.forEach(v => {
            v.play()
        });
    }

    public static playAnimation(anim: cc.Animation, stopAfter: number) {
        anim.play();
        if (stopAfter > 0)
            evt.sleep(stopAfter).then(v => {
                anim.stop();
            })
    }

    public static playAnim(anim: cc.Animation, name, speed = 1) {
        let state = anim.play(name)
        if (speed > 0) {
            state.speed = speed;
        }
        return new Promise<void>((resolve) => {
            anim.on("finished", () => {
                resolve();
            })
        })
    }
    static newButton(target: cc.Node, component: string, handler: string, listener?: cc.Node, data?: string) {
        listener = listener || target;
        let button = target.getComponent(cc.Button);
        if (button == null) {
            button = target.addComponent(cc.Button)
            button.transition = cc.Button.Transition.SCALE;
            button.zoomScale = 0.95;
        }
        if (button.clickEvents.length > 0) {
            let clickEvent = button.clickEvents[0]
            clickEvent.target = listener
            clickEvent.customEventData = data;
            clickEvent.component = component;
            clickEvent.handler = handler;
        } else {
            button.clickEvents.push(ccUtil.handler(listener, component, handler, data))
        }
        return button;
    }


    static handler(target: cc.Node, component: string, handler: string, bindstr?: string) {
        let eventHandler = new cc.Component.EventHandler();
        eventHandler.component = component
        eventHandler.target = target;
        eventHandler.handler = handler
        eventHandler.customEventData = bindstr;
        return eventHandler;
    }

    static allInfos: any = {}; // 所有信息
    static types = [];
    static get<T>(cls: { prototype: T }, ...args): T {
        //prototype.constructor.name 在js 编译后不可用
        let tt = cls.prototype;
        let idx = this.types.indexOf(tt);
        if (idx == -1) {
            this.types.push(tt);
            idx = this.types.length - 1;
        }
        let models = this.allInfos[idx]
        if (!models) {
            models = {};
            this.allInfos[idx] = models;
        }

        let _id
        if (args.length == 1) {
            _id = args[0] + "";
        } else {
            _id = args.join("-");
        }
        let info = models[_id];
        if (!info) {
            let c = cls as any;
            try {
                info = new c(_id)
            }
            catch (e) {
                console.warn(_id + " get failed from " + cls.prototype.constructor.name, e)
            }
            // info = Reflect.construct(c, args);
            models[_id] = info;
        }
        return info as T;
    }


    static isGreaterDays(before, num = 7) {
        let now = new Date();
        var diff = now.getTime() - before
        if (diff > 86400000 * num) // 24*60*60*1000
        {
            return true;
        }
    }

    static setDisplay(sp, url, callback?) {
        if (typeof (url) == 'string') {
            return SpriteFrameCache.instance.getSpriteFrame(url).then(sf => {
                try {
                    sp.spriteFrame = sf
                    callback && callback()
                } catch (e) {
                    console.warn(e)
                }
            }).catch(e => console.warn(e))
        } else {
            if (url instanceof cc.SpriteFrame)
                sp.spriteFrame = url;
        }

    }

    static getOrAddComponent<T extends cc.Component>(obj: any, type: { prototype: T }): T {
        return obj.getOrAddComponent(type);
    }


    static formatSeconds(time) {
        var h = Math.floor(time / 3600);
        var m = Math.floor(time / 60 - h * 60);
        var s = Math.floor(time - m * 60 - h * 3600);
        var start = h > 0 ? (h < 10 ? "0" + h : h) + ":" : "";
        var end = m + ":" + (s < 10 ? "0" + s : s);
        return start + end;
    }

    static convertCameraWorldPosition(worldpos, cameraFrom: cc.Camera, cameraTo: cc.Camera) {
        let pos = cameraFrom.getWorldToScreenPoint(worldpos, cc.Vec2.ZERO)
        let from = cameraTo.getScreenToWorldPoint(pos, cc.Vec2.ZERO)
        return from;
    }

    static setButtonEnabled(btn, b) {
        let node = btn.node;
        if (btn instanceof cc.Node) {
            btn = btn.getComponent(cc.Button)
            node = btn.node;
        }
        if (btn) {
            node.opacity = b ? 255 : 155;
            btn.interactable = b
        }
    }

    static find<T extends cc.Component>(path: string, node: cc.Node, compType: { prototype: T }): T {
        return cc.find(path, node).getComponent(compType);
    }


    static sign(x) {
        return x > 0 ? 1 : -1;
    }

    /**
 * invoke every components 
 * @param node 
 * @param funcname 
 * @param params 
 */
    static broadCast(node, funcname, ...params): Promise<any> {
        return Promise.race(
            node.getComponents(cc.Component).filter(v => v[funcname] != null).map(v => {
                return new Promise((resolve) => {
                    let ret = v[funcname].call(v, ...params)
                    resolve(ret);
                })
            })
        )
    }

    /**
     * attempat to call func of one component which succeded 
     * @param node 
     * @param funcname 
     * @param params 
     */
    static sendMessage(node: cc.Node, funcname, ...params) {
        let ret = null;
        node.getComponents(cc.Component).some(v => {
            let f = v[funcname]
            if (f) {
                ret = f.call(v, ...params)
                return true
            }
            return false;
        })
        return ret;
    }

    //高效率getboundingbox ,不同于node.getBoundingBoxToWorld
    static getWorldBoundingBox(node: cc.Node) {
        let parent = node.parent
        if (parent == null) return;
        let box = node.getBoundingBox();
        let xy = cc.v2(box.xMin, box.yMin)
        let xy2 = cc.v2(box.xMax, box.yMax);
        xy = parent.convertToWorldSpaceAR(xy);
        xy2 = parent.convertToWorldSpaceAR(xy2);
        let wh = xy2.subSelf(xy);
        return cc.rect(xy.x, xy.y, wh.x, wh.y)
    }

    static setParent(node, newParent, keepWorldPosition = false) {
        let oldParent = node.parent;
        if (oldParent == null) return;
        let worldPos = oldParent.convertToWorldSpaceAR(node.position);
        node.removeFromParent();
        node.parent = newParent;
        if (keepWorldPosition) {
            node.position = newParent.convertToNodeSpaceAR(worldPos);
        }
    }


    // 获取节点a 在节点b坐标系下 相对节点b 的坐标
    static getRelatePosition(node_a: cc.Node, node_b: cc.Node) {
        return this.getPositionToNodeSpaceAR(node_a, node_b.parent);
    }

    static getPositionToNodeSpace(node_a: cc.Node, node_b: cc.Node) {
        let pos = this.getWorldPosition(node_a);
        let relpos = node_b.convertToNodeSpace(pos);
        return relpos;
    }

    static getPositionToNodeSpaceAR(node_a: cc.Node, node_b: cc.Node, anchor: cc.Vec2 = cc.v2(0.5, 0.5)) {
        let pos = this.getWorldPosition(node_a);
        let relpos = node_b.convertToNodeSpaceAR(pos);
        return relpos;
    }

    static getWorldPosition(node: cc.Node) {
        if (node.parent == null) return cc.v2();
        let xy = cc.v2(node.x, node.y)
        return node.parent.convertToWorldSpaceAR(xy);
    }


    static setWorldPositon(node: cc.Node, target: cc.Node | cc.Vec2) {
        let p = (target instanceof cc.Node && ccUtil.getWorldPosition(target) || target) as cc.Vec2;
        let locPos = node.parent.convertToNodeSpaceAR(p)
        node.setPosition(locPos);
    }

    static changeParent(node: cc.Node, parentNode: cc.Node, zindex = 0) {
        let pos = ccUtil.getWorldPosition(node);
        node.removeFromParent();
        parentNode.addChild(node, zindex);
        pos = parentNode.convertToNodeSpaceAR(pos)
        node.setPosition(pos)
    }

    static moveToOrigin(node, dur, ease?) {
        node.runAction(cc.moveTo(dur, cc.Vec2.ZERO).easing(ease || cc.easeSineOut()))
    }
    static _tmp_vec2: cc.Vec2 = cc.v2()
    static default_flycoin_config = {
        dur: 0.5,
        num: 5,
        interval: 0.1,
        random_length: 0,
        scale: 1,
        scaleTo: 1
    }

    /**播放 飞行动画 简化版本 */
    static playFly(template: cc.Node, dur?, num?, interval?) {
        this._playFly(template, template.parent, display.center, ccUtil.getWorldPosition(template), { dur, num, interval })
    }

    /**
     * 
     * @param template 模版prefab 路径，或者  prefab
     * @param to 飞到的 目标节点
     * @param from 从哪个节点出发
     * @param num 飞多少个
     * @param dur 单个飞行时间
     * @param interval 飞行间隔
     */
    static playFlyTo(template: cc.Prefab | string, to: cc.Node, from: cc.Node, toPos?: cc.Vec2, fromPos?: cc.Vec2, callback?: Function, num?, dur?, interval?) {
        return this._playFly(template, to.parent, (from && (from instanceof cc.Node)) ? ccUtil.getWorldPosition(from) : fromPos, toPos, { dur, num, interval }, callback)
    }

    //播放飞行动画 
    static _playFly(template: cc.Node | cc.Prefab | string = null, parent: cc.Node = null, from: cc.Node | cc.Vec2 = display.center, to: cc.Vec2 = display.leftTop, config?: FlyCoinConfig, callback?) {
        try {
            if (config == null) {
                config = this.default_flycoin_config
            }
            let pool = PoolManager.get("default")
            if (pool) {
                // 必须在主场景上添加 PoolSpawner（一般添加在ViewManager) ,名字为default的pool ,template 名 为spawner名字对应
                console.assert(typeof ("template") == 'string', '1st param must be prefab path which type is string')
            }
            config.num = config.num || this.default_flycoin_config.num;
            let signal = new Signal();
            for (let i = 0; i < config.num; i++) {
                let node = null;
                if (pool == null) {
                    node = cc.instantiate(template) as cc.Node;
                } else {
                    node = pool.get(template)
                }
                node.parent = parent;
                let f = from;
                if (from instanceof cc.Node) {
                    f = ccUtil.getWorldPosition(from);
                } else {
                    f = from;
                }
                f = parent.convertToNodeSpaceAR(f)
                let targetPos = parent.convertToNodeSpaceAR(to);
                if (config.random_length > 0) {
                    let round = cc.Vec2.random(this._tmp_vec2, config.random_length || this.default_flycoin_config.random_length)
                    node.setPosition(f.add(round));
                } else {
                    node.setPosition(f)
                }
                let duration = config.dur || this.default_flycoin_config.dur
                let interval = config.interval || this.default_flycoin_config.interval;
                let scaleTo = config.scaleTo || this.default_flycoin_config.scaleTo;
                if (config.scale) {
                    node.scale = config.scale;
                }
                cc.tween(node).delay(i * (interval)).to(duration, { position: targetPos, scale: scaleTo }, { easing: "sineInOut" }).call(() => {
                    callback && callback(node, i);
                    if (pool) {
                        pool.put(node);
                    } else {
                        node.destroy();
                    }
                    if (i == config.num - 1) {
                        signal.fire();
                    }
                }).start();

            }
            return signal.wait();
        } catch (e) {
            console.warn(e);
        }
    }

    public static getRes<T extends cc.Asset>(path, type: typeof cc.Asset): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(path, type, (err, res) => {
                if (err) return reject(err)
                resolve(res as T);
            })
        })
    }

    /**
     *  将指定物品移动到背包，并显示对应的数值
     * @param node 在哪个节点下操作，一搬为高于ViewManager层级的layer 
     * @param prefab_clone 用哪个节点模拟
     * @param target    飞到的目标节点/坐标信息参数
     * @param target.from 相对于node节点的起始坐标
     * @param target.to 相对于node节点的结束坐标
     * @param flyer_name //飞行id,与PoolSpawner 结合使用
     * @param v 起始值  
     * @param nv 结束值 
     * @param num 飞行数量
     */
    static flyToInventory(node: cc.Node, prefab_clone, target: cc.Node | { from, to }, from: cc.Node | cc.Vec2, flyer_name, v, nv, num) {
        //@ts-ignore
        if (node.fly_shadowNodes == null) {
            //@ts-ignore
            node.fly_shadowNodes = {}
        }
        //@ts-ignore
        let shadow = node.fly_shadowNodes[flyer_name] as cc.Node;
        if (shadow == null) {
            shadow = cc.instantiate(prefab_clone)
            //@ts-ignore
            node.fly_shadowNodes[flyer_name] = shadow
            shadow.active = false;
        }
        shadow.active = true;
        if (target instanceof cc.Node) {
            shadow.parent = target.parent;
            shadow.position = target.position;
            ccUtil.changeParent(shadow, node);
            target.active = false;
        } else {
            shadow.parent = node;
            //@ts-ignore
            shadow.setPosition(target.from);
        }
        let label = shadow.getComponentInChildren(cc.Label);
        label.string = v;
        let step = (nv - v) / num;
        let toPos
        if (target instanceof cc.Node) {
            toPos = ccUtil.getWorldPosition(target);
        } else {
            //@ts-ignore
            shadow.opacity = 0;
            toPos = node.convertToWorldSpaceAR(target.to);
            // toPos = target.to;
            //@ts-ignore
            cc.tween(shadow).to(0.25, { opacity: 255, position: target.to }, { easing: "backOut" }).start();
        }
        //@ts-ignore
        ccUtil.playFlyTo(flyer_name, shadow, null, toPos, (from instanceof cc.Node) ? ccUtil.getWorldPosition(from) : (from || display.center), () => {
            label.string = Math.floor(v += step).toString();
        }, num).then(v => {
            label.string = nv
            if (target instanceof cc.Node) {
                target.active = true;
                shadow.active = false;
            } else {
                //@ts-ignore
                cc.tween(shadow).to(0.5, { opacity: 0, position: target.from }, { easing: "backIn" }).start();
            }
        })
    }

    static addNumberEffect(cmp: cc.Label, before: number, after: number, time = 1, finished?: Function) {
        let obj: { num: number } = { num: 0 };
        obj.num = before;
        cmp.string = obj.num.toString();
        cc.tween(obj as any).to(time, { num: after }, {
            progress: (start, end, current, t) => {
                cmp.string = Math.ceil(start + (end - start) * t).toString();
                return start + (end - start) * t;
            }
        }).call(() => { finished && finished() }).start();
    }

    public static getWorldScale(node) {
        var scaleX = node.scaleX;
        var scaleY = node.scaleY;

        var parent = node.parent;
        while (parent.parent) {
            scaleX *= parent.scaleX;
            scaleY *= parent.scaleY;

            parent = parent.parent;
        }
        return cc.v2(scaleX, scaleY);
    }


    /**
 * invoke every components 
 * @param node 
 * @param funcname 
 * @param params 
 */
    static invokeComponents(node, funcname, ...params): Promise<any> {
        return Promise.race(
            node.getComponents(cc.Component).filter(v => v[funcname] != null).map(v => {
                return new Promise((resolve) => {
                    let ret = v[funcname].call(v, ...params)
                    resolve(ret);
                })
            })
        )
    }

    /**
     * attempat to call func of one component which succeded 
     * @param node 
     * @param funcname 
     * @param params 
     */
    static callComp(node: cc.Node, funcname, ...params) {
        let ret = null;
        node.getComponents(cc.Component).some(v => {
            let f = v[funcname]
            if (f) {
                ret = f.call(v, ...params)
                return true
            }
            return false;
        })
        return ret;
    }


    static clampSize(node: cc.Node, maxw, maxh) {
        let w = Math.min(maxw, node.width);
        let h = Math.min(maxh, node.height)
        node.setContentSize(w, h)
    }

}