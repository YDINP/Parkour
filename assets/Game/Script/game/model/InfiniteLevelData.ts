import ccUtil from "../../../../framework/utils/ccUtil";
import LevelData from "./LevelData";
import MapSegData from "./MapSegData";

// function srange(str) {
//     let [s1, s2] = str.split("-").map(v => parseInt(v))
//     if (s2 == null) {
//         s2 = s1
//     }
//     return range(s1, s2, 1)
// }

export default class InfiniteLevelData {

    begin: MapSegData[][];
    id: number
    rate: number;
    type: string;
    public constructor(id) {
        let d = csv.InfiniteLevel.get(id)
        if (d.begin_type == 'lv') {
            let lvdatas: LevelData[] = (d.begin).split("+").map(v => ccUtil.get(LevelData, v))
            this.begin = lvdatas.map(v => v.segments);
        } else {
            let segs: MapSegData[] = (d.begin).split("+").map(v => ccUtil.get(MapSegData, v))
            this.begin = segs.map(v => [v])
        }
        this.type = d.type;
        this.rate = d.rate;

    }
}