import ccUtil from "../../../../framework/utils/ccUtil";
import gameUtil from "../../../../framework/utils/gameUtil";
import { Res, ResType } from "./BaseData";
import MapSegData from "./MapSegData";

export default class LevelData {
    segments: MapSegData[] = []
    level: number = 0;

    name: string;

    reward: Res;
    /**随机道具从Prop.csv表 */
    isRandomReward: boolean = false;

    guide: string = ''

    public constructor(id) {
        let d = csv.Level.get(id);
        this.segments = d.segs.split("+").map(v => ccUtil.get(MapSegData, v))
        this.name = d.name;
        this.level = id;
        if (d.rewards.startsWith("random")) {
            this.isRandomReward = true;
        } else {
            if (d.rewards != "") {
                this.reward = Res.fromString(d.rewards)
            }
        }
        this.guide = d.guide;
    }


    getReward() {
        if (this.isRandomReward) {
            // 0.25的概率
            let pr = g.getRandom(csv.Prop.values);
            if (pr) {
                return new Res(ResType.Prop, pr.id, 1)
            } else {
                console.error("get Reward : csv.Prop errr")
            }
        } else {
            return this.reward;
        }
    }
}