import PoolManager from "../../../framework/core/PoolManager";
import gUtil from "../../../framework/core/gUtil";
import FxHelpher, { FxData } from "../../../framework/extension/fxplayer/FxHelpher";
import FxLayer from "../../../framework/extension/fxplayer/FxLayer";
import PoolSpawner from "../../../framework/extension/optimization/PoolSpawner";
import ParallaxNode from "../../../framework/extension/scroll/ParallaxNode";
import MapLoader from "../../../framework/extension/tilemap/MapLoader";
import FizzBody from "../../../framework/fizzx/components/FizzBody";
import FizzHelper, { BodyProperties } from "../../../framework/fizzx/components/FizzHelper";
import mvcView from "../../../framework/ui/mvcView";
import ccCache from "../../../framework/utils/ccCache";
import ccUtil from "../../../framework/utils/ccUtil";
import LoadingScene from "../common/LoadingScene";
import UIPlayControls from "./UIPlayControls";
import { ParkourType, pdata } from "../data/PlayerInfo";
import SortedCursorLayer from "./extension/SortedCursorLayer";
import ItemData, { BuffData } from "./model/ItemData";
import LevelData from "./model/LevelData";
import MapSegData from "./model/MapSegData";
import PetData from "./model/PetData";
import ObjectFactory from "./ObjectFactory";
import Item from "./objects/Item";
import Pet from "./objects/Pet";
import Player, { SkillState } from "./Player";
import TmxLayerWalker, { ITileObjectFactory, TileAttrs } from "../../../framework/extension/tilemap/TmxLayerWalker";
import LevelMode from "./behaviors/LevelMode";
import InfiniteMode from "./behaviors/InfiniteMode";
import InfiniteLevelData from "./model/InfiniteLevelData";
import BuffSystem from "../../../framework/extension/buffs/BuffSystem";
import FSM from "../../../framework/core/FSM";
import FizzManager from "../../../framework/fizzx/components/FizzManager";
import InventoryUI from "../view/TopMostInventoryUI";
import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import NoobLevel from "./behaviors/NoobLevel";
import GameLayerTop from "./views/GameLayerTop";
import { LocalizationManager } from "../../../Localization/LocalizationManager";
import _Hi5Import from "../../../framework/Hi5/Hi5";

// Hi5 모듈 가져오기 (import 실패 시 전역 객체에서 가져옴)
const getHi5Module = () => {
    // 1. import된 모듈 사용
    if (_Hi5Import && typeof _Hi5Import.GameStart === 'function') {
        return _Hi5Import;
    }
    // 2. 전역 _Hi5Module에서 가져오기
    if (typeof window !== 'undefined' && window['_Hi5Module'] && typeof window['_Hi5Module'].GameStart === 'function') {
        return window['_Hi5Module'];
    }
    // 3. 초기화된 Hi5 객체에서 가져오기
    if (typeof window !== 'undefined' && window['Hi5'] && typeof window['Hi5'].GameStart === 'function') {
        return window['Hi5'];
    }
    // 4. cc.pvz.Hi5에서 가져오기 (hi5.js fallback)
    if (typeof cc !== 'undefined' && cc['pvz'] && cc['pvz']['Hi5'] && typeof cc['pvz']['Hi5'].GameStart === 'function') {
        return cc['pvz']['Hi5'];
    }
    return null;
};

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return typeof window !== 'undefined' && window['Hi5'] != null;
};

let { ccclass, property } = cc._decorator
export let root: Game = null;

enum State {
    Run,
    Pause,
    Resume,
    End,
    Stop
}

@ccclass
export default class Game extends mvcView implements ITileObjectFactory {

    @property(MapLoader)
    mapLoader: MapLoader = null;

    static instance: Game = null;

    playControls: UIPlayControls = null;

    @property(ParallaxNode)
    bgLayer1: ParallaxNode = null

    @property(ParallaxNode)
    bgLayer2: ParallaxNode = null

    itemLayer: SortedCursorLayer = null;
    obstacleLayer: SortedCursorLayer = null;

    player: Player = null;

    pet: Pet = null;

    fsm: FSM = null;

    @property(cc.Node)
    mapNode: cc.Node = null;


    @property(cc.Node)
    loadingbg: cc.Node = null;

    @property(cc.Node)
    subEnergyTag: cc.Node = null;

    @property(cc.ProgressBar)
    loadingBar: cc.ProgressBar;

    @property(GameLayerTop)
    uilayer: GameLayerTop;

    @property(cc.Node)
    transitionNode: cc.Node = null;

    isFirst: boolean = true;

