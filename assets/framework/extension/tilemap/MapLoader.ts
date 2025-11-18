// import ObjectFactory from "../ObjectFactory";
import { tmxLoader, TMXProgressListener } from "../../../framework/extension/tilemap/RemoteTMXLoader";
import TmxLayerWalker from "../../../framework/extension/tilemap/TmxLayerWalker";
import FizzHelper, { BodyProperties } from "../../../framework/fizzx/components/FizzHelper";
import Fizz from "../../fizzx/fizz";

const { ccclass, property } = cc._decorator;

enum GroundType {
    Solid = 1,
    OneWay,
    Hurt,
    Ice,
}


enum FollowRulle {
    MAP_WH,
    MAP_W_SCREEN_H,
    NO_BOUNDARY,
}

@ccclass
export default class MapLoader extends cc.Component {

    @property(cc.Node)
    playerNode: cc.Node = null;

    @property
    followSpeed: number = 0.06;



    @property(cc.TiledMap)
    tiledmap: cc.TiledMap = null;

    @property({ type: cc.Enum(FollowRulle) })
    followRule: FollowRulle = FollowRulle.MAP_WH;


    /**以屏幕中心偏移 */
    @property(cc.Vec2)
    followOffset: cc.Vec2 = cc.v2();


    @property
    collisioLayer: string = 'collision'

    @property
    collisioTileset: string = 'collision_set'


    groundTypeGID: number = -1;

    mapWidth: number = 0;
    mapHeight: number = 0;


    layerWalker: TmxLayerWalker = null;

    followAction: any;


    onLoad() {
        // this.label.string = "加载..."
    }

    start() {
    }

    @property()
    groundOffsetY: number = 0;

    loadedTmxs: TmxLayerWalker[] = []

    loadCollisionLayer(shapedCollisionLayerName) {
        //使用形状编辑的碰撞 对象图层
        let layer = this.tiledmap.getObjectGroup(shapedCollisionLayerName)
        if (layer) {
            let objects = layer.getObjects()
            let defaults = {
                slip: true,
                friction: 1,
                bounce: 0
            }
            objects.forEach(v => {
                FizzHelper.createShape(v, defaults);
            })
        }
    }


    loadMap(url, progressCallback?: TMXProgressListener): Promise<TmxLayerWalker> {
        return tmxLoader.load(url, progressCallback).then(v => this.checkAndLoad(v, this.tiledmap))
    }

    appendMap(url, progressCallback?: TMXProgressListener) {
        return tmxLoader.load(url, progressCallback).then(tmxAsset => {
            let mapNode = new cc.Node(url);
            mapNode.parent = this.tiledmap.node;
            let tiledmap = mapNode.addComponent(cc.TiledMap)
            tiledmap.tmxAsset = tmxAsset;
            let layerWalker = tiledmap.getOrAddComponent(TmxLayerWalker)
            tiledmap.node.setAnchorPoint(0, 0)
            tiledmap.node.setPosition(this.mapWidth, 0)
            this.mapWidth += layerWalker.mapSizeInPixel.width;
            this.followAction.updateBoundary(this._getFollowRect(this.mapWidth, this.mapHeight));
            this.loadedTmxs.push(layerWalker);
            return Promise.resolve(layerWalker)
        })
    }

    checkAndLoad(tmxAsset, tiledmap) {
        tiledmap.tmxAsset = tmxAsset;
        return this.loadMapContent(tiledmap)
    }

    preprocessLoadedTmx(tiledmap: cc.TiledMap) {
        let tilesize = tiledmap.getTileSize();
        let mapsize = tiledmap.getMapSize();
        let mapWidth = tilesize.width * mapsize.width;
        let mapHeight = tilesize.height * mapsize.height;
        this.mapWidth += mapWidth;
        this.mapHeight = mapHeight;
        // let tree = new Quadtree(cc.rect(0, 0, mapWidth, tilesize.height * mapsize.height), 15, 4);
        FizzHelper.initWithMap(mapWidth, mapHeight);
        // gdata.mapWidth = tilesize.width * mapsize.width
        // console.log("loadmap" + gdata.mapWidth);

        // this.objects = parser.objectLayer.node
        // let properties = this.tiledmap.getProperties()
        // _tilesets -----> _mapInfo._textures   

        // set pos
        tiledmap.node.setAnchorPoint(0, 0);
        tiledmap.node.setPosition(cc.v2(-cc.winSize.width / 2, -cc.winSize.height / 2));

    }


    createShapedBody(rects_map) {
        for (var gid in rects_map) {
            var rects = rects_map[gid]
            let options = {} as BodyProperties;
            let ggid = parseInt(gid) - this.groundTypeGID + 1
            switch (ggid) {
                case GroundType.OneWay:
                    options.oneWay = true
                    break;
                case GroundType.Ice:
                    options.friction = 0;
                    break;
                case GroundType.Hurt:
                    options.group = 'hurt'
                    break;
                default:
                    break;
            }
            let type = GroundType[ggid]
            if (type) {
                rects.forEach(v => {
                    FizzHelper.createRectBody(v, options);
                })
            } else {
                console.log(`${type || "unknown type:" + gid}: ${rects.length} count`)
            }
        }
    }

    private _getFollowRect(w, h) {
        if (this.followRule == FollowRulle.MAP_W_SCREEN_H) {
            h = cc.winSize.height;
        } else if (this.followRule == FollowRulle.NO_BOUNDARY) {
            w = 0, h = 0
        }
        let rect = cc.rect(cc.winSize.width / 2, cc.winSize.height / 2, w, h);
        return rect;
    }

    setAutoFollow() {
        // follow  options
        this.followAction = cc.smoothFollow(this.playerNode, this._getFollowRect(this.mapWidth, this.mapHeight), this.followSpeed, this.followOffset)
        this.tiledmap.node.runAction(this.followAction)
    }

    loadMapContent(tiledmap: cc.TiledMap): Promise<TmxLayerWalker> {
        // 加载
        return new Promise(resolve => {
            this.preprocessLoadedTmx(tiledmap);
            this.setAutoFollow()
            this.layerWalker = tiledmap.addComponent(TmxLayerWalker)
            // @ts-ignore
            for (let i = tiledmap._tilesets.length - 1; i >= 0; i--) {
                // @ts-ignore
                let tilesetInfo: cc.TMXTilesetInfo = tiledmap._tilesets[i];
                if (tilesetInfo.name == this.collisioTileset) {
                    this.groundTypeGID = tilesetInfo.firstGid
                    break;
                }
            }
            if (this.groundTypeGID == -1) {
                console.warn("[MapLoader]:not found collision-set named: " + this.collisioTileset)
            } else {
                let shapes = this.layerWalker.findRects(this.collisioLayer, { topOffset: this.groundOffsetY });
                this.createShapedBody(shapes);
            }
            // objectParser.setFactory(ObjectFactory);
            resolve(this.layerWalker);


        })
    }



}