import PoolManager from "../../core/PoolManager";
import gUtil from "../../core/gUtil";


const { ccclass, property, menu } = cc._decorator;

enum CanseeType {
    SelfBounding,
    Camera,
}

@ccclass
@menu("mimgame/shooter/ShootManager")
export default class ShootManager extends cc.Component {

    @property(cc.Camera)
    camera: cc.Camera = null


    static instance: ShootManager;
    bulletPool: PoolManager;

    halfSize: cc.Size = cc.size(0, 0);

    prefabs = {}

    @property({ type: cc.Enum(CanseeType) })
    canseeType: CanseeType = CanseeType.SelfBounding;

    // allBullets = []
    allEnemies: cc.Node[] = []
    allItems: cc.Node[] = []

    onLoad() {
        if (!this.camera)
            this.camera = cc.Camera.main;

        ShootManager.instance = this;
        this.bulletPool = new PoolManager(this.node, this.onCreateObject, this)
        this.bulletPool.name = "ShootManager"
        gUtil.setGlobalInstance(this);

        this.halfSize.width = cc.visibleRect.width / 2;
        this.halfSize.height = cc.visibleRect.height / 2;
        this.bulletPool.autoRecycle = true;
    }


    onDestroy() {
        this.bulletPool.destroy()
    }

    get bullets() {
        return this.node.children;
    }

    //enemy node
    removeEnemy(enemy: cc.Node) {
        this.allEnemies.splice(this.allEnemies.indexOf(enemy), 1)
    }

    addEnemy(enemy: cc.Node) {
        this.allEnemies.push(enemy);
    }

    addItem(item: cc.Node) {
        this.allItems.push(item);
    }

    removeItem(item: cc.Node) {
        this.allItems.splice(this.allItems.indexOf(item), 1)
    }


    onCreateObject(uuid) {
        //type
        let prefab = this.prefabs[uuid]
        let node = cc.instantiate(prefab)
        return node;
    }

    createBullet(bulletPrefab, worldpos) {
        let node = this.get(bulletPrefab);
        worldpos = this.node.convertToNodeSpaceAR(worldpos);
        node.setPosition(worldpos);
        return node;
    }

    get(prefab): cc.Node {
        this.prefabs[prefab._uuid] = prefab
        let bullet = this.bulletPool.get(prefab._uuid)
        return bullet;
    }

    start() {

    }

    /** node 必须为shootmanager 的子节点 */
    canSee(node: cc.Node) {
        if (this.canseeType == CanseeType.SelfBounding) {
            let rect = node.getBoundingBox();
            let hw = this.node.width / 2;
            let hh = this.node.height / 2;
            if (rect.xMax < -hw || rect.xMin > hw || rect.yMax < -hh || rect.yMin > hh) {
                //invisible 
                return false;
            }
            return true;
        } else if (this.canseeType == CanseeType.Camera) {
            return gUtil.canSee(this.camera, node);
        }
        // return this.node.getBoundingBox().containsRect(this.node.getBoundingBox()) ||this.node.getBoundingBox().intersects(this.node.getBoundingBox())

    }

}
