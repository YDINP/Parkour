import { evt } from "../../../framework/core/event";
import GuiderLayer from "../../../framework/extension/guide/GuiderLayer";
import FizzManager from "../../../framework/fizzx/components/FizzManager";
import ccUtil from "../../../framework/utils/ccUtil";
import LoadingScene from "../common/LoadingScene";
import { ParkourType, pdata } from "../data/PlayerInfo";
import UIEndPage from "../ui/UIEndPage";
import { root } from "./Game";
import { ResType } from "./model/BaseData";
import LevelData from "./model/LevelData";

let guiderLayer: GuiderLayer;

enum GuideStep {
    pet = 20,
    item = 30,
    hero = 40
}

export default class Guide {


    isInGuide = false;

    async init() {
        vm.show("common/UIGuider")
        let [view, ret] = await evt.wait("UIGuider.onShown")
        guiderLayer = view.getComponent(GuiderLayer);
    }

    async enterHome() {
        let guideNoob = pdata.guides['noob']
        if (!guideNoob) {
            this.guide_noob();
        }
    }

    pause() {
        root.player.buffSystem.pause();
        FizzManager.instance.enabled = false;
    }

    resume() {
        root.player.buffSystem.resume();
        FizzManager.instance.enabled = true;
    }

    async guide_op() {
        this.isInGuide = true;
        await evt.wait('NoobLevel.next')
        await this.init()
        this.pause()
        guiderLayer.showMessageEx({
            content: "点击右边的按钮进行跳跃！",
        })
        await guiderLayer.waitClickEx("Canvas/uilayer/operation/jump_btn/New Node")
        this.resume()
        root.player.controller.jump();
        await evt.wait('NoobLevel.next')
        //---------------------------[]-----------------------------
        guiderLayer.showMessageEx({
            content: "--------起跳--------",
        })
        this.pause()
        await guiderLayer.waitClickEx("Canvas/uilayer/operation/jump_btn/New Node")
        root.player.controller.jump();
        this.resume()
        await evt.sleepSafe(guiderLayer, 0.18)
        this.pause()
        guiderLayer.showMessageEx({
            content: "再次点击进行二段跳",
        })
        await guiderLayer.waitClickEx("Canvas/uilayer/operation/jump_btn/New Node")
        this.resume()
        root.player.controller.jump();

        await evt.wait('NoobLevel.next')
        //---------------------------[]-----------------------------
        this.pause()
        guiderLayer.showMessageEx({
            content: "点击左侧按钮进行滑动！",
        })
        await guiderLayer.waitClickEx("Canvas/uilayer/operation/slide_btn/New Node")
        this.resume()
        root.player.slide();
        //---------------------------[]-----------------------------
        await evt.wait('NoobLevel.next')
        root.player.endSlide();

        //---------------------------[]-----------------------------
        await evt.wait('NoobLevel.next')
        guiderLayer.showMessageEx({
            content: "障碍，小心！！！",
        })
        await evt.sleepSafe(guiderLayer, 1)
        guiderLayer.showMessageEx({
            content: "啊！",
        })
        //---------------------------[]-----------------------------
        await evt.wait('NoobLevel.next')
        guiderLayer.hideAll();
        guiderLayer.showMessageEx({
            content: "没关系，有红心恢复体力！",
        })
        this.pause()
        await guiderLayer.waitAnyKey();
        this.resume();
        vm.hide(guiderLayer);
        this.isInGuide = false;
    }

    async guide_noob() {
        this.isInGuide = true
        await this.init()
        let ret = await guiderLayer.showMessageEx({
            content: "第一次进游戏？是否进行操作向导?",
            confirmText: "好的 ",
            cancelText: "不用"
        })
        if (ret == 1) {
            pdata.playinglv = 0;
            LoadingScene.goto("Main")
        } else {
            vm.hide(guiderLayer);
        }
        pdata.guides['noob'] = 1;
        pdata.save('guides')
        this.isInGuide = false;
    }

    finishLevel() {
        let lvdata = ccUtil.get(LevelData, pdata.playinglv)
        switch (lvdata.guide) {
            case 'pet':
                //1 引导宠物 
                this.guide_pet();
                break;
            case 'item':
                //2 引导无尽关卡
                this.guide_infinite();
                break;
            case 'hero':
                //3 引导英雄选择
                this.guide_hero();
                break;
        }

    }

