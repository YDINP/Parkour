import ccUtil from "../../../../framework/utils/ccUtil";
import HeroData from "./HeroData";

export enum ResType {
    Unkonwn,
    Gold,
    Diamond,
    Hero,
    Pet,
    Exp,
    Energy,//体力,
    Prop,//道具
}



const ResIconPath = {
    [ResType.Gold]: "Textures/kakao/01lobby/ui_img_lobby_topmenu_coin",
    [ResType.Diamond]: "Textures/kakao/01lobby/ui_img_lobby_topmenu_dia",
}

export class Res {
    //数量 
    num: number;
    // 子id
    id: number;
    //大类型 
    type: ResType
    public constructor(type: string | ResType, idOrNum, num) {
        if (typeof (type) == "string") {
            this.type = ResType[type]
        }
        else {
            this.type = type;
        }
        if (num == null) {
            this.num = Number(idOrNum)
        } else {
            this.id = idOrNum;
            this.num = Number(num);
        }
    }

    static fromString(s: string) {
        let [t, i, n] = s.split("+");
        return new Res(t, i, n);
    }

    static getIconPath(type, id?) {
        let t = ResIconPath[type]
        if (t) {
            if (id) {
                return t[id];
            }
            return t;
        } else {
            switch (type) {
                case ResType.Hero:
                    const heroData = ccUtil.get(HeroData, id);
                    console.log(`[Res.getIconPath] Hero id=${id}, avatar=${heroData.avatar}`);
                    return heroData.avatar;
                case ResType.Prop:
                    return "Textures/ui/common/icon/" + csv.Prop.get(id).icon
            }
        }
        return t;
    }

}