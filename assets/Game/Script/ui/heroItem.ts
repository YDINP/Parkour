import Device from "../../../framework/core/Device";
import Fx from "../../../framework/extension/fxplayer/Fx";
import FxPlayer from "../../../framework/extension/fxplayer/FxPlayer";
import { EaseType } from "../../../framework/extension/qanim/EaseType";
import Switcher from "../../../framework/ui/controller/Switcher";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { LocalizationManager } from "../../../framework/Hi5/Localization/LocalizationManager";
import { pdata } from "../data/PlayerInfo";
import { ResType } from "../game/model/BaseData";
import HeroData from "../game/model/HeroData";
import LevelData from "../game/model/LevelData";
import UIHeroShop from "./UIHeroShop";
import { TextConfirmInfo } from "./UITextConfirm";
import { heroSpinePaths } from "../common/HeroSpinePaths";

let { ccclass, property } = cc._decorator

/**
 * 영웅별 스파인 스케일 설정
 * 기본값 1.0, 필요에 따라 각 영웅별 크기 조절
 */
const heroScales: { [heroId: string]: number } = {
    "1": 0.6,   // 춘식이
    "2": 0.5,   // 라이언
    "3": 0.6,   // 프로도
    "4": 0.6,   // 어피치
    "5": 0.55,   // 제이지
    "6": 0.45,  // 튜브 (크기가 커서 축소)
    "7": 0.55,   // 무지
    "8": 0.6,   // 네오
};

const starIconPath = {
    A: "Textures/kakao/06friends/ui_img_friends_tier_a",
    B: "Textures/kakao/06friends/ui_img_friends_tier_b",
    C: "Textures/kakao/06friends/ui_img_friends_tier_c",
    D: "Textures/kakao/06friends/ui_img_friends_tier_D"
}


@ccclass
export default class heroItem extends cc.Component {

    nameLab: cc.Label;
    lvLab: cc.Label
    starSp: cc.Sprite
    headIconSp: sp.Skeleton;
    hpLab: cc.Label
    skillDisLab: cc.Label
    switcher: Switcher;
    limitTag: cc.Node;

    @property(cc.Label)
    label_amount: cc.Label = null;

    @property(Switcher)
    buyResSwitch: Switcher = null;

    @property(cc.Node)
    lock_mask: cc.Node = null;

    @property(cc.Node)
    node_selectFlag: cc.Node[] = [];

    @property(FxPlayer)
    fxPlayer: FxPlayer = null;

    @property(cc.Label)
    upLabel: cc.Label = null;

    onLoad() {
        this.nameLab = ccUtil.find("nameLab", this.node, cc.Label);
        this.lvLab = ccUtil.find("heroLv", this.node, cc.Label);
        this.starSp = ccUtil.find("starLv", this.node, cc.Sprite);
        this.headIconSp = ccUtil.find("frame/sprite/headIcon", this.node, sp.Skeleton);
        this.hpLab = ccUtil.find("lab_k/hp", this.node, cc.Label);
        this.skillDisLab = ccUtil.find("lab_k/skillDes", this.node, cc.Label);
        this.switcher = ccUtil.find("switcher", this.node, Switcher);
        this.limitTag = this.node.getChildByName("limitTag");


    }

    data: HeroData;
    ui: UIHeroShop;

