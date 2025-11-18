import Signal from "../../core/Signal";
import ccUtil from "../../utils/ccUtil";
import { Loading } from "../LoadingManager";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;
const ResListEnum = cc.Enum({});

export interface PrefabLoaderDelegate {
    onLoadPrefab(lvIndex, path);
    onLevelBeginLoad(lv: number);
    onLevelLoaded(node: cc.Node, lv: number, prefab: cc.Prefab);
}

@ccclass
@executeInEditMode()
export default abstract class PrefabLoader extends cc.Component {
    static path_assets = {}
    static path_assetName = {}
    static path = "";

    // @property({ serializable: true })
    // public _maxLevel: number = 0;
    // @property
    // get maxLevel() {
    //     if (this.assets == null) {
    //         return this._maxLevel;
    //     }
    //     return this.assets.length;
    // }

    // set maxLevel(v) {
    //     this._maxLevel = v;
    // }

    @property
    public prefix: string = "Lv"

    @property
    private _reload: boolean = false;
    @property
    public get shouldReload(): boolean {
        return this._reload;
    }
    public set shouldReload(value: boolean) {
        this._reload = value;
    }

    _loadedPrefabs: { [index: number]: cc.Prefab } = {}

    @property
    private _refresh = false;
    @property
    public get refresh() {
        return this._refresh;
    }
    public set refresh(value) {
        this._refresh = value;
        this.reloadList();
    }

    @property
    _resIndex = 1;
    @property({ type: ResListEnum })
    get level() {
        return this._resIndex;
    }

    onBeginLoad: Signal = new Signal();
    onLevelLoaded: Signal = new Signal();

    onDestroy() {
        this.onBeginLoad.clear();
        this.onLevelLoaded.clear();
        // for (let k in this._loadedPrefabs) {
        //     this.releaseLevelRes(parseInt(k))
        // }
    }

    _delegate: PrefabLoaderDelegate = null;
    set delegate(v: PrefabLoaderDelegate) {
        this._delegate = v;
    }

    get assets(): [] {
        if (PrefabLoader.path_assets == null) {
            return
        }
        let derivedClass = this["__proto__"].constructor
        var assets = PrefabLoader.path_assets[derivedClass.path];
        return assets;
    }

    get assetNames(): [] {
        if (PrefabLoader.path_assetName == null) {
            return
        }
        let derivedClass = this["__proto__"].constructor
        var assets = PrefabLoader.path_assetName[derivedClass.path];
        return assets;
    }


    /** 
     * @return 关卡-prefab 字典
     */
    getLoadedPrefabs() {
        return this._loadedPrefabs;
    }

    /**
     * 释放所有相关联的资源 ，慎用
     */
    releaseLevelRes(lv: number) {
        let prefab = this._loadedPrefabs[lv]
        if (prefab) {
            let assets = cc.loader.getDependsRecursively(prefab);
            cc.loader.release(assets);
            console.log("[PrefabLoader] clear ", assets)
        }
    }

    private _lastLv: number = -1;

    first: boolean = true;

    get lastLevel() {
        return this._lastLv;
    }


    set level(v) {
        if (this.first) {
            this.first = false;
        } else {
            this._lastLv = this._resIndex;
        }
        this._resIndex = v
        this._resIndex = this._resIndex < 0 ? 0 : this._resIndex;
        Loading && Loading.show(3)
        this.onBeginLoad.fire(v)
        if (this._delegate) {
            this._delegate.onLevelBeginLoad(v);
        }
        this.reloadLevel();
    }

    /**预加载 */
    preload(v) {
        let derivedClass = this["__proto__"].constructor
        if (this._delegate) {
            let res = this._delegate.onLoadPrefab(v, derivedClass.path)
            if (res instanceof Promise) {
                return res;
            } else {
                return Promise.resolve(res);
            }
        } else {
            return new Promise(resovle => {
                // if no delegate  prefab-create using prefix + index  as a path
                cc.loader.loadRes(derivedClass.path + "/" + this.prefix + v, cc.Prefab, (error, res: cc.Prefab) => {
                    resovle(res);
                });
            })
        }
    }


    loadLevelInstance(levelPrefab: cc.Prefab) {
        var node = cc.instantiate(levelPrefab)
        node.setParent(this.node);
        try {
            Loading && Loading.hide()
            this._loadedPrefabs[this._resIndex] = levelPrefab;
            this.onLevelLoaded.fire(node, this._resIndex);
            if (this._delegate) {
                this._delegate.onLevelLoaded(node, this._resIndex, levelPrefab);
            }
        } catch (e) {
            console.error(e)
        }
    }

    /** 一般用于测试 */
    loadPrefab(path) {
        this.node.destroyAllChildren();
        cc.loader.releaseRes(path);
        ccUtil.getRes(path, cc.Prefab).then(v => {
            this.loadLevelInstance(v)
        })
    }

    reloadLevel() {
        this.node.destroyAllChildren();
        if (CC_EDITOR) {
            this.loadLevel();
        } else {
            this.scheduleOnce(this.loadLevel);
        }
    }

    loadLevel() {
        let derivedClass = this["__proto__"].constructor
        if (this.assets) {
            if (this.shouldReload) {
                var name = this.assetNames[this._resIndex]
                cc.loader.loadRes(derivedClass.path + "/" + name, cc.Prefab, (error, res: cc.Prefab) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    this.loadLevelInstance(res)
                });
            } else {
                this.loadLevelInstance(this.assets[this._resIndex])
            }
        } else {
            if (this._delegate) {
                let res = this._delegate.onLoadPrefab(this._resIndex, derivedClass.path)
                if (res instanceof Promise) {
                    res.then(v => {
                        this.loadLevelInstance(v);
                    })
                } else {
                    this.loadLevelInstance(res);
                }
            } else {
                // if no delegate  prefab-create using prefix + index  as a path
                cc.loader.loadRes(derivedClass.path + "/" + this.prefix + (this._resIndex), cc.Prefab, (error, res: cc.Prefab) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    this.loadLevelInstance(res)
                });
            }

        }
    }

    nextLevel() {
        this.level++;
    }

    prevLevel() {
        this.level--;
    }

    onFocusInEditor() {
        // this.reloadList();
    }

    private reloadList() {
        let derivedClass = this["__proto__"].constructor
        derivedClass.loadPrefabList(derivedClass.path)
    }

    static loadPrefabList(path) {
        cc.loader.loadResDir(path, cc.Prefab, (error, res) => {
            this.path_assets[path] = res;
            let array = res.map((item, i) => {
                return { name: item.name, value: i };
            });
            this.path_assetName[path] = array.map(v => v.name);
            //@ts-ignore
            cc.Class.Attr.setClassAttr(this, 'level', 'enumList', array);
        });
    }

    public static register(cls, path, debug?) {
        //TODO: 真机上优化
        cls.path = path;
        cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
            if (CC_EDITOR || debug) {
                cls.loadPrefabList(path)
            }
        })
    }
}

