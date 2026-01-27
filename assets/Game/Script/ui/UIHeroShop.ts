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
        // 언어 변경 시 텍스트만 업데이트 (스파인 재로드 없음, Kapi 패턴 적용)
        const items = this.listLayout.node.getComponentsInChildren(heroItem);
        items.forEach(item => {
            if (item.data) {
                item.updateLabelsOnly();
            }
        });
    }

    onShow() {
        // 캐릭터 순서: 춘식(1) > 프로도(3) > 라이언(2) > 어피치(4) > 튜브(6) > 제이지(5) > 무지(7) > 네오(8)
        // HeroData.id는 string 타입이므로 문자열 배열로 비교
        const displayOrder = ["1", "3", "2", "4", "6", "5", "7", "8"];
        this.listData.sort((a, b) => displayOrder.indexOf(a.id) - displayOrder.indexOf(b.id));
        this.render();
    }


    click_close() {
        vm.hide(this);
    }

    /**
     * 특정 영웅의 선택 상태만 업데이트 (전체 리스트 재렌더링 없이)
     */
    updateSelectionOnly(heroId: string, selected: boolean) {
        const items = this.listLayout.node.getComponentsInChildren(heroItem);
        for (const item of items) {
            if (item.data && item.data.id == heroId) {
                item.setSelected(selected);
                break;
            }
        }
    }
}
