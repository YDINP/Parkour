import { LocalizationManager } from "../../../../Localization/LocalizationManager";

export default class ShopCapData {

    id: number = 0;
    type: string;
    name: string = "";
    description: string = "";
    vals = [];
    prices = [];
    prefix: string = "";
    public constructor(id: number) {
        let data = csv.shopCap.get(id);
        this.id = data.id;
        this.type = data.type;
        this.name = LocalizationManager.getText(`@shopCap.${id}.name`);
        // this.name = data.name;
        this.description = LocalizationManager.getText(`@shopCap.${id}.desc`);
        // this.description = data.description;
        this.vals = data.numerical_value.split("+").map(v => parseInt(v));
        this.prices = data.price.split("+").map(v => parseInt(v));
        this.prefix = "Textures/avatars/userup/" + data.path + "/";
    }
}
