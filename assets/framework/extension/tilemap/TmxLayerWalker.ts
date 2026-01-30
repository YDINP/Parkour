import ccUtil from "../../utils/ccUtil";

const { ccclass, property, menu } = cc._decorator;


export interface TileAttrs {
    pos: cc.Vec2
    gid: number
    tileId: number
    properties,
    tilexy: cc.Vec2
}

export interface ITileObjectFactory {
    createObject?(objectLayer: cc.TiledLayer, attrs: TileAttrs);
    createGroupObject?(node, properties, groupLayerName, tiledmap)
}

export interface RectGenOptions {
    //路面下层 - road offset
    topOffset?: number;
    checkSameCell?: (gidA, gidB) => boolean,
    checkValidCell?: (gid) => boolean,
    fieldAsSameRegion?: string;
}

const default_sameCheckFunc = (a, b) => a == b;
const default_validCheckFunc = (gid) => gid != 0;
const default_sort = (a, b) => a.x - b.x;
const gnpField = "gnp"  // field mame for  group name to properties 

@ccclass
@menu("mimgame/tilemap/TmxLayerWalker")
export default class TmxLayerWalker extends cc.Component {

    static iter: number = 2

    tiledmap: cc.TiledMap;
    objectLayer: cc.TiledLayer;
    mw: number = 0;
    mh: number = 0
    tw: number = 0;
    th: number = 0;
    ht: cc.Vec2;

    _objectFactory: ITileObjectFactory;

    lazy: boolean = true;
    // TODO: rows
    walkedRows: number[] = [];

    group_objects = {}

    id_properties: { [index: string]: any } = {}
    gid_imageNames: { [index: number]: string } = {}

    onLoad() {
        this.tiledmap = this.getComponent(cc.TiledMap);
        let size = this.tiledmap.getMapSize();
        this.mw = size.width;
        this.mh = size.height;
        let tilesize = this.tiledmap.getTileSize();
        this.tw = tilesize.width;
        this.th = tilesize.height;
        this.ht = cc.v2(this.tw / 2, this.th / 2);

        let tiledmap = this.tiledmap
        // retrive tileset [gid_to_imageNames]
        if (tiledmap['_mapInfo']) {
            let textures = tiledmap['_mapInfo']['_textures'];
            for (let k in tiledmap['_tilesets']) {
                let tileset = tiledmap['_tilesets'][k] as cc.TMXTilesetInfo;
                let gid = tileset.firstGid;
                let name = Object.keys(textures).find(v => textures[v] == tileset.sourceImage)
                this.gid_imageNames[gid] = name;
            }
        } else {
            console.warn("[MapLoader]:_mapInfo not found on loaded tieledmap!")
        }
        // gid to sources
        this.tiledmap.getObjectGroups().forEach(group => {
            group[gnpField] = {}
            this.processGroup(group, (obj, properties) => {
                group[gnpField]['img' + obj.id] = properties;
            })
        })

    }

    get mapSizeInPixel() {
        return cc.size(this.mw * this.tw, this.mh * this.th);
    }

    /**
     * end 맵의 바닥 타일(마지막 행)을 복사하여 추가 열을 생성
     * @param layerName bg 레이어 이름
     * @param extraColumns 추가할 열 수
     */
    extendLastColumnTiles(layerName: string, extraColumns: number) {
        let layer = this.tiledmap.getLayer(layerName);
        if (!layer) {
            console.warn(`[TmxLayerWalker] Layer '${layerName}' not found`);
            return;
        }

        // TMX 좌표계에서 마지막 행(바닥)은 mh-1
        let bottomRow = this.mh - 1;
        let lastCol = this.mw - 1;

        // 바닥 행에서 마지막 유효 타일 찾기
        let floorGid = 0;
        for (let col = lastCol; col >= 0; col--) {
            let gid = layer.getTileGIDAt(col, bottomRow);
            if (gid !== 0) {
                floorGid = gid;
                break;
            }
        }

        if (floorGid === 0) {
            console.warn(`[TmxLayerWalker] No floor tile found in '${layerName}' layer`);
            return;
        }

        console.log(`[TmxLayerWalker] Extending floor with GID ${floorGid}, adding ${extraColumns} columns`);

        // 바닥 행에만 타일 복사
        for (let i = 1; i <= extraColumns; i++) {
            // 바닥 위치 계산 (TMX 좌표 → 월드 좌표)
            // TMX의 마지막 행(bottomRow)은 월드 좌표에서 y=0 근처
            let tileX = (lastCol + i) * this.tw + this.tw / 2;
            let tileY = this.th / 2;  // 바닥은 y=0 근처
            this.createExtendedTile(layer, floorGid, cc.v2(tileX, tileY));
        }
    }

