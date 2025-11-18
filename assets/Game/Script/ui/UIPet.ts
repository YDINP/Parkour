import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import mvcView from "../../../framework/ui/mvcView";
import ccUtil from "../../../framework/utils/ccUtil";
import { pdata } from "../data/PlayerInfo";
import PetData from "../game/model/PetData";
import eggItem from "./eggItem";
import petItem from "./petItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPet extends mvcView {

    @property(cc.Node)
    btn_close: cc.Node = null;

    @property(cc.Node)
    btn_petBook: cc.Node = null;

    @property(cc.Layout)
    petList: cc.Layout = null;

    @property(cc.Node)
    btn_hatchPet: cc.Node = null;

    @property(eggItem)
    eggAction: eggItem = null;

    @property(cc.Node)
    node_no_pet: cc.Node = null;

    private petDatas: Array<PetData> = [];

    onLoad() {
        this.onClick(this.btn_close, this.click_close);
        this.onClick(this.btn_petBook, this.click_petBook);
        this.onClick(this.btn_hatchPet, this.click_hatchPet);
        this.register(this.petList, () => this.petDatas, this.initItem.bind(this));

        this.onVisible(this.node_no_pet, () => this.petDatas.length <= 0)

        evt.on("UIPet.refresh", this.refresh, this)
    }

    onDestroy() {
        evt.off(this)
    }

    onShow() {
        //仅显示 已拥有的宠物 
        this.refresh()
    }

    refresh() {
        this.petDatas = csv.PetInfo.values.map((v, idx) => {
            return ccUtil.get(PetData, v.id);
        }).filter(v => pdata.hasPet(v.id))

        this.render()
    }

    initItem(node: cc.Node, data: PetData, idx: number) {
        let itm = node.getComponent(petItem)
        itm.set(data, this);
    }


    click_close() {

        vm.hide(this);
    }

    click_petBook() {

    }

    click_hatchPet() {
        vm.hide(this);
        vm.show('UIHatchPet')
    }

}
