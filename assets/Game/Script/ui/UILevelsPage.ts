import mvcView from "../../../framework/ui/mvcView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILevelsItem extends mvcView {

    @property(cc.Layout)
    itemLayout: cc.Layout = null;

    private levelData: Array<number> = null;

    onLoad() {
        this.register(this.itemLayout, _ => { return _ });
    }
}
