import Device from "../../../framework/core/Device";
import Platform from "../../../framework/extension/Platform";
import Switcher from "../../../framework/ui/controller/Switcher";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccCache from "../../../framework/utils/ccCache";
import ccUtil from "../../../framework/utils/ccUtil";
import { pdata } from "../data/PlayerInfo";
import HeroData from "../game/model/HeroData";
import heroItem from "./heroItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIHeroShop extends mvcView {

    @property(cc.Node)
    btn_close: cc.Node = null;

    @property(cc.Layout)
    listLayout: cc.Layout = null;

    private listData: Array<HeroData> = [];


    onLoad() {
        // 리스트 데이터 초기화 후 채우기
        this.listData = [];
        csv.HeroInfo.values.map((v, idx) => {
            this.listData.push(ccUtil.get(HeroData, idx + 1));
        })
        this.register(this.listLayout, () => this.listData, this.initList.bind(this));
        this.onClick(this.btn_close, this.click_close);
    }

    initList(node: cc.Node, data: HeroData, idx: number) {
        let item = node.getComponent(heroItem)
        item.set(data, this);
    }

    start() {

    }

    onShow() {
        // this.listData.sort(v=>v.)
        this.render();
    }


    click_close() {
         
        vm.hide(this);
    }
}