    async guide_pet() {
        //引导过了
        if (pdata.guides['pet']) return;
        // 恭喜你获得一支宠物抽奖卷
        // 快去试试孵化宠物吧
        let node = UIEndPage.instance.findLootItem(ResType.Prop, 4)
        if (node == null) return;
        this.isInGuide = true;
        await this.init();
        guiderLayer.showFocus(node)
        guiderLayer.hideFinger();
        guiderLayer.showMessageEx({
            content: "恭喜你获得一个宠物孵化卷,快去试试孵化宠物吧!",
            y: 100,
        })
        await guiderLayer.waitAnyKey(node);
        await guiderLayer.hideAll();
        guiderLayer.showMessageEx({
            content: "点击关闭返回主界面",
        })
        await guiderLayer.waitClickUI("UIEndPage/k/title/btn_close")
        //退到主界面后重新加载
        await evt.wait("Home.start")
        await this.init();
        // 点击宠物按钮
        await guiderLayer.waitClickEx("Canvas/Btn/menu/btn_pet")
        await evt.wait("UIPet.onShown")
        // 点击宠物孵化
        await guiderLayer.waitClickUI("UIPet/k/New ScrollView/item/btn_add")
        await evt.wait("UIHatchPet.onShown")
        // 点击普通 孵化
        await guiderLayer.waitClickUI("UIHatchPet/k/New Layout/item_2/btn_hatch")
        // 孵化完后，强制引导装备 
        await evt.wait("UIPetDrawResult.onShown")
        guiderLayer.showMessageEx({ content: "获得新宠物，快去游戏里试试吧！", y: -100 })
        await guiderLayer.waitClickUI("UIPetDrawResult/k/btn_equip")
        vm.hide("common/UIGuider")
        this.isInGuide = false;
        pdata.guides['pet'] = 1
        pdata.save("guides")
    }

    async guide_infinite() {
        if (pdata.guides['item']) return;
        //恭喜获得新道具，快去无尽模式去体验吧
        //是否去挑战
        let node = UIEndPage.instance.findLootItem(ResType.Prop, 3)
        //未获得该道具 ？？
        if (node == null) return;
        this.isInGuide = true;
        await this.init();
        guiderLayer.showFocus(node)
        guiderLayer.hideFinger();
        let ret = await guiderLayer.showMessageEx({
            content: "恭喜获得新道具，快去无尽模式去体验吧",
            y: 100,
            confirmText: "好的",
            cancelText: "不去"
        })
        if (ret == 0) {
            // 0 :不去
            this.isInGuide = false;
            pdata.guides['item'] = 1
            vm.hide("common/UIGuider")
            return;
        }
        //1 : 好的
        // 直接打开准备界面 
        vm.show("UIReady")
        guiderLayer.hideFocus();
        await evt.wait("UIReady.onShown")
        guiderLayer.showMessageEx({ content: "点击使用刚才获得的[冲刺]道具", y: 100 })
        await guiderLayer.waitClickLayoutUI("UIReady/ui_buy_props/New ScrollView/view/lay_props_content", 3, "New Node/btn_use")
        guiderLayer.hideMessage();
        await guiderLayer.waitClickUI("UIReady/button_play_03_ch")
        vm.hide("common/UIGuider")
        this.isInGuide = false;
        pdata.guides['item'] = 1
        pdata.save("guides")
    }

    async guide_hero() {
        if (pdata.guides['hero']) return;
        let node = UIEndPage.instance.findLootItem(ResType.Hero, 2)
        //未获得该道具 ？？
        if (node == null) return;
        this.isInGuide = true;
        await this.init();
        guiderLayer.showFocus(node)
        guiderLayer.hideFinger();
        let ret = await guiderLayer.showMessageEx({
            content: "恭喜获得新英雄,是否去切换",
            y: 100,
            confirmText: "切换",
            cancelText: "不需要"
        })
        if (ret == 0) {
            // 0 :不需要 取消：关闭引导
            vm.hide("common/UIGuider")
            this.isInGuide = false;
            pdata.guides['hero'] = 1
            return;
        }
        //1 : 切换
        //确定 ：跳转到主界面   
        guiderLayer.showMessageEx({
            content: "点击关闭返回主界面",
        })
        await guiderLayer.waitClickUI("UIEndPage/k/title/btn_close")
        //退到主界面后重新加载
        await evt.wait("Home.start")
        await this.init();
        //点击 角色  
        // 点击宠物按钮
        await guiderLayer.waitClickEx("Canvas/Btn/menu/btn_role")
        await evt.wait("UIHeroShop.onShown")
        await guiderLayer.waitClickLayoutUI("UIHeroShop/k/New ScrollView/view/content", 2, "")
        vm.hide("common/UIGuider")
        //点击英雄按钮
        //选择刚加入的英雄
        this.isInGuide = false;
        pdata.guides['hero'] = 1
        pdata.save("guides")
    }
}

export let guider: Guide = new Guide();