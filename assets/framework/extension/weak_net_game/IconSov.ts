import Switcher from "../../ui/controller/Switcher";
import WeakNetGame from "./WeakNetGame";
import mvcView from "../../ui/mvcView";

let { ccclass, property } = cc._decorator
@ccclass
export default class IconSov extends mvcView {
    icon: Switcher = null

    @property
    sovName: string = ""
    onLoad() {
        this.icon = this.getComponent(Switcher);
        this.register(this.icon, () => WeakNetGame.getChoice(this.sovName))
        // this.onVisible(this.icon.node, () => wegame.getStatus(CloudFuncType.ShareVideoIcon) == 0)
    }

}