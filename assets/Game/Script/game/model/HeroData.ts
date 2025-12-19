import gUtil from "../../../../framework/core/gUtil";
import { LocalizationManager } from "../../../../framework/Hi5/Localization/LocalizationManager";
import { Res } from "./BaseData";

export interface HeroSkillLvData {
    lv: number;
    data: number;
    /**升级花费 */
    up_cost: Res;

}

// export enum SkillType {
//     cd,
//     attr,
//     mixed
// }


export class HeroSkillData {
    name: string;
    param: number[];
    // type: SkillType;
    constructor(s: string) {
        let arr = s.split(/[,\+\-]/)
        this.name = arr.shift();
        this.param = arr.map(v => Number(v))
    }
}

export default class HeroData {
    id: string;
    prefabPath: string;
    name: string;
    quality: string;
    avatar: string;
    desc: string;
    hp: number;
    skill: HeroSkillData;
    passiveSkill: HeroSkillData;
    buyCost: Res;
    weapon: string;
    skillAudio: string;
    dieAudio: string;
    lvs: { [index: number]: HeroSkillLvData } = {};
    lvDesc: string;

    jumpMax: number = 2;

    portrait: string;

    public constructor(id) {
        let d = csv.HeroInfo.get(id);
        this.id = id;
        this.prefabPath = "heros/" + d.skeleton;
        this.name = LocalizationManager.getText(`@hero.${id}.name`);
        this.quality = d.quality;
        this.avatar = "Textures/avatars/hero/" + d.image;
        let paddedId = gUtil.padNum(id, 3);
        this.portrait = "Textures/avatars/portrait/portrait_" + paddedId;
        this.hp = d.hp;
        this.skill = new HeroSkillData(d.skill);
        this.weapon = d.weapon;
        this.passiveSkill = new HeroSkillData(d.passiveSkill);
        this.buyCost = Res.fromString(d.buycost)
        this.skillAudio = d.skillAudio;
        this.dieAudio = d.dieAudio;
        this.lvDesc = LocalizationManager.getText(`@hero.${id}.desc`);
        // this.lvDesc = d.lvdesc;
        // this.type = d.skillType;
        let lvns = d.lvnum.split("+").map(v => Number(v))
        let lvcs = d.lvcost.split("+").map(v => Number(v))
        this.jumpMax = d.jumpMax || this.jumpMax;
        for (let i = 0; i < lvns.length; ++i) {
            let lvdata = {} as HeroSkillLvData;
            lvdata.lv = i + 1;
            lvdata.data = lvns[i];
            lvdata.up_cost = Res.fromString("Gold+" + lvcs[i])
            //- 注意这里  表里配置的是k单位
            lvdata.up_cost.num = Math.floor(1000 * lvdata.up_cost.num)
            this.lvs[i] = lvdata
        }
    }
}