    _invisibleRectsEnabled = false;
    onLoad() {
        Game.instance = this;
        root = this;
        this.playControls = this.getComponentInChildren(UIPlayControls);
        this.player = this.getComponentInChildren(Player);

        if (CC_DEBUG) {
            window['maploader'] = this.mapLoader;
            window['game'] = this;
        }

        csv.Item.values.filter(v => v.anim != null).forEach(v => {
            ccCache.loadFrameAnimClip(ccUtil.get(ItemData, v.id).anim)
        })
        if (!Device.getBgmState(csv.Audio.gameBgm)) {
            Device.playBGM(csv.Audio.gameBgm);
        }
        this.fsm = this.addComponent(FSM);
        this.fsm.init(this, State);
    }


    onDestroy() {
        root = null;
        //保存
        pdata.save("diamond")
    }

    //change play
    // changePlayer(node: cc.Node) {
    //     this.mapLoader.playerNode = node;
    //     this.playControls.playerController = node.getComponent(PlayerController);
    // }


    restart() {
        LoadingScene.goto("Main")
    }

    go() {
        this.player.buffSystem.startBuff("loseLife")
        this.fsm.changeState(State.Run)

        // Hi5 게임 시작 알림
        if (isHi5Platform()) {
            const _Hi5 = getHi5Module();
            if (_Hi5) {
                _Hi5.GameStart();
                console.log("[Hi5] GameStart called");
            }
        }
    }

    start() {
        pdata.enterGame();

        this.loadMap();
    }

    onLoadFinished(params?) {
        if (params) {
            if (params.type) {
                if (params.type == "subEnergy") {
                    this.subEnergy();
                }
            }
        }
    }

    subEnergy() {
        InventoryUI.instance.setTarget(this.subEnergyTag);
        this.scheduleOnce(() => {
            pdata.energy--;
            pdata.save("energy");
        }, 0.1)
    }
    /** 飞行状态时开启，防止掉下去  */
    private invisibleRectBodies = [];

    loadMap() {
        // preload prefabs 
        let spawnerPool = PoolSpawner.get("monsters")
        //todo 跟据关卡需要的情况加载 
        spawnerPool.preload("action_001", "objects/prefabs/action_001")
        spawnerPool.preload("action_002", "objects/prefabs/action_002")
        spawnerPool.preload("action_003", "objects/prefabs/action_003")
        spawnerPool.preload("action_004", "objects/prefabs/action_004")
        spawnerPool.preload("action_005", "objects/prefabs/action_005")
        spawnerPool.preload("action_006", "objects/prefabs/action_006")
        spawnerPool.preload("action_007", "objects/prefabs/action_007")
        spawnerPool.preload("action_008", "objects/prefabs/action_008")
        spawnerPool.preload("action_009", "objects/prefabs/action_009")
        spawnerPool.preload("action_010", "objects/prefabs/action_010")
        spawnerPool.preload("action_011", "objects/prefabs/action_011")
        spawnerPool.preload("action_012", "objects/prefabs/action_012")
        spawnerPool.preload("action_013", "objects/prefabs/action_013")
        spawnerPool.preload("action_014", "objects/prefabs/action_014")
        spawnerPool.preload("action_015", "objects/prefabs/action_015")

        let node = new cc.Node("itemLayer");
        node.parent = this.mapNode
        node.zIndex = 11;
        this.itemLayer = node.addComponent(SortedCursorLayer)
        // this.itemLayer.func_isInValid = (node: cc.Node) => node.x < (-this.mapLoader.tiledmap.node.x - cc.winSize.width / 2)

        node = new cc.Node("obstalceLayer");
        node.parent = this.mapNode;
        node.zIndex = 10;
        this.obstacleLayer = node.addComponent(SortedCursorLayer)
        // this.obstacleLayer.func_isInValid = this.itemLayer.func_isInValid

        FxLayer.get("map").node.zIndex = 12;

        //fix when playinglv == 0
        pdata.playinglv = pdata.playinglv || 0;
        let lvdata = ccUtil.get(LevelData, pdata.playinglv)
        // let lvdata = ccUtil.get(LevelData, 2)
        let mapSegData = lvdata.segments[0];

        //模式第一段
        if (pdata.gameMode == ParkourType.Normal) {
            //关卡
            mapSegData = lvdata.segments[0];
        } else {
            //无尽 
            mapSegData = ccUtil.get(MapSegData, 'forest')
        }
        this.mapLoader.followOffset = cc.v2(cc.winSize.width / 4, 0);
        this.mapLoader.playerNode.active = false;
        this.mapLoader.loadMap(mapSegData.level_tmx, this.onLoadingMap.bind(this)).then(layerWalker => {

            this.createCollisionLayer(layerWalker);
            this.loadElements(layerWalker)

            // map bg
            this.bgLayer1.setBackground(mapSegData.mapbg[0])
            this.bgLayer2.setBackground(mapSegData.mapbg[1])

            this.player.set(pdata.selHero).then(v => this.setStartBuff())
            this.mapLoader.playerNode.active = true;
            //加载宠物 
            this.equipPet(pdata.selPet);

            //正常关卡
            //添加剩余段
            if (pdata.gameMode == ParkourType.Normal) {
                let levelMode = this.mapNode.getComponent(LevelMode);
                if (!levelMode) {
                    levelMode = this.mapNode.addComponent(LevelMode);
                }
                levelMode.onLoaded.on(this.onLevelLoadCompleted, this)
                if (pdata.playinglv == 0) {
                    //新手关
                    let noobLevel = this.uilayer.getComponent(NoobLevel);
                    if (!noobLevel) {
                        noobLevel = this.uilayer.addComponent(NoobLevel);
                    }
                }
            }
            else {
                let infiniteMode = this.mapNode.getComponent(InfiniteMode);
                if (!infiniteMode) {
                    infiniteMode = this.mapNode.addComponent(InfiniteMode);
                }
                this.onLevelLoadCompleted();
            }

        })
    }

