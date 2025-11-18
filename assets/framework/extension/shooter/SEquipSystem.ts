import SFireAgent from "./SFireAgent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SEquipSystem extends cc.Component {

    @property(cc.Prefab)
    weaponPrefab: cc.Prefab = null

    weapon: SFireAgent = null;

    weapons: { [index: string]: SFireAgent } = {}

    start() {
        //mainweapon
        this.switchWeapon(this.weaponPrefab);
    }

    onDisable() {
        this.removeMainWeapon()
    }

    private createWeapon(weaponPrefab: cc.Prefab): SFireAgent {
        let weaponNode = cc.instantiate(weaponPrefab);
        weaponNode.setParent(this.node);
        weaponNode.setPosition(0, 0);
        let weapon = weaponNode.getComponent(SFireAgent);
        if (!weapon) {
            console.log("[SEquipSystem] target node is not a SWeapon")
            weapon = weaponNode.addComponent(SFireAgent);
        }
        return weapon
    }

    addWeapon(k, weaponPrefab: cc.Prefab) {
        this.removeWeapon(k)
        let weapon = this.createWeapon(weaponPrefab)
        this.weapons[k] = weapon;
    }

    removeMainWeapon() {
        if (this.weapon) {
            this.weapon.node.destroy();
        }
    }

    removeWeapon(k) {
        let weapon = this.weapons[k]
        if (weapon)
            weapon.node.destroy();
        this.weapons[k] = null;
    }

    switchWeapon(weaponPrefab: cc.Prefab) {
        if (weaponPrefab == null)
            return;
        if (this.weapon) {
            this.weapon.node.destroy();
        }
        this.weapon = this.createWeapon(weaponPrefab)
    }

    // update (dt) {}
}
