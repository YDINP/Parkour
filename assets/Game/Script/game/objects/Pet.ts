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
    dragon: dragonBones.ArmatureDisplay = null;
    buffSystem: BuffSystem = null;

    body: FizzBody = null;

    onLoad() {
        this.follower = this.addComponent(Follow);

        this.follower.offset = cc.v2(-100, 100);

        this.skeleton = gUtil.getOrAddComponent(this, SkeletonComponent)
        // 펫 프리팹은 spine이 아니라 dragonBones를 사용한다.
        // SkeletonComponent.play()는 spine 전용이라 dragonBones 펫에서는 no-op이 되므로
        // dragonBones 컴포넌트가 있으면 그쪽으로 직접 재생한다.
        if (typeof dragonBones !== 'undefined') {
            this.dragon = this.getComponent(dragonBones.ArmatureDisplay);
        }
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
        if (this.dragon) {
            this.dragon.playAnimation("collect", 0); // 0 = 무한 루프
            return;
        }
        this.skeleton.play("collect", 0)
    }

    run() {
        if (this.dragon) {
            this.dragon.playAnimation("run", 0); // 0 = 무한 루프
            return;
        }
        this.skeleton.play("run", 0);
    }


}