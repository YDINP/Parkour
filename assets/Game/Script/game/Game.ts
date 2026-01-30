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
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import Hi5 from "../../../framework/Hi5/Hi5";

// Hi5 플랫폼 여부 확인
const isHi5Platform = () => {
    return Hi5 != null;
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

        // 맵 뷰포트 클리핑 설정 - 장애물이 레터박스 영역을 넘어가지 않도록
        this.setupMapViewportClipping();
    }

    /**
     * 맵 뷰포트 클리핑 설정
     * 장애물이 Canvas 디자인 해상도(1136x640) 바깥으로 렌더링되지 않도록 Mask로 클리핑
     *
     * 주의: cc.Mask는 스텐실 버퍼를 사용하여 약간의 성능 오버헤드가 있음
     * 필요시 obstacleLayer만 마스킹하도록 최적화 가능
     */
    private setupMapViewportClipping() {
        if (!this.mapNode || !this.mapNode.parent) return;

        // 이미 적용된 경우 중복 적용 방지
        if (this.mapNode.parent.name === "mapMask") {
            console.log("[Game] Map viewport clipping already enabled");
            return;
        }

        // 디자인 해상도
        const designWidth = 1136;
        const designHeight = 640;

        // Mask 래퍼 노드 생성
        const maskWrapper = new cc.Node("mapMask");
        maskWrapper.setContentSize(designWidth, designHeight);
        maskWrapper.setAnchorPoint(0.5, 0.5);
        maskWrapper.setPosition(0, 0);

        // Mask 컴포넌트 추가 (RECT 타입으로 사각형 클리핑)
        const mask = maskWrapper.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;

        // mapNode의 부모와 sibling index 저장
        const originalParent = this.mapNode.parent;
        const siblingIndex = this.mapNode.getSiblingIndex();

        // maskWrapper를 원래 부모에 삽입
        maskWrapper.parent = originalParent;
        maskWrapper.setSiblingIndex(siblingIndex);

        // mapNode를 maskWrapper의 자식으로 이동
        this.mapNode.parent = maskWrapper;

        console.log("[Game] Map viewport clipping enabled - obstacles will be clipped at design resolution boundaries");
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
            Hi5.GameStart();
            console.log("[Hi5] GameStart called");
        }
    }

    start() {
        pdata.enterGame();

        this.loadMap();

        // transition_gradient 위치를 가로 긴 화면에서 맵 우측에 맞춤
        this.adjustTransitionGradient();
    }

    /**
     * 가로로 긴 화면에서 transition_gradient가 Canvas 우측이 아닌 맵 우측에 위치하도록 조정
     */
    adjustTransitionGradient() {
        let uiLayer = cc.find("Canvas/uilayer");
        if (!uiLayer) return;
        let transitionNode = uiLayer.getChildByName("transition_gradient");
        if (!transitionNode) return;

        // Canvas design resolution: 1136x640
        // 맵 우측 끝: designWidth/2 = 568
        const designWidth = 1136;
        const mapRightEdge = designWidth / 2; // 568

        // 실제 visibleRect 너비와 Canvas 너비의 차이 계산
        // fitWidth=true, fitHeight=true (SHOW_ALL) 모드에서
        // 가로가 더 길면 Canvas가 가로로 확장됨
        let canvasWidth = cc.visibleRect.width;
        let canvasRightEdge = canvasWidth / 2;

        // Widget 컴포넌트의 right 값을 조정하여 맵 우측에 위치하도록
        let widget = transitionNode.getComponent(cc.Widget);
        if (widget) {
            // 맵 우측과 Canvas 우측의 차이만큼 오프셋
            let offset = canvasRightEdge - mapRightEdge;
            widget.right = offset;
            widget.updateAlignment();
        }
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
        // 버프 활성화 시 현재 인덱스를 캡처하여 전달
        // (onEnable이 다음 프레임에 호출되어 인덱스가 변경되는 문제 방지)
        // gold 버프는 obstacleLayer, 나머지는 itemLayer 사용
        let startIndex = buff.name === 'gold'
            ? root.obstacleLayer.startIndex
            : root.itemLayer.startIndex;
        let buffData = { startIndex };

        // 디버그 로그
        console.log(`[Game.activateBuff] 버프 활성화:
  - buff.name: ${buff.name}
  - duration: ${dur}
  - buffData.startIndex: ${buffData.startIndex}
  - layer: ${buff.name === 'gold' ? 'obstacleLayer' : 'itemLayer'}`);

        if (this.pet && buff.name == 'magnet') {
            this.pet.buffSystem.startBuff(buff.name, dur, buffData)
        } else {
            root.player.buffSystem.startBuff(buff.name, dur, buffData)
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