    set(data: HeroData, ui: UIHeroShop) {

        this.data = data;
        this.ui = ui;

        let lv = pdata.getHeroLevel(data.id)
        // 한정 영웅 표시 제거 (quality A 기준이 아닌 별도 관리 필요시 수정)
        let isLimit = false;

        // 모든 selectFlag 활성화/비활성화 및 애니메이션
        // 상태가 변경될 때만 애니메이션 재생 (깜빡임 방지)
        const wasSelected = this.node_selectFlag[0]?.active || false;
        const isSelected = data.id == pdata.selHero;

        this.node_selectFlag.forEach(flag => {
            flag.active = isSelected;
            // 선택 상태가 false → true로 변경될 때만 애니메이션 재생
            if (isSelected && !wasSelected) {
                flag.opacity = 0;
                flag.scale = 1.3;
                cc.tween(flag).to(0.2, { opacity: 255 }).start();
                cc.tween(flag).to(0.2, { scale: 1 }, { easing: EaseType[EaseType.backOut] }).start();
            } else if (isSelected) {
                // 이미 선택된 상태면 애니메이션 없이 바로 표시
                flag.opacity = 255;
                flag.scale = 1;
            }
        });

        let nextLv = data.lvs[lv]
        if (!nextLv) {
            // max level 
            this.switcher.index = 2;
        } else {
            this.switcher.index = lv == 0 ? 0 : 1;
        }

        // 언어 변경 시 실시간 반영을 위해 캐시된 data.name 대신 직접 로컬라이징 호출
        this.nameLab.string = LocalizationManager.getText(`@hero.${data.id}.name`);
        this.limitTag.active = isLimit;
        // 레벨 라벨: 보유 영웅만 표시 (잠금 상태면 숨김)
        if (this.lvLab && this.lvLab.node) {
            this.lvLab.node.active = lv > 0;
        }
        this.lvLab.string = "LV." + lv;
        this.hpLab.string = data.hp.toString();

        ccUtil.setDisplay(this.starSp, starIconPath[data.quality]);
        this.updateHeroSpine(data.id);
        //购买   所需要的资源数量
        this.label_amount.string = data.buyCost.num + "";
        //切换图标
        this.buyResSwitch.index = data.buyCost.type == ResType.Gold ? 1 : 0;
        this.lock_mask.active = lv <= 0;
        let lvdata = data.lvs[(lv - 1) == -1 ? 0 : (lv - 1)];
        this.upLabel.string = lvdata.up_cost.num + ""
        // 네오(ID 8)는 다중 스킬 전환 애니메이션 사용
        if (data.id === "8") {
            this.startNeoSkillAnimation(lvdata);
        } else {
            this.stopNeoSkillAnimation();
            const lvDesc = LocalizationManager.getText(`@hero.${data.id}.desc`);
            this.skillDisLab.string = cc.js.formatStr(lvDesc, lvdata.data);
        }
        // if (lvdata) {
        //     this.skillDisLab.fontSize = 23;
        //     this.skillDisLab.lineHeight = 18;
        //     this.skillDisLab.node.y = -8;
        //     this.upLabel.string = lvdata.up_cost.num + ""
        //     this.skillDisLab.string = cc.js.formatStr(data.lvDesc, lvdata.data)
        // } else {
        //     this.skillDisLab.fontSize = 15;
        //     this.skillDisLab.lineHeight = 15;
        //     this.skillDisLab.node.y = -20;
        //     this.skillDisLab.string = data.desc;
        // }
    }

    clickSelect(e) {
         
        let lv = pdata.getHeroLevel(this.data.id)
        if (lv <= 0) {
            Toast.make(LocalizationManager.getText("@text.cannot_select_unlocked_hero"));
            // Toast.make("无法选择未解锁的英雄！")
            return
        }
        
        // 이미 선택된 영웅이면 아무것도 하지 않음
        if (this.data.id == pdata.selHero) {
            return;
        }
        
        // 이전 선택 영웅의 selectFlag 비활성화
        this.ui.updateSelectionOnly(pdata.selHero, false);
        
        // 새 영웅 선택
        pdata.selectHero(this.data.id);
        
        // 현재 아이템의 selectFlag 활성화 (애니메이션 포함)
        this.setSelected(true);
    }

    /**
     * 선택 상태 업데이트 (스파인 재로딩 없이 selectFlag만 변경)
     */
    setSelected(selected: boolean) {
        this.node_selectFlag.forEach(flag => {
            flag.active = selected;
            if (selected) {
                // 播放选择动画
                flag.opacity = 0;
                flag.scale = 1.3;
                cc.tween(flag).to(0.2, { opacity: 255 }).start();
                cc.tween(flag).to(0.2, { scale: 1 }, { easing: EaseType[EaseType.backOut] }).start();
            }
        });
    }

