// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import TransitionFade from "./TransitionFade";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Test extends cc.Component {

    t1: TransitionFade[] = null;

    start() {
        this.t1 = this.getComponentsInChildren(TransitionFade)
    }

    click_change() {
        cc.loader.loadRes("map/forest/bg_forest_bg_01", cc.SpriteFrame, (err, res) => {
            this.t1.forEach(v => v.play(res))
        })
    }

    click_change2() {
        cc.loader.loadRes("map/cave/bg_cave", cc.SpriteFrame, (err, res) => {
            this.t1.forEach(v => v.play(res))
        })
    }


}
