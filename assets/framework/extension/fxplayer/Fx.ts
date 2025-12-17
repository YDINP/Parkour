import Device from "../../core/Device";
import gUtil from "../../core/gUtil";
import ccUtil from "../../utils/ccUtil";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/fxplayer/Fx")
export default class Fx extends cc.Component {

    // @property([cc.ParticleSystem])
    particles: cc.ParticleSystem[] = []

    // @property([cc.Animation])
    animations: cc.Animation[] = []


    // skeleton: sp.Skeleton = null
    skeleton: sp.Skeleton = null;

    defaultAnim: string = ''

    // name:string = null;

    // _callback:Function;
    // _target:any;

    isPlaying: boolean = false;

    @property({ type: cc.AudioClip })
    sfx: cc.AudioClip = null

    @property(cc.Sprite)
    sprite: cc.Sprite = null

    @property
    childAnimation: boolean = true;

    @property
    duration: number = -1;

    @property
    fadeAfterFinish: number = -1;

    @property
    repeatTime: number = 1;

    @property
    removeAfterFinish: boolean = false;

    @property
    hideAfterFinish: boolean = true;

    private _label: cc.Label = null;

    public get label(): cc.Label {
        if (this._label == null) {
            this._label = this.getComponent(cc.Label)
            if (!this._label) {
                this._label = this.getComponentInChildren(cc.Label)
            }
        }
        return this._label;
    }

    public set string(v) {
        let lb = this.label;
        if (lb) {
            lb.string = v;
        }
    }

    @property
    resetOrigin: boolean = true;

    onLoad() {
        if (this.sprite == null) {
            this.sprite = this.getComponent(cc.Sprite);
            this.sprite = this.sprite || this.node.getComponentInChildren(cc.Sprite);
        }
        let anim = this.getComponent(cc.Animation)
        if (anim) {
            this.animations.push(anim);
        }
        let root_ps = this.getComponent(cc.ParticleSystem)
        root_ps && this.particles.push(root_ps)
        for (let i = 0; i < this.node.childrenCount; i++) {
            const child = this.node.children[i]
            let ps = child.getComponent(cc.ParticleSystem)
            if (ps)
                this.particles.push(ps);
            else if (this.childAnimation) {
                let anim = child.getComponent(cc.Animation)
                if (anim)
                    this.animations.push(anim);
            }
        }
        if (typeof (sp) != "undefined") {
            this.skeleton = this.getComponent(sp.Skeleton);
            // if (!this.skeleton)
            // this.skeleton = this.getComponentInChildren(sp.Skeleton);
            if (this.skeleton && this.skeleton.defaultAnimation) {
                this.defaultAnim = this.skeleton.defaultAnimation
            }
        }
    }

    play(audio: cc.AudioClip = null, spriteFrame = null) {
        this.isPlaying = true;
        let dur = 0;
        if (audio) {
            this.sfx = audio
        }
        if (spriteFrame) {
            if (typeof (spriteFrame) == "string") {
                ccUtil.setDisplay(this.sprite, spriteFrame)
            } else {
                this.sprite.spriteFrame = spriteFrame;
            }
        }

        this.node.active = true;
        for (let i = 0; i < this.particles.length; i++) {
            const element = this.particles[i];
            element.resetSystem();
            if (dur < element.duration) {
                dur = element.duration + element.life + element.lifeVar
            }
        }
        for (let i = 0; i < this.animations.length; i++) {
            const element = this.animations[i];
            let clips = element.getClips()
            if (clips && clips.length > 0) {
                let clip = clips[0]
                let duration = clip.duration / clip.speed
                if (duration > dur) {
                    dur = duration;
                }
                element.play(clip.name);
            }
        }

        if (this.sfx) {
            Device.playEffect(this.sfx, false);
        }

        if (this.skeleton) {
            let loop = this.repeatTime > 0;
            this.skeleton.setAnimation(0, this.defaultAnim || this.skeleton.defaultAnimation, loop);
            dur = this.duration
            if (dur <= 0) {
                return new Promise<void>((resolve, reject) => {
                    let state = this.skeleton.setAnimation(0, this.defaultAnim || this.skeleton.defaultAnimation, loop);
                    if (state) {
                        state.listener = {
                            complete: (entry: sp.spine.TrackEntry) => {
                                console.log("skeleton play complete");
                                if (this.removeAfterFinish) {
                                    this.node.removeFromParent();
                                } else {
                                    this.fadeOnFinish(resolve)
                                }
                            }
                        };
                    } else {
                        // 애니메이션을 찾을 수 없으면 즉시 완료
                        this.scheduleOnce(() => {
                            if (this.removeAfterFinish) {
                                this.node.removeFromParent();
                            } else {
                                this.fadeOnFinish(resolve)
                            }
                        }, 0.1);
                    }
                })
            }
        } else {
            if (this.duration > 0) {
                dur = this.duration
            } else {
                dur = dur + 0.1;
            }
        }
        // console.log("[psfx] play : " ,  this.name,  dur);
        return new Promise<void>((resolve, reject) => {
            this.scheduleOnce(_ => {
                if (!this.isValid) return resolve()
                if (this.removeAfterFinish) {
                    this.node.removeFromParent();
                    resolve();
                } else {
                    this.fadeOnFinish(resolve)
                }
            }, dur)
        })
    }

    fadeOnFinish(callback) {
        this.isPlaying = false;
        for (let i = 0; i < this.particles.length; i++) {
            const element = this.particles[i];
            element.stopSystem();
        }
        if (this.fadeAfterFinish > 0) {
            let seq = cc.sequence(cc.fadeOut(this.fadeAfterFinish), cc.callFunc(callback))
            this.node.runAction(seq)
        } else {
            if (this.hideAfterFinish) {
                this.node.active = false;
            }
            callback();
        }
    }

    reset(): any {
        if (this.resetOrigin)
            this.node.setPosition(cc.Vec2.ZERO);
        this.node.opacity = 255;
        this.animations.forEach(v => {
            if (v) {
                gUtil.stepToAnimation(v, 0);
            }
        })
    }

    start() {

    }

    // update (dt) {}
}
