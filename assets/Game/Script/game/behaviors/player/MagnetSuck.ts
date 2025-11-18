import FxHelpher from "../../../../../framework/extension/fxplayer/FxHelpher";
import FizzBody, { FizzBodyType } from "../../../../../framework/fizzx/components/FizzBody";
import { root } from "../../Game";
import Pet from "../../objects/Pet";

let { ccclass, property } = cc._decorator
@ccclass
export default class MagnetSuck extends cc.Component {

    body: FizzBody = null;

    flyingBodies: FizzBody[] = []

    onLoad() {
        this.body = this.getComponent(FizzBody);
        this.pet = this.getComponent(Pet)
    }

    start() {
        this.schedule(this.tagUpdate);
    }

    duration: number = 2;
    itemIndex: number = 0

    pet: Pet;

    onEnable() {
        this.itemIndex = root.itemLayer.startIndex;
        if (this.pet) {
            this.pet.follower.target = null;
            this.pet.follower.offset = cc.visibleRect.center;
            this.pet.collect();
            this.pet.body.enabled = true;
        }
        FxHelpher.play("screen", "tip_cl", cc.v2(-cc.winSize.width * 0.25, 0))
        this.tagUpdate(0, true)
    }

    onDisable() {
        if (this.pet) {
            this.pet.run();
            this.pet.follower.reset();
            this.pet.body.enabled = false;
        }
        for (let i = 0; i < this.flyingBodies.length; i++) {
            let body = this.flyingBodies[i];
            if (body.isValid) {
                body.stop(0.7);
            } else {
                this.flyingBodies.splice(i--, 1)
            }
        }
    }

    doTag(bfind) {
        let node = root.itemLayer.get(this.itemIndex)
        if (node) {
            if (node.isValid) {
                let body = node.getComponent(FizzBody);
                body.bodyType = (FizzBodyType.Kinematic)
                this.flyingBodies.push(body)
                this.itemIndex++;
                return true;
            } else {
                if (bfind) {
                    this.itemIndex++;
                }
            }
        } else {
            if (bfind) {
                this.itemIndex++;
            }
        }
    }


    mark(b) {
        let ok = false;
        let c = 10
        do {
            ok = this.doTag(b);
            if (ok) break;
            c--;
            if (c <= 0) {
                return;
            }
        } while (true)
    }

    tagUpdate(dt, b) {
        this.mark(b);
        this.mark(b);
        this.mark(b);
    }

    update() {
        // get item nearby 
        let pos = this.node.getPosition();
        for (let i = 0; i < this.flyingBodies.length; i++) {
            let body = this.flyingBodies[i]
            if (body.isValid) {
                let f = body.seek(pos, 1660)
                body.applyForce(f);
            } else {
                this.flyingBodies.splice(i--, 1)
            }
        }
    }


}