    /**
     * 확장된 타일을 위한 스프라이트 노드 생성
     */
    private createExtendedTile(layer: cc.TiledLayer, gid: number, pos: cc.Vec2) {
        // @ts-ignore - Cocos Creator 내부 API 사용
        let texGrids = this.tiledmap['_texGrids'];
        if (!texGrids) {
            console.warn('[TmxLayerWalker] _texGrids not available - extended tiles will not render');
            return;
        }
        if (!texGrids[gid]) {
            console.warn(`[TmxLayerWalker] No texture grid for GID ${gid}`);
            return;
        }

        let grid = texGrids[gid];
        let spriteFrame = new cc.SpriteFrame(grid.texture, grid.rect);

        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        node.setPosition(pos);
        node.parent = layer.node;
    }

    start() {

    }

    getPropertiesForOID(id) {
        return this.id_properties[id]
    }


    getImageNameByGID(gid) {
        return this.gid_imageNames[gid]
    }

    private processGroup(group: cc.TiledObjectGroup, each: (any, { source, imageName }) => void) {
        let tiledmap = this.tiledmap
        if (group == null) return;
        let objects = group.getObjects();
        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];
            let name = this.getImageNameByGID(obj.gid)
            let properties = tiledmap.getPropertiesForGID(obj.gid);
            if (properties) {
                if (!properties.source) {
                    properties.source = name;
                    let index1 = name.lastIndexOf("/")
                    index1 = index1 == -1 ? 0 : (index1 + 1);
                    let index2 = name.lastIndexOf(".")
                    name = name.substring(index1, index2)
                    properties.imageName = name;
                }
                this.id_properties[obj.id] = properties;
            }
            each(obj, properties);
        }
    }

    createGroupObjects(groupLayerName: string) {
        let group = this.tiledmap.getObjectGroup(groupLayerName);
        delete this.group_objects[groupLayerName];
        if (group == null) return;
        let objects = this.group_objects[groupLayerName];
        if (objects == null) objects = []
        Object.assign(objects, group.node.children);
        // todo : 竖屏支持
        if (this.lazy) {
            this.group_objects[groupLayerName] = objects
            objects.sort(default_sort)

        } else {
            objects.forEach(v => {
                this._objectFactory.createGroupObject(v, group[gnpField][v.name], groupLayerName, this.tiledmap);
            });
        }
    }

    update(dt) {
        this.lazyLoad(dt);
    }

    lazyLoad(dt) {
        if (dt > 0.017) { return }
        // 화면 오른쪽 경계(width/2) + 5개분 버퍼 = 5.5*width
        // 카메라 고정, 맵 이동 방식이므로 고정값 사용
        let right = cc.winSize.width / 2 + cc.winSize.width * 5.0;
        for (let k in this.group_objects) {
            let group = this.tiledmap.getObjectGroup(k);
            let objects = this.group_objects[k];
            for (let i = 0; i < TmxLayerWalker.iter; i++) {
                let node = objects[0]
                if (node) {
                    // 노드의 월드 좌표 (맵 이동에 따라 변함)
                    let node_left = ccUtil.getWorldPosition(node).x;
                    if (node_left < right) {
                        let properties = group[gnpField][node.name]
                        if (properties == null) {
                            console.warn("[LayerWalker] can not read the element properties" + this.tiledmap.name + " ,it will be ignored!" + node.name)
                            objects.shift()
                        }
                        let obj = this._objectFactory.createGroupObject(node, properties, k, this.tiledmap)
                        if (!obj) {
                            console.warn("[LayerWalker] create " + properties.imageName + " failed in " + this.tiledmap.name)
                        }
                        objects.shift();
                    }
                }
            }
        }
    }



    createObjects(layerName: string, onProgress?: Function): Promise<any> {
        if (this._objectFactory == null) {
            console.log("[Tiledlayer2object] no factory provided!")
            return Promise.reject("no factory provided!");
        }
        this.objectLayer = this.tiledmap.getLayer(layerName)
        if (this.objectLayer == null) {
            return Promise.reject("layer not found :" + layerName)
        }
        this.objectLayer.enabled = false;

        //从上到下，从左到右
        let sum = 1;
        let promises = []
        let i = 0;
        for (var col = 0; col < this.mw; col++) {
            for (var row = 0; row < this.mh; row++) {
                let tilexy = cc.v2(col, row)
                let gid = this.objectLayer.getTileGIDAt(tilexy);
                if (gid != 0) {
                    //create obj of gid at xy 
                    try {
                        let r = this.createObj(gid, tilexy)
                        if (r) {
                            r.then(v => onProgress && onProgress(++i, sum))
                            promises.push(r);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
        sum = promises.length;
        return Promise.all(promises);
    }


    setFactory(factory: any) {
        this._objectFactory = factory;
    }

    private createObj(gid: number, tilexy: cc.Vec2): Promise<any> {
        let properties = this.tiledmap.getPropertiesForGID(gid)
        if (!properties) {
            console.warn(`gid :${gid} has no properties`)
            return;
        }
        let pos = this.objectLayer.getPositionAt(tilexy);
        pos.addSelf(cc.v2(this.ht.x, this.ht.y))
        let attrs = {
            pos, gid, tileId: this.IDX(tilexy), properties, tilexy
        }
        return this._objectFactory.createObject(this.objectLayer, attrs);
    }




    IDX(x: cc.Vec2 | number, y?) {
        if (x instanceof cc.Vec2) {
            y = x.y;
            x = x.x;
        }
        let idx = y * this.mw + x
        return idx;
    }

    /**
     * 跟据gid生成 多个shapes
     * [][]
     * [][][]
     *   [][]
     * 
     * [][][]
     * [][]
     * []
     * []
     * [][]
     * [][][]
     * 
     * [][][]
     *   [][]
     *   [][]
     */
    findRects(layerName: string, options?: RectGenOptions): { [index: number]: cc.Rect[] } {
        let tiledmap = this.tiledmap;
        let layer = tiledmap.getLayer(layerName)
        if (layer == null) {
            console.warn('[CollisionMap] : genCollisionShapes error, layer with name ' + layerName + " not found ")
            return
        }
        let offsetY = options.topOffset || 0;
        let isSameCell = options.checkSameCell || default_sameCheckFunc;
        let isValidCell = options.checkValidCell || default_validCheckFunc;
        var G = (xy) => layer.getTileGIDAt(xy.x, xy.y);
        let field = options.fieldAsSameRegion;
        if (field) {
            isValidCell = (gid) => {
                let p = tiledmap.getPropertiesForGID(gid)
                return p && p[field]
            }
            isSameCell = (a, b) => {
                if (a == b) return true;
                let pa = tiledmap.getPropertiesForGID(a)
                let pb = tiledmap.getPropertiesForGID(b)
                if (pa && pb) {
                    return pa[field] == pb[field];
                }
                return false;
            }
        }

        //向右合并
        var moveR = (gid, x, y) => {
            let ret = []
            for (var i = x; i < this.mw; i++) {
                let xy = cc.v2(i, y)
                let g = G(xy)
                if (isSameCell(gid, g)) {
                    ret.push(xy)
                } else {
                    break;
                }
            }
            return ret;
        }

        var moveD = (gid, rs: cc.Vec2[]) => {
            let tl = rs[0]
            let rows = [] // e: rs 
            rows.push(rs)
            for (var i = tl.y + 1; i < this.mh; i++) {
                let row = [];
                let canMove = rs.every(v => {
                    let xy = cc.v2(v.x, i)
                    let g = G(xy);
                    //向下合并
                    if (isSameCell(gid, g)) {
                        row.push(xy)
                        return true;
                    } else if (i == this.mh - 1) {
                        //最下面一行是空也可以合并
                        row.push(xy)
                        return true;
                    }
                })
                if (!canMove) {
                    break;
                }
                rows.push(row);
            }
            return rows;
        }
        let tags = {}
        let rects_map: { [index: number]: cc.Rect[] } = {}
        let tilesize = this.tiledmap.getTileSize();
        // let size = cc.size(tilesize.width * this.mw, tilesize.height * this.mh)
        let tagRect = (rows: cc.Vec2[][]) => {
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i]
                for (var j = 0; j < row.length; j++) {
                    let c = row[j]
                    let idx = this.IDX(c)
                    //将该cell标记为已处理
                    tags[idx] = true;
                }
            }
            let lt = rows[0][0]
            let rb = rows[rows.length - 1].pop();
            let origin = layer.getPositionAt(lt.x, rb.y);
            return cc.rect(origin.x, origin.y, (rb.x - lt.x + 1) * tilesize.width, (rb.y - lt.y + 1) * tilesize.height + offsetY)
        }
        for (var x = 0; x < this.mw; x++) {
            for (var y = 0; y < this.mh; y++) {
                let c = cc.v2(x, y)
                let gid = G(c);
                let idx = this.IDX(c)
                if (gid > 0 && isValidCell(gid) && tags[idx] == null) {
                    //move right 
                    let rows = moveD(gid, moveR(gid, x, y))
                    let rect = tagRect(rows);
                    let rects = rects_map[gid]
                    if (rects == null) {
                        rects = []
                        rects_map[gid] = rects
                    }
                    rects.push(rect);
                }
            }
        }
        // let sum = Object.keys(rects_map).reduce((sum, v) => {
        //     return sum + v.length;
        // }, 0)
        return rects_map;
    }


}