    onLoadingMap(c, t, item) {
        let p = c / t;
        this.loadingBar.progress = p;
    }

    //全部加载结束 
    onLevelLoadCompleted() {
        this.go()
        this.loadingbg.active = false;
        FxHelpher.play("screen", "ui/game_start_tip", cc.Vec2.ZERO)
    }

    setStartBuff() {
        if (pdata.gameMode == ParkourType.Infinite) {
            let buffs = pdata.getStartBuff();
            for (let key in buffs) {
                this.player.buffSystem.startBuff(buffs[key], csv.BuyProps.get(key).buff);
            }
        }
    }

    pauseFizz() {
        FizzManager.instance.enabled = false;
    }
    //---------------------------[state begin]-----------------------------
    enter_Pause() {
        this.player && this.player.buffSystem.pause();
        this.pet && this.pet.buffSystem.pause();
        this.scheduleOnce(this.pauseFizz, 2)
    }

    enter_Resume(state, p) {
        state.resumeEvent = p
    }

    update_Resume(state) {
        if (this.fsm.timeElapsed > 3) {
            this.fsm.changeState(State.Run)
            FizzManager.instance.enabled = true;
            if (state.resumeEvent.cmd == "revive") {
                this.revive(state.resumeEvent.heroId);
            }
            vm.hide("UIResume")
            this.player && this.player.buffSystem.resume();
            this.pet && this.pet.buffSystem.resume();
        }
    }


    update_Run() {
        this.run();
        this.mapLoader.loadedTmxs.forEach((v, i) => {
            let px = v.node.x + v.node.width
            let ss = -this.mapNode.x - cc.winSize.width / 2;
            if (px < ss) {
                v.node.destroy();
                this.mapLoader.loadedTmxs.splice(i, 1);
            }
        })
    }

    enter_Stop(state, p) {
        this.player.xMove = 1;
        cc.tween(this.player).to(p, { xMove: 0 }).start();
    }

    update_Stop() {
        this.run()
        this.player.body.xv *= 0.99;
    }

    exit_Stop(state, p) {
        this.player.xMove = 1;
    }

    //---------------------------[state end]-----------------------------

    stop(n) {
        this.fsm.changeState(State.Stop, n)
    }

    isPause() {
        return this.fsm.isInState(State.Pause);
    }

    pause() {
        this.fsm.changeState(State.Pause)
    }


    resume(p?, hero?) {
        // BuffSystem.resumeAll();

        // vm.show("UIResume", this.subEnergy.bind(this));
        vm.show("UIResume");
        this.fsm.changeState(State.Resume, { cmd: p, heroId: hero });
    }

    revive(heroId) {
        pdata.isGameEnd = false;
        this.player.buffSystem.startBuff("loseLife")
        this.player.buffSystem.startBuff("revive", 2);
        this.player.set(heroId);
    }


    async appendSegments(segs: MapSegData[], startIndex = 0, endIndex = 0) {
        endIndex = endIndex || segs.length;
        for (let i = startIndex; i < endIndex; i++) {
            await this.mapLoader.appendMap(segs[i].level_tmx, this.onLoadingMap.bind(this)).then(v => {
                this.onSegLoaded(v);
                console.log("load mapseg:" + segs[i].level_tmx)
            }).catch(e => console.error(e))
        }
    }

    onSegLoaded(layerWalker) {
        this.createCollisionLayer(layerWalker, layerWalker.node.x);
        this.loadElements(layerWalker)
        return Promise.resolve();
    }

    loadElements(layerWalker: TmxLayerWalker) {
        layerWalker.setFactory(this);
        //load items
        layerWalker.createGroupObjects("object_item");
        // load obj
        layerWalker.createGroupObjects("object_obstacle")
        // load monster(with animation)
        layerWalker.createGroupObjects("object_monster")
    }

