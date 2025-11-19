import { LocalizationManager } from "../../../../Localization/LocalizationManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuyPropsData {

    id: number;
    type: string;
    icon: string;
    name: string;
    describe: string;
    cost: number;
    public constructor(id) {
        let data = csv.BuyProps.get(id);
        this.id = data.id;
        this.type = data.type;
        this.name = LocalizationManager.getText(`@prop.${id}.name`) ;
        // this.name = data.name;
        this.describe = LocalizationManager.getText(`@prop.${id}.desc`);
        // this.describe = data.describe;
        this.icon = "Textures/ui/common/icon/" + data.icon;
        this.cost = data.cost;
    }
}
