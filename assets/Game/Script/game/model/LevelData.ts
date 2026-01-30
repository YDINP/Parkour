import gUtil from "../../../../framework/core/gUtil";
import ccUtil from "../../../../framework/utils/ccUtil";
import gameUtil from "../../../../framework/utils/gameUtil";
import { Res, ResType } from "./BaseData";
import MapSegData from "./MapSegData";
import { LocalizationManager } from "../../../../framework/Hi5/Localization/LocalizationManager";

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
        if (!d || !d.segs) {
            // 레벨 데이터가 없으면 빈 상태로 초기화
            console.warn(`${id} get failed from LevelData`);
            this.segments = [];
            this.level = id;
            return;
        }
        this.segments = d.segs.split("+").map(v => ccUtil.get(MapSegData, v))
        this.name = LocalizationManager.getText(`@map.name.${id}`);
        // this.name = d.name;
        this.level = id;
        if (d.rewards && d.rewards.startsWith("random")) {
            this.isRandomReward = true;
        } else {
            if (d.rewards && d.rewards != "") {
                this.reward = Res.fromString(d.rewards)
            }
        }
        this.guide = d.guide;
    }


    getReward() {
        if (this.isRandomReward) {
            // 0.25的概率
            let pr = gUtil.getRandom(csv.Prop.values);
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