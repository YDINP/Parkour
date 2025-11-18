
export default class WeaponData {
    name: string;
    desc: string;
    bullet: string;
    castFx: string;
    hit: string;
    damage: number;
    speed: number;
    canLand: boolean;
    removeAfter: number;
    startOffsetY: number;
    castFxOffset: cc.Vec2;
    public constructor(name) {
        let d = csv.Weapon.get(name);
        this.name = d.name;
        this.desc = d.desc;
        this.bullet = d.bullet;
        this.hit = d.hit;
        this.damage = d.damage;
        this.speed = d.speed;
        this.canLand = d.canLand;
        this.removeAfter = d.duration;
        this.startOffsetY = d.startOffset;
        this.castFx = 'effects/prefabs/' + d.castFx;
        let [x, y] = d.castFxOffset.split(",").map(v => parseInt(v))
        this.castFxOffset = cc.v2(x, y)
    }
}