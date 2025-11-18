export default class MapSegData {
    id: number;
    level_tmx: string;
    mapbg: string[];
    theme: number;
    thumb: string;
    title: string;
    unlock: number;
    public constructor(id) {
        let d = csv.MapSeg.get(id)
        this.id = id;
        this.level_tmx = d.level_tmx;
        this.theme = d.theme
        this.thumb = d.thumb;
        this.unlock = d.unlock
        let dbg = csv.MapBg.get(d.mapbg)
        this.mapbg = [dbg.layer1, dbg.layer2];
    }
}