import { Res } from "./BaseData";

export interface PetSkillLvData {
    lv: number;
    data: number;
    /**升级花费 */
    up_cost: Res;

}

export class PetSkillData {
    name: string;
    param: string;
    param2: string;
    constructor(s) {
        [this.name, this.param, this.param2] = s.split(/[,\+\-]/)
    }

}
export default class PetData {
    id: string;
    prefabPath: string;
    name: string;
    quality: string;
    avatar: string;
    capbility: string;
    desc: string;
    skill: PetSkillData;
    passiveSkill: PetSkillData;
    // buyCost: Res;

    lvs: { [index: number]: PetSkillLvData } = {};
    lvDesc: string;
    public constructor(id) {
        this.id = id;
        let d = csv.PetInfo.get(id)
        this.prefabPath = "pets/" + d.skeleton;
        this.name = d.name
        this.quality = d.quality;
        this.avatar = "Textures/avatars/pet/" + d.image;
        this.capbility = d.brief_info;
        this.desc = d.string_info
        this.skill = new PetSkillData(d.skill);
        this.passiveSkill = new PetSkillData(d.passiveSkill)
        // let [type, x, xx] = d.buycost.split("+");
        // this.buyCost = Res.fromString(d.buycost)

        this.lvDesc = d.lvdesc;
        let lvns = d.lvnum.split("+").map(v => Number(v))
        let lvcs = d.lvcost.split("+").map(v => Number(v))
        for (let i = 0; i < lvns.length; ++i) {
            let lvdata = {} as PetSkillLvData;
            lvdata.lv = i + 1;
            lvdata.data = lvns[i];
            // 升级固定使用银币升级
            lvdata.up_cost = Res.fromString("Gold+" + lvcs[i])
            //- 注意这里  表里配置的是k单位
            lvdata.up_cost.num = Math.floor(1000 * lvdata.up_cost.num)
            this.lvs[i] = lvdata
        }
    }

}