    up_hero(e) {

        let lv = pdata.getHeroLevel(this.data.id)
        let lvdata = this.data.lvs[lv - 1]
        if (this.data.lvs[lv] == null) {
            // max reached
            Toast.make(LocalizationManager.getText("@text.max_level_reached"));
            // Toast.make('已到最高级！')
            this.switcher.index = 2
            return;
        }

        // 다이아 소모 시 확인 팝업
        if (lvdata.up_cost.type == ResType.Diamond) {
            vm.show("UITextConfirm", {
                title: LocalizationManager.getText("@text.confirm"),
                content: LocalizationManager.getText("@currency.dia") + " " + lvdata.up_cost.num + LocalizationManager.getText("@text.confirm_use"),
                confirmTxt: LocalizationManager.getText("@text.confirm"),
                isShowCancel: true,
                cancelIsDaley: false,
                confirmCall: () => {
                    this.executeUpHero(lvdata);
                },
                cancelCall: () => {}
            } as TextConfirmInfo);
            return;
        }

        this.executeUpHero(lvdata);
    }

    private executeUpHero(lvdata) {
        let canBuy = pdata.addRes(lvdata.up_cost, -1);
        if (canBuy) {
            let r = pdata.upHero(this.data.id);
            this.fxPlayer.play();
            cc.tween(this.lvLab.node).to(0.1, { scale: 1.5 }).to(0.1, { scale: 1 }).start()
        } else {
            let type = lvdata.up_cost.type == ResType.Gold ? LocalizationManager.getText("@currency.silver") : LocalizationManager.getText("@currency.dia");
            // let type = lvdata.up_cost.type == ResType.Gold ? "银币" : "钻石";
            Toast.make(type + LocalizationManager.getText("@text.not_enough_resource") + "！");
            // Toast.make(type + "不足！");
        }
        this.refresh();
    }

    //upLabel
    buy_hero(e) {

        // 다이아 소모 시 확인 팝업
        if (this.data.buyCost.type == ResType.Diamond) {
            vm.show("UITextConfirm", {
                title: LocalizationManager.getText("@text.confirm"),
                content: LocalizationManager.getText("@currency.dia") + " " + this.data.buyCost.num + LocalizationManager.getText("@text.confirm_use"),
                confirmTxt: LocalizationManager.getText("@text.confirm"),
                isShowCancel: true,
                cancelIsDaley: false,
                confirmCall: () => {
                    this.executeBuyHero();
                },
                cancelCall: () => {}
            } as TextConfirmInfo);
            return;
        }

        this.executeBuyHero();
    }

    private executeBuyHero() {
        let canbuy = pdata.addRes(this.data.buyCost, -1);
        if (canbuy) {
            pdata.upHero(this.data.id);
        } else {
            let type = this.data.buyCost.type == ResType.Gold ? LocalizationManager.getText("@currency.silver") : LocalizationManager.getText("@currency.dia");
            // let type = this.data.buyCost.type == ResType.Gold ? "银币" : "钻石";
            Toast.make(type + LocalizationManager.getText("@text.not_enough_resource") + "！");
        }
        this.refresh();
    }

    refresh() {
        this.set(this.data, this.ui)
    }

    // 네오 스킬 애니메이션 상태
    private neoSkillIndex: number = 0;
    private isNeoSkillAnimating: boolean = false;

    /**
     * 언어 변경 시 텍스트만 업데이트 (스파인 재로드 없음)
     * Kapi 프로젝트의 _refreshLocalizedTexts 패턴 적용
     */
    updateLabelsOnly() {
        if (!this.data) return;

        // 이름 라벨
        this.nameLab.string = LocalizationManager.getText(`@hero.${this.data.id}.name`);

        // 스킬 설명 라벨
        const lv = pdata.getHeroLevel(this.data.id);
        const lvdata = this.data.lvs[(lv - 1) == -1 ? 0 : (lv - 1)];

        // 네오(ID 8)는 다중 스킬 전환 애니메이션 사용
        if (this.data.id === "8") {
            this.startNeoSkillAnimation(lvdata);
        } else {
            this.stopNeoSkillAnimation();
            const lvDesc = LocalizationManager.getText(`@hero.${this.data.id}.desc`);
            this.skillDisLab.string = cc.js.formatStr(lvDesc, lvdata.data);
        }
    }

