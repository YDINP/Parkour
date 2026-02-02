import { evt } from "../../../framework/core/event";
import gUtil from "../../../framework/core/gUtil";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { pdata } from "../data/PlayerInfo";
import eggAction from "../game/effects/eggAction";
import PetData from "../game/model/PetData";
import { ImgConfirmData } from "./UIImgComfirm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class eggItem extends cc.Component {

    @property(cc.Node)
    pet: cc.Node = null;

    @property(eggAction)
    eggAct: eggAction = null;

    @property(cc.Label)
    lab_count: cc.Label = null;

    private selectPetData: PetData = null;

    private pageData: { [id: number]: PetData } = {};

    private isSelect: boolean = false;

    private oddsArr1: Array<number> = [];

    private oddsArr2: Array<number> = [];

    onLoad() {
        csv.PetInfo.values.map((v, idx) => {
            // v.id를 사용하여 올바른 PetData 가져오기 (idx + 1 사용 시 ID 순서가 바뀌면 버그 발생)
            this.pageData[v.id] = ccUtil.get(PetData, v.id);
            for (let i = 0; i < v.get_probability; ++i) {
                this["oddsArr" + v.get_condition].push(v.id);
            }
        })
        evt.on("EGG.NewPet", this.onEggOpen, this);
    }

    start() {

    }

    getRandom(idx) {
        let arr = this["oddsArr" + idx];
        let _idx: number = gUtil.getRandom(arr) || 0;
        console.log("획득한 펫 ID: " + _idx);
        return _idx;
    }

    openEggUpDateData(idx) {
        let _id = this.getRandom(idx);
        let _d = this.pageData[_id];
        this.pet.active = true;
        this.selectPetData = _d;
        ccUtil.setDisplay(this.pet.getComponent(cc.Sprite), this.selectPetData.avatar, () => {
            this.pet.active = false;
        });
        pdata.upPet(this.selectPetData.id);
        this.eggAct.play();
    }

    initEggPage() {
        this.eggAct.init();
        this.pet.active = false;
        this.pet.scale = 0.3;
        this.pet.stopAllActions();
        this.pet.setPosition(this.eggAct.node.getPosition());
        this.isSelect = false;
        // 광고 횟수 표시 업데이트
        this.updateAdCountDisplay();
    }

    /**
     * 고급알 광고 횟수 표시 업데이트
     * lab_count가 존재하면 "남은횟수/1" 형식으로 표시
     */
    updateAdCountDisplay() {
        if (this.lab_count) {
            pdata.checkDailyPetHatchReset();
            const remaining = Math.max(0, pdata.freePetHatchCount);
            this.lab_count.string = `${remaining}/1`;
        }
    }

    onEggOpen() {
        if (!this.isSelect) return;
        let pet = this.node.getChildByName("pet");
        this.buildPetAction(pet)
    }

    buildPetAction(pet: cc.Node) {
        pet.active = true;
        pet.scale = 0.3;
        let posY1 = this.pet.y;
        let posY2 = posY1 + 30;
        let flyAct = cc.tween()
            .to(1, { y: posY2 }, { easing: "quartOut" })
            .to(1, { y: posY1 }, { easing: "quartOut" })
        cc.tween(pet)
            .to(0.5, { scale: 2 })
            .call(() => {
                // 언어 변경 시 실시간 반영을 위해 캐시된 selectPetData.name 대신 직접 로컬라이징 호출
                const petName = LocalizationManager.getText(`@pet.${this.selectPetData.id}.name`);
                let confirmData: ImgConfirmData = {
                    title: LocalizationManager.getText("@text.congratulations"),
                    // title: "恭喜获得",
                    iconPath: this.selectPetData.avatar,
                    content: LocalizationManager.getText("@PetDrawResult.content"),
                    // content: "获得新宠物"" + this.selectPetData.name + """,
                    isShowCancel: true,
                    cancelIsDaley: false,
                    confirmCall: () => {
                        this.initEggPage();
                        //立即选择
                        pdata.selectPet(this.selectPetData.id)
                        evt.emit("UIPet.refresh")
                    },
                    cancelCall: () => {
                        this.initEggPage();
                        evt.emit("UIPet.refresh")
                    }
                }
                this.scheduleOnce(() => {
                    vm.show("UIPetDrawResult", confirmData);
                }, 0.3);
            })
            .repeatForever(flyAct)
            .start()
    }

    openEggCall(idx) {

        this.isSelect = true;
        this.openEggUpDateData(idx);
    }

}
