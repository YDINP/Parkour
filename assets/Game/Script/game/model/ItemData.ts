import { FxData } from "../../../../framework/extension/fxplayer/FxHelpher";
import { FrameAnimOption } from "../../../../framework/extension/qanim/FrameAnim";

export interface BuffData {
    name: string;
    duration: number;
}


export default class ItemData {
    name: string = "";
    score: number;
    life: number;
    coin: number;
    deadFx: FxData;
    anim: FrameAnimOption;
    buff: BuffData;
    imagePath: string;
    audioPath: string;
    isBean: boolean;
    diamond: number;
    public constructor(name) {
        let d = csv.Item.get(name)
        this.name = d.name;
        this.deadFx = new FxData(d.dead_fx)
        this.life = d.life
        this.score = d.score;
        this.coin = d.coin;
        this.diamond = d.diamond
        this.audioPath = d.audio;
        //@ts-ignore
        this.anim = csv.Anim.get(d.anim);
        this.imagePath = "item/" + d.image;
        this.isBean = !!d.isBean
        let [bname, dur] = d.buff.split("-")
        if (dur) {
            this.buff = { name: bname, duration: parseInt(dur) }
        }
    }
}