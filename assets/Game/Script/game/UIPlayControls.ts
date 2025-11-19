import Device from "../../../framework/core/Device";
import { evt } from "../../../framework/core/event";
import gUtil from "../../../framework/core/gUtil";
import { Input, InputSystem } from "../../../framework/extension/input/InputSystem";
import PlayController from "../../../framework/extension/input/PlayController";
import PlayerController from "../../../framework/fizzx/components/Common/PlayerController";
import ccUtil from "../../../framework/utils/ccUtil";
import { pdata } from "../data/PlayerInfo";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPlayControls extends cc.Component {

    @property(PlayController)
    jumpController: PlayController = null;

    // @property(cc.Sprite)
    // jumpSp: cc.Sprite = null;

    @property(PlayController)
    slideContrller: PlayController = null;

    // @property(cc.Sprite)
    // slideSp: cc.Sprite = null;


    @property(PlayerController)
    playerController: PlayerController = null;
    player: Player = null;


    //------------------------------------------------
    @property(PlayController)
    fireController: PlayController = null;

    // @property(cc.Sprite)
    // fireSp: cc.Sprite = null;


    // @property(cc.SpriteFrame)
    // fireState: cc.SpriteFrame = null;

    // @property(cc.SpriteFrame)
    // fireEndState: cc.SpriteFrame = null;

    atAnim: cc.Animation = null;

    onLoad() {
        this.player = this.playerController.getComponent(Player);

        this.jumpController.pressSignal.on(this.jump, this);
        this.jumpController.holdingSigal.on(this.playerController.holdJump, this.playerController);
        this.jumpController.releaseSignal.on(this.jumpEnd, this);


        this.slideContrller.pressSignal.on(this.slide, this);
        this.slideContrller.holdingSigal.on(this.slide, this);
        this.slideContrller.releaseSignal.on(this.endSlide, this);


        this.fireController.pressSignal.on(this.fire, this);
        this.fireController.releaseSignal.on(this.fireEnd, this);

        this.atAnim = this.fireController.getComponent(cc.Animation);

        //使用技能

        // this.moveController.holdingSigal.on(this.move, this);
        // this.moveController.pressSignal.on(this.pressControl, this);
        // this.moveController.releaseSignal.on(this.releaseMove, this)

        evt.on("Player.enter_Ready", this.onSkillCdCompleted, this);
        evt.on("Player.setControllerEnable", this.setControllerEnable, this);

        // this.fireSp.spriteFrame = this.fireEndState;
        let inputSystem = gUtil.getOrAddComponent(this, InputSystem);
        if (inputSystem) {
            inputSystem.enabled = true;
        }
        //先隐藏技能 图标
        this.fireController.node.active = false;

    }

    setControllerEnable(type?, b?) {
        this[type + "Controller"].node.active = b;
    }

    onDestroy() {
        evt.off(this);
    }

    onKeyUp(e) {
        console.log(e['key'])
        if (e['key'] == 's')
            this.player.endSlide();
    }

    onKeyDown(e) {
        if (e['key'] == 's') {
            this.player.slide();
        }
        if (e['key'] == 'w')
            this.playerController.jump();
    }

    fire() {
        // let p = this.playerNode.getComponent(Player);
        // p.throw();
        let b = this.player.useSkill();
        if (b) {
            ccUtil.playAnim(this.atAnim, "ui_skill_press").then(v => {
                this.fireController.node.active = false;
            })
        }
        // play fx 
        // this.fireSp.spriteFrame = this.fireState;
    }


    onSkillCdCompleted() {
        this.fireController.node.active = true;
        ccUtil.playAnim(this.atAnim, "ui_skill_ok")
    }


    fireEnd() {
        // this.fireSp.spriteFrame = this.fireEndState;
    }

    pressControl(p: cc.Vec2) {
        let dir = Math.sign(p.x)
        if (dir == 0) {
            dir = 1
        }
        // this.padSprite.spriteFrame = dir > 0 ? (this.rightState) : (this.leftState);
        dir < 0 ? this.slide() : this.jump()
    }

    slide() {
        this.player.slide();
        this.slideContrller.node.opacity = 255
    }

    endSlide() {
        this.player.endSlide();
        this.slideContrller.node.opacity = 120
    }

    _jumped: boolean = false;

    releaseMove() {
        this.player.endSlide();
        this._jumped = false;
        // this.padSprite.spriteFrame = this.normalState;
    }

    jump() {
        if (pdata.hp <= 0) return;
        this.jumpController.node.opacity = 255;
        this.playerController.jump();
        this._jumped = true;
    }

    jumpEnd() {
        this.jumpController.node.opacity = 120
    }


    lastDir: number = 1

    move(p: cc.Vec2) {
        let dir = Math.sign(p.x)
        if (dir == 0) {
            dir = 1
        }
        // this.padSprite.spriteFrame = dir > 0 ? (this.rightState) : (this.leftState);
        if (dir != this.lastDir) {
            dir < 0 ? this.slide() : (this._jumped ? 0 : this.jump())
        }
        if (dir < 0) {
            this.slide();
        } else {
            this.playerController.holdJump();
        }
        // this.playerController.move(dir)
        this.lastDir = dir;
    }


    update(dt) {
        if (CC_DEBUG) {
            if (Input && Input.getKey) {
                if (Input.getKey("a")) {
                    this.playerController.move(-1)
                } else if (Input.getKey("d")) {
                    this.playerController.move(1)
                }
                if (Input.getKey("w")) {
                    this.playerController.holdJump()
                }
            }
        }
    }
}