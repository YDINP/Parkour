export default class PlayerData {
    level: number = 0;
    require_exp: number = 0;
    gold_reward: number = 0;
    diamond_reward: number = 0
    scoreAdd: number = 0;
    public constructor(lv) {
        this.level = lv;
        let d = csv.User.get(lv)
        this.require_exp = d.exp;
        this.gold_reward = d.gold;
        this.diamond_reward = d.diamond;
        this.scoreAdd = d.scoreAdd;
    }
}