    /**
     * 네오 스킬 설명 전환 애니메이션 시작
     * 3초 주기로 skill1, skill2, skill3 순환
     */
    private startNeoSkillAnimation(lvdata: any) {
        if (this.isNeoSkillAnimating) return;
        this.isNeoSkillAnimating = true;
        this.neoSkillIndex = 0;

        // 초기 스킬 표시
        this.showNeoSkill(lvdata);

        // 3초 주기 전환 스케줄
        this.schedule(this.neoSkillCycle.bind(this, lvdata), 3);
    }

    /**
     * 네오 스킬 전환 사이클
     */
    private neoSkillCycle(lvdata: any) {
        this.neoSkillIndex = (this.neoSkillIndex + 1) % 2;

        // 페이드 아웃 -> 텍스트 변경 -> 페이드 인
        cc.tween(this.skillDisLab.node)
            .to(0.2, { opacity: 0 })
            .call(() => {
                this.showNeoSkill(lvdata);
            })
            .to(0.2, { opacity: 255 })
            .start();
    }

    /**
     * 현재 인덱스에 해당하는 네오 스킬 표시
     */
    private showNeoSkill(lvdata: any) {
        const skillKeys = ["skill1", "skill2"];
        const key = `@hero.8.${skillKeys[this.neoSkillIndex]}`;
        const skillDesc = LocalizationManager.getText(key);
        // %d가 있는 경우에만 formatStr 적용
        if (skillDesc.includes('%d')) {
            this.skillDisLab.string = cc.js.formatStr(skillDesc, lvdata.data);
        } else {
            this.skillDisLab.string = skillDesc;
        }
    }

    /**
     * 네오 스킬 애니메이션 중지
     */
    private stopNeoSkillAnimation() {
        if (!this.isNeoSkillAnimating) return;
        this.isNeoSkillAnimating = false;
        this.unscheduleAllCallbacks();
        cc.Tween.stopAllByTarget(this.skillDisLab.node);
        this.skillDisLab.node.opacity = 255;
    }

    onDisable() {
        this.stopNeoSkillAnimation();
    }

    /**
     * 영웅 ID에 맞는 스파인 데이터 로드 및 적용
     */
    private currentHeroId: string = null;

    /**
     * 영웅 ID에 맞는 스파인 데이터 로드 및 적용
     * 캐릭터 전환 시 깜빡임 방지를 위해 로딩 중 숨김 처리
     */
    private updateHeroSpine(heroId: string) {
        // 동일 캐릭터면 재로딩 스킵
        if (this.currentHeroId === heroId) return;
        this.currentHeroId = heroId;

        const spinePath = heroSpinePaths[heroId];

        if (!spinePath) {
            console.warn(`Hero spine path not found for hero ID: ${heroId}`);
            return;
        }

        // 로딩 전 숨기기 (깜빡임 방지)
        if (this.headIconSp && this.headIconSp.node) {
            this.headIconSp.node.opacity = 0;
        }

        cc.loader.loadRes(spinePath, sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
            if (err) {
                console.error(`Failed to load hero spine: ${spinePath}`, err);
                // 에러 시에도 표시 복구
                if (this.headIconSp && this.headIconSp.node) {
                    this.headIconSp.node.opacity = 255;
                }
                return;
            }

            if (this.headIconSp && skeletonData) {
                this.headIconSp.skeletonData = skeletonData;
                this.headIconSp.setAnimation(0, "Idle", true);

                // 영웅별 스케일 적용
                const scale = heroScales[heroId] || 1.0;
                this.headIconSp.node.scale = scale;

                // 로딩 완료 후 페이드 인
                cc.tween(this.headIconSp.node).to(0.15, { opacity: 255 }).start();
            }
        });
    }

}