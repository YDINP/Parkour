import { FxData } from "../../../../framework/extension/fxplayer/FxHelpher";

export default class MobData {
    name: string = "";
    deadFxs: FxData[];
    life: number;
    damage: number;
    deadAudio: string;
    size: cc.Size = null;
    score: number;
    public constructor(name) {
        let d = csv.Mob.get(name)
        this.name = d.name;
        let fxstr = d.dead_fx;
        this.deadAudio = d.dead_audio;
        if (fxstr.startsWith("$")) {
            let tmp = csv.Mob.get(d.dead_fx.substr(1))
            fxstr = tmp.dead_fx;
        }
        let s = fxstr.split("|")
        this.deadFxs = s.map(v => new FxData(v))
        this.life = d.life
        this.damage = d.damage;
        let [w, h] = d.size.split("x").map(v => parseInt(v))
        this.size = cc.size(w, h)
        this.score = d.score;

    }
}