import SFireAgent from "../../../../../framework/extension/shooter/SFireAgent";
import FizzBody from "../../../../../framework/fizzx/components/FizzBody";
import ccUtil from "../../../../../framework/utils/ccUtil";
import { root } from "../../Game";
import WeaponData from "../../model/WeaponData";

let { ccclass, property } = cc._decorator
    ;
@ccclass
export default class Meteorilite extends cc.Component {
    fireAgent: SFireAgent;
    weaponData: WeaponData

    offset: cc.Vec2;

    onLoad() {
        this.fireAgent = this.node.getComponentInChildren(SFireAgent);
        this.weaponData = ccUtil.get(WeaponData, "meteor")

        this.fireAgent.data = this.weaponData;
        this.fireAgent.initSpeed = this.weaponData.speed;
        this.fireAgent.bulletDamage = this.weaponData.damage;

        this.offset = cc.v2(cc.winSize.width * 1 / 2, cc.winSize.height * 2 / 3)

    }

    onEnable() {
        root.pet.follower.target = null;
        root.pet.follower.offset = this.offset
    }

    onDisable() {
        root.pet.run();
        root.pet.follower.reset();
    }

    onStep() {
        root.pet.collect();
        root.pet.follower.target = null;
        root.pet.follower.offset = this.offset
        let bullets = this.fireAgent.fire(-20);
    }



}