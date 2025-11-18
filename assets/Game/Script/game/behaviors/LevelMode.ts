import Signal from "../../../../framework/core/Signal"
import FizzHelper from "../../../../framework/fizzx/components/FizzHelper"
import ccUtil from "../../../../framework/utils/ccUtil"
import { pdata } from "../../data/PlayerInfo"
import { root } from "../Game"
import LevelData from "../model/LevelData"
import ObjectFactory from "../ObjectFactory"

let { ccclass, property } = cc._decorator

@ccclass
export default class LevelMode extends cc.Component {

    onLoad() {

    }

    start() {
        this.loadLevel()
    }

    onLoaded: Signal = new Signal();

    async loadLevel() {
        let lvdata = ccUtil.get(LevelData, pdata.playinglv)
        await root.appendSegments(lvdata.segments, 1, lvdata.segments.length)
        this.onLoaded.fire();
        // 在结尾处添加 
        FizzHelper.createRectBody(cc.rect(root.mapLoader.mapWidth, 0, 2500, 100))

        root.createBodyNode("objects/prefabs/endTrigger", root.mapLoader.mapWidth, cc.winSize.height / 2)

    }



}