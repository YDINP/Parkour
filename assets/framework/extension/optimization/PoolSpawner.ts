import PoolManager from "../../core/PoolManager";
import ccUtil from "../../utils/ccUtil";

let { ccclass, property, menu, executionOrder } = cc._decorator
@ccclass("Spawner")

export class Spawner {
    @property()
    spawnerName: string = "";

    @property({ type: cc.Node, visible() { return !this.usePrefab } })
    template: cc.Node = null;

    @property({ type: cc.Prefab, visible() { return this.usePrefab } })
    prefab: cc.Prefab = null;

    @property()
    usePrefab: boolean = true;

    get name() {
        return this.spawnerName == "" ? this.prefab.name : this.spawnerName;
    }
}

@ccclass
@menu("mimgame/PoolSpawner")
@executionOrder(-1)
export default class PoolSpawner extends cc.Component {
    poolManager: PoolManager = null;
    @property(cc.Node)
    target: cc.Node = null;

    @property
    poolName: string = ""

    @property([Spawner])
    spawners: Spawner[] = []

    @property
    autoPreload: boolean = true;

    dynamicPrefabs: { [index: string]: string } = {};

    readyToPreload: boolean = false;

    private prefabs_loading: { [index: string]: boolean } = {};

    private _spawners: { [index: string]: Spawner } = {}

    static _instances: { [index: string]: PoolSpawner } = {}

    static get(name) {
        return PoolSpawner._instances[name]
    }

    addSpawner(key, prefab: cc.Prefab) {
        let spawner = this._spawners[key];
        if (spawner == null) {
            spawner = new Spawner();
            spawner.usePrefab = true;
            spawner.prefab = prefab;
            this._spawners[key] = spawner;
        }
    }


    hasSpawner(key) {
        return this._spawners[key] != null;
    }

    onLoad() {
        this.poolName = this.poolName || this.node.name;
        this.poolManager = new PoolManager(this.target || this.node, this.onCreateObject, this)
        this.poolManager.name = this.poolName
        PoolSpawner._instances[this.poolName] = this;
        this.spawners.forEach(v => {
            this._spawners[v.name] = v;
        })
    }

    //mark first,later load 
    preload(key: string | number, path: string) {
        this.dynamicPrefabs[key] = path;
        this.prefabs_loading[key] = false;
        if (this.autoPreload && !this.readyToPreload) {
            this.readyToPreload = true;
            this.scheduleOnce(this.preloadAll)
        }
    }


    //preload prefab 
    private preloadAll() {
        let arr = []
        for (let k in this.dynamicPrefabs) {
            let v = this.dynamicPrefabs[k];
            let isLoading = this.prefabs_loading[k]
            if (!isLoading) {
                let promise = ccUtil.getRes(v, cc.Prefab).then(v => {
                    let spawner = new Spawner();
                    spawner.usePrefab = true;
                    spawner.prefab = v;
                    this._spawners[k] = spawner;
                    this.prefabs_loading[k] = true
                    delete this.dynamicPrefabs[k]
                })
                arr.push(promise)
            }
        }
        return Promise.all(arr);
    }

    onDestroy() {
        this.poolManager.destroy();
    }

    onCreateObject(type) {
        let cfg = this._spawners[type];
        if (cfg == null) {
            return console.error("Cannot get node from [" + this.poolName + "] pool by " + type)
        }
        return cc.instantiate(cfg.usePrefab && cfg.prefab || cfg.template);
    }

    start() {
        if (this.autoPreload) {
            this.preloadAll();
        }
    }

}