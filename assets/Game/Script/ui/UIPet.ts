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

    onEnable() {
        super.onEnable();
        // 언어 변경 이벤트 리스너 등록
        cc.director.on('localization:languageChanged', this.onLanguageChanged, this);
    }

    onDisable() {
        super.onDisable();
        // 언어 변경 이벤트 리스너 해제
        cc.director.off('localization:languageChanged', this.onLanguageChanged, this);
    }

    private onLanguageChanged() {
        // 언어 변경 시 텍스트만 업데이트 (이미지 재로드 없음, Kapi 패턴 적용)
        const items = this.petList.node.getComponentsInChildren(petItem);
        items.forEach(item => {
            if (item.data) {
                item.updateLabelsOnly();
            }
        });
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


    /**
     * 특정 펫의 선택 상태만 업데이트 (전체 리스트 재렌더링 없이)
     */
    updateSelectionOnly(petId: string, selected: boolean) {
        const items = this.petList.node.getComponentsInChildren(petItem);
        for (const item of items) {
            if (item.data && item.data.id == petId) {
                item.setSelected(selected);
                break;
            }
        }
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
