import Device from "../../../../framework/core/Device"
import gUtil from "../../../../framework/core/gUtil"
import BuffSystem from "../../../../framework/extension/buffs/BuffSystem"
import FxHelpher from "../../../../framework/extension/fxplayer/FxHelpher"
import ccUtil from "../../../../framework/utils/ccUtil"
import { pdata } from "../../data/PlayerInfo"
import { root } from "../Game"
import InfiniteLevelData from "../model/InfiniteLevelData"
import LevelData from "../model/LevelData"
import MapSegData from "../model/MapSegData"

let { ccclass, property } = cc._decorator
@ccclass
export default class InfiniteMode extends cc.Component {

    onLoad() {

    }
    //正在加载 
    isLoading: boolean = false;

    curPhase: number = 1;
    themeLoadMax: number = 3;
    start() {
        this.loadNewSeg();
        //30s-40s 向前加载 一次
        this.schedule(this.checkMap, 1)
    }

    lastShowTime: number = 0;

    segs: { end, seg: MapSegData, type }[] = [];

    async loadNewSeg() {
        let lvdata = ccUtil.get(InfiniteLevelData, this.curPhase)
        let final_rate = lvdata.rate + pdata.showTimeRateAdd;
        if (Math.random() < final_rate) {
            if (lvdata.type == 'showtime') {
                let df = BuffSystem.main.time - this.lastShowTime
                //showtime 冷却时间 120
                if (df < 120) {
                    return;
                }
            }
            let segs = gUtil.getRandom(lvdata.begin);
            //循环  速度 加快
            this.next()
            this.isLoading = true;
            for (let i = 0; i < segs.length; i++) {
                let seg = segs[i]
                await root.appendSegments([segs[i]])

                this.segs.push({ end: root.mapLoader.mapWidth - cc.winSize.width, seg, type: lvdata.type })
            }
            this.isLoading = false;
        } else {
            return this.next();
        }

    }

    next() {
        this.curPhase = this.curPhase % csv.InfiniteLevel.size + 1;
    }

    checkMap() {
        let len = root.mapLoader.loadedTmxs.length
        if (len <= 2) {
            this.loadNewSeg();
        }
        // should update bg 
        let first = this.segs[0]
        if (first) {
            if (root.player.node.x > first.end) {
                let sec = this.segs[1]
                if (sec) {
                    if (sec.type == 'showtime') {
                        // showtime transition
                        // sfx_showtime
                        pdata.showTimeRateAdd = 0;
                        pdata.save("showTimeRateAdd")
                        Device.playSfx(csv.Audio.sfx_showtime)
                        root.transition(() => {
                            FxHelpher.play("screen", "ShowTime", cc.v2(0, cc.winSize.height / 4))
                        })
                        // endtime transition
                        this.lastShowTime = BuffSystem.main.time;
                    }
                    root.bgLayer1.setBackground(sec.seg.mapbg[0])
                    root.bgLayer2.setBackground(sec.seg.mapbg[1])
                    this.segs.shift();
                }
            }
        }
    }




}