import { evt } from "../../../../framework/core/event";

const { ccclass, property } = cc._decorator;

@ccclass
export default class eggAction extends cc.Component {
    @property(cc.Node)
    egg_on: cc.Node = null;

    @property(cc.Node)
    egg_off: cc.Node = null;

    @property(cc.Node)
    fullEgg: cc.Node = null;

    @property(cc.Animation)
    tear: cc.Animation = null;

    @property(cc.Node)
    egg_top: cc.Node = null;

    @property(cc.Node)
    egg_bottom: cc.Node = null;

    @property(cc.Node)
    tear_on: cc.Node = null;

    @property(cc.Node)
    twinkleStar: cc.Node = null;

    private eggAction: cc.Tween<any> = null;

    private eggTopPos: cc.Vec2 = null;

    private eggBottomPos: cc.Vec2 = null;

    private fullEggPos: cc.Vec2 = null;

    onLoad() {
        this.tear.on("finished", this.onTearFinished, this);
        this.eggTopPos = this.egg_top.getPosition();
        this.eggBottomPos = this.egg_bottom.getPosition();
        this.fullEggPos = this.fullEgg.getPosition();
    }

    start() {
        this.initEgg()
    }

    private initEgg() {
        this.egg_off.active = true;
        this.egg_on.active = false;
        this.twinkleStar.active = false;
        this.fullEgg.setPosition(this.fullEggPos);
        this.tear_on.active = true;
        this.egg_top.opacity = 255;
        this.egg_bottom.opacity = 255;
        this.egg_top.setPosition(this.eggTopPos);
        this.egg_bottom.setPosition(this.eggBottomPos);
        this.tear.node.active = false;
    }

    private eggWaggleAction() {
        let e = this.fullEgg;
        let pos = e.getPosition();
        let r1 = 1;

        let t1 = 0.15;
        let a1 = 20;
        let act1 = cc.tween()
            .to(t1, { angle: a1 }, { easing: "" })
            .to(2 * t1, { angle: -a1 }, { easing: "" })
            .to(t1, { angle: 0 }, { easing: "" })

        let t2 = 0.005;
        let p1 = cc.v2(pos.x - 2, pos.y - 2);
        let p2 = cc.v2(pos.x + 2, pos.y + 2);
        let act2 = cc.tween()
            .to(t2, { position: p1 }, { easing: "" })
            .to(2 * t2, { position: p2 }, { easing: "" })
            .to(2 * t2, { position: pos }, { easing: "" })

        let p3 = cc.v2(pos.x - 2, pos.y + 2);
        let p4 = cc.v2(pos.x + 2, pos.y - 2);
        let act3 = cc.tween()
            .to(t2, { position: p3 }, { easing: "" })
            .to(2 * t2, { position: p4 }, { easing: "" })
            .to(2 * t2, { position: pos }, { easing: "" })

        let act4 = cc.tween()
            .repeat(1, act2)
            .repeat(1, act3)

        this.eggAction = cc.tween(e)
            .delay(0.2)
            .repeat(r1, act1)
            .delay(0.5)
            .call(() => {
                this.scheduleOnce(() => {
                    this.tear.node.active = true;
                    this.tear.play();
                }, 0.7)
            })
            .repeatForever(act4)
            .start()
    }

    private onTearFinished() {
        this.eggAction.stop();
        this.egg_off.active = false;
        this.egg_on.active = true;
        this.openEgg()
    }

    private openEgg() {
        let t = this.egg_top;
        let b = this.egg_bottom;
        let s = 50;
        let _t = 1;
        let _t1 = 2;
        let pt = t.getPosition();
        let pb = b.getPosition();
        let pte = cc.v2(pt.x + s, pt.y + s);
        let pbe = cc.v2(pb.x - s, pb.y - s);
        this.tear_on.active = false;
        this.scheduleOnce(() => {
            this.twinkleStar.active = true;
            evt.emit("EGG.NewPet");
        }, _t / 2)
        cc.tween(t)
            .to(_t, { position: pte,opacity: 0 })
            .start()
        cc.tween(b)
            .to(_t, { position: pbe ,opacity: 0})
            .start()
    }

    public play() {
        this.eggWaggleAction();
    }

    public init() {
        this.initEgg()
    }

    test() {
        this.eggWaggleAction()
    }
}
