import Signal from "./Signal";

export default class PoolManager {
    nodePool: any = {}

    nodes = {}

    onCreateObject: Function;
    target: any;
    root: any;

    managed: boolean = false;
    aliveObjects: cc.Node[] = []

    onRecycleSignal = new Signal();

    private static _instances: { [index: string]: PoolManager } = {}

    private static _idInc: number = 0;
    private _id: string = '0';

    _autoRecycle = false;

    constructor(root?: cc.Node | cc.Scene, onCreateObject?, target?) {
        this.onCreateObject = onCreateObject;
        this.target = target;
        this.root = root;
        this._id = PoolManager._idInc++ + "";
        PoolManager._instances[this._id] = this;
        // this.autoRecycle = this._autoRecycle;
    }

    set autoRecycle(v) {
        if (v) {
            this.root && this.root.on(cc.Node.EventType.CHILD_REMOVED, this.onNodeRemove, this)
        } else {
            this.root && this.root.off(cc.Node.EventType.CHILD_REMOVED, this.onNodeRemove, this)
        }
        this._autoRecycle = v
    }

    set name(v) {
        delete PoolManager._instances[this._id]
        this._id = v;
        PoolManager._instances[this._id] = this;
    }

    public static get(name?) {
        if (name == null || name == '') {
            name = "default"
        }
        let pool = PoolManager._instances[name]
        return pool;
    }

    destroy() {
        this.clear();
        delete PoolManager._instances[this._id];
    }

    onNodeRemove(node: cc.Node) {
        this.put(node);
        this.onRecycleSignal.fire(node);
    }

    objects() {
        return this.aliveObjects;
    }

    clearAlives() {
        for (var i = 0; i < this.aliveObjects.length;) {
            let obj = this.aliveObjects[i]
            obj.destroy()
            obj.destroyAllChildren();
            delete this.aliveObjects[i];
        }
    }

    getPool(type): cc.NodePool {
        if (typeof (type) == "object") {
            type = type._uuid || type.name;
        }
        let pool = this.nodePool[type];
        if (pool == null) {
            pool = new cc.NodePool();
            this.nodePool[type] = pool;
        }
        return pool;
    }

    getAsync(type, url): Promise<cc.Node> {
        return new Promise((resolve, reject) => {
            let pool = this.getPool(type);
            let node = pool.get();
            if (this.onCreateObject) {
                if (node == null) {
                    cc.loader.loadRes(url, cc.Prefab, (err, res) => {
                        if (err) return reject(err)
                        node = cc.instantiate(res);
                        if (this.root)
                            node.setParent(this.root);
                        if (this.managed)
                            this.aliveObjects.push(node);
                        // this.nodes[node.uuid] = type;
                        this.tag(node, pool)
                        resolve(node);
                    })
                }
            }
            if (this.root) {
                node.active = true;
                node.setParent(this.root);
            }
            if (this.managed)
                this.aliveObjects.push(node);
            resolve(node);
        })
    }

    get(type): cc.Node {
        let pool = this.getPool(type)
        let node = pool.get();
        if (this.onCreateObject) {
            if (node == null) {
                node = this.onCreateObject.call(this.target, type)
                if (node) {
                    if (this.root)
                        node.parent = this.root
                    if (!node)
                        console.warn(node, "onCreateObject must return an object")
                    if (this.managed)
                        this.aliveObjects.push(node);
                    this.tag(node, pool);
                    return node;
                }
                return null;
            }
        }
        if (this.root) {
            node.active = true;
            node.parent = this.root;
        }
        if (this.managed)
            this.aliveObjects.push(node);
        return node;
    }

    tag(node: cc.Node, pool: cc.NodePool) {
        this.nodes[node.uuid] = pool;
    }

    put(node: cc.Node, type = null) {
        let pool
        if (type == null)
            pool = this.nodes[node.uuid];
        else
            pool = this.getPool(type);
        //不是从该 对象池里拿的数据 ，则忽略
        if (pool == null) return;
        pool.put(node);
        if (this.managed)
            this.aliveObjects.splice(this.aliveObjects.indexOf(node), 1);
    }

    clear(type?) {
        if (this.managed) {
            this.clearAlives();
        }
        if (type)
            this.getPool(type).clear();
        else {
            // this.root.off(SystemEventType.CHILD_REMOVED, this.onNodeRemove, this)
            for (var t in this.nodePool) {
                let pool = this.nodePool[t] as cc.NodePool
                pool.clear();
                delete this.nodePool[t]
            }
            for (var k in this.nodes) {
                delete this.nodes[k];
            }
        }

    }

    size(type) {
        return this.getPool(type).size();
    }
}

window['PoolManager'] = PoolManager;