    createCollisionLayer(layerWalker: TmxLayerWalker, offsetX = 0) {
        let krects = layerWalker.findRects("platform", {
            fieldAsSameRegion: 'platform',
        })
        for (let k in krects) {
            let rects = krects[k]
            let p = layerWalker.tiledmap.getPropertiesForGID(parseInt(k))
            let option = {} as BodyProperties
            if (p.platform == 2 || p.platform == 3) {
                option.oneWay = true;
                if (p.platform == 2) {
                    option.paddingTop = 23
                } else {
                    option.paddingTop = 18
                }
            } else {
                option.paddingTop = 23
            }
            rects.forEach(rect => {
                rect.x += offsetX;
                let body = FizzHelper.createRectBody(rect, option)
                if (p.platform == 2) {
                    this.invisibleRectBodies.push(body);
                    body.enabled = this._invisibleRectsEnabled;
                }
            });
        }

    }

    set invisibleRectsEnabled(val) {
        this._invisibleRectsEnabled = val;
        this.invisibleRectBodies.forEach(v => v.enabled = val)
    }


    run() {
        if (this.player)
            this.player.move();
    }


    activateBuff(buff: BuffData) {
        let dur = buff.duration;
        if (this.pet) {
            // 特殊buff  ，添加道具持续时间 
            if (this.pet.buffSystem.isEnabled("itemStrength")) {
                dur += this.pet.data.lvs[pdata.selPetLevel - 1].data;
            }
        }
        if (this.pet && buff.name == 'magnet') {
            this.pet.buffSystem.startBuff(buff.name, dur)
        } else {
            root.player.buffSystem.startBuff(buff.name, dur)
        }
    }


    //装备宠物
    async equipPet(petId) {
        let petData = ccUtil.get(PetData, petId)
        if (petData == null) return;
        if (!petData.prefabPath || petData.prefabPath === "") {
            console.warn(`[Game.equipPet] Invalid prefabPath for petId: ${petId}`);
            return;
        }
        let prefab = await ccUtil.getRes(petData.prefabPath, cc.Prefab)
        let node = LocalizationManager.instantiatePrefab(prefab as unknown as cc.Prefab);
        node.parent = this.mapNode;
        this.pet = node.getComponent(Pet);
        this.pet.set(petId)
        this.pet.follower.target = this.player.node;
    }

    public async createBodyNode(prefabPath: string, x, y) {
        let prefab = await ccUtil.getRes(prefabPath, cc.Prefab);
        let node = LocalizationManager.instantiatePrefab(prefab as unknown as cc.Prefab);
        if (node == null) return;
        node.parent = this.mapNode;
        node.setPosition(x, y);
        let body = node.getComponent(FizzBody)
        body.syncPosition();
    }

    makeItem(prefab: string, itemName: string, px, py) {
        let layer = this.itemLayer;
        let node = PoolManager.get("items").get(prefab)
        let body = node.getComponent(FizzBody);
        let item = gUtil.getOrAddComponent(node, Item);
        item.changeItem(itemName);
        layer.push(node);
        node.parent = layer.node;
        body.setPosition(px, py)
        return item;
    }

    addToLayer(node: cc.Node, layer: SortedCursorLayer) {
        ccUtil.changeParent(node, layer.node)
        layer.push(node);
    }

    addBodyToLayer(node: cc.Node, layer: SortedCursorLayer) {
        let body = node.getComponent(FizzBody);
        node.setAnchorPoint(cc.v2(0.5, 0.5))
        let px = body.x, py = body.y;
        node.parent = layer.node;
        layer.push(node);
        node.x = px, node.y = py;
        body.syncPosition();
    }

    createGroupObject(node: any, properties, layerName: string, tiledmap: cc.TiledMap) {
        return ObjectFactory.create(tiledmap, layerName, properties, node);
    }


    createObject(objectLayer: cc.TiledLayer, attrs: TileAttrs) {
        //     let type = attrs.properties.type
        //     let path = 'objects/prefabs/' + type;
        //     ccUtil.getRes(path, cc.Prefab).then(prefab => {
        //         let node = cc.instantiate(prefab) as cc.Node;
        //         node.setPosition(attrs.pos);
        //         node.parent = objectLayer.node
        //     })
        //     // console.log(node);
    }

    //--------------
    play_efx(name, pos: cc.Vec2, rotation = 0, scaleX = 1, scaleY = 1) {
        let path = 'effects/prefabs/' + name
        FxLayer.get("map").play(path, { pos, rotation, scaleX, scaleY })
    }

    //-----------------

    transition(callback) {
        cc.tween(this.transitionNode).to(0.5, {
            width: 2500,
        }).delay(0.1).to(0.2, {
            width: 1,
        }).call(callback).start()

    }


}