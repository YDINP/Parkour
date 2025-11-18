const { ccclass, property } = cc._decorator;

@ccclass
export default class SilverCoinData {

    id: number;
    silver_coin: number;
    diamond: number;
    icon: string;
    public constructor(id) {
        let data = csv.SilverCoin.get(id);
        this.id = data.id;
        this.silver_coin = data.silver_coin;
        this.diamond = data.diamond;
        this.icon = data.icon;
    }
}
