import BuffSystem from "../../../../framework/extension/buffs/BuffSystem";
import gUtil from "../../../../framework/core/gUtil";
import FizzBody, { FizzBodyType } from "../../../../framework/fizzx/components/FizzBody";
import Fizz from "../../../../framework/fizzx/fizz";
import ccUtil from "../../../../framework/utils/ccUtil";
import SkeletonComponent from "../../Controller/SkeletonComponent";
import { pdata } from "../../data/PlayerInfo";
import Follow from "../behaviors/Follow"
import { root } from "../Game";
import { BuffData } from "../model/ItemData";
import PetData from "../model/PetData";

let { ccclass, property } = cc._decorator
@ccclass
export default class Pet extends cc.Component {

    follower: Follow;

    id: string = "1"

    data: PetData = null;

    skeleton: SkeletonComponent = null;
    buffSystem: BuffSystem = null;

    body: FizzBody = null;

    onLoad() {
        this.follower = this.addComponent(Follow);

        this.follower.offset = cc.v2(-100, 100);

        this.skeleton = gUtil.getOrAddComponent(this, SkeletonComponent)
        this.buffSystem = gUtil.getOrAddComponent(this, BuffSystem)
        this.body = gUtil.getOrAddComponent(this, FizzBody);
        this.body.isTrigger = true;
        this.node.group = 'player'
        //默认关闭碰撞
        //磁铁开启时开启
        this.body.enabled = false;
    }

    set(id) {
        this.id = id;
        this.data = ccUtil.get(PetData, this.id);
        // set passiveSkill
        if (this.data.passiveSkill) {
            this.buffSystem.startBuff(this.data.passiveSkill.name, 99999999)
        }
        this.unschedule(this.doSkill)
        this.schedule(this.doSkill, this.data.lvs[pdata.selPetLevel - 1].data)

        // this.doSkill();
    }

    start() {
        this.run();
        this.schedule(this.onUpdate, 0.03)
    }

    doSkill() {
        this.buffSystem.startBuff(this.data.skill.name, Number(this.data.skill.param))
    }

    onUpdate() {
        this.body.syncPosition();
    }

    update(dt) {
        this.checkCol(dt)
    }

    checkCol(dt) {
        //手动检测碰撞
        if (this.body.enabled == false) return;
        let items = Fizz.retrieve(this.body.rect, FizzBodyType.Kinematic)
        for (let i = 0; i < items.length; i++) {
            let v = items[i]
            if (v.enabled == false) continue;
            Fizz.collision(this.body, v, dt)
        }
    }

    collect() {

        //collect
        this.skeleton.play("collect", 0)
    }

    run() {
        this.skeleton.play("run", 0);
    }


}