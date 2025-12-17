
let { ccclass, property, menu } = cc._decorator

const BODY_PART_WEIGHT = 0.5;
const UPPERBODY_WEIGHT = 1;
const EMOTION_WEIGHT = 0;
@ccclass
@menu("story/SkeletonComponent")
export default class SkeletonComponent extends cc.Component {

    private _skeleton: sp.Skeleton = null;

    animStates: { [index: string]: sp.spine.TrackEntry } = {};

    mainState: sp.spine.TrackEntry = null;

    baseScaleX: number = 0;

    speakerNode: cc.Node = null;

    initDir: number = 1;

    _dir: number = 1;

    public get display(): sp.Skeleton {
        return this.skeleton;
    }
    public set display(value: sp.Skeleton) {
        this._skeleton = value;
    }

    public get skeleton(): sp.Skeleton {
        if (this._skeleton == null)
            this._skeleton = this.getComponent(sp.Skeleton);
        return this._skeleton;
    }
    public set skeleton(value: sp.Skeleton) {
        this._skeleton = value;
    }

    public get armature(): sp.Skeleton {
        return this.skeleton;
    }
    public set armature(value: sp.Skeleton) {
        this._skeleton = value;
    }

    onLoad() {
        this.speakerNode = this.node.children[0];
        this.node.on(cc.Node.EventType.SCALE_CHANGED, this.onScaleChanged, this)
    }

    _completeCallback: Function = null;
    _completeTarget: any = null;

    onComplete(callback, target) {
        // Spine에서는 TrackEntry의 complete 이벤트를 사용
        this._completeCallback = callback;
        this._completeTarget = target;
    }

    offComplete(callback, target) {
        this._completeCallback = null;
        this._completeTarget = null;
    }

    setArmature(name) {
        // Spine에서는 skeleton asset을 변경해야 함
        // 이 메서드는 필요시 구현
    }

    start() {
        this.baseScaleX = this.node.scaleX;
        // this.schedule(this.checkIdle, 0.2)
        if (this.node.scaleX < 0) {
            this.dir = this.initDir;
        }
    }

    onScaleChanged(e) {
        this.node.emit("changeDir")
    }


    set dir(v) {
        this.node.scaleX = this.baseScaleX * (v || 1);

        this._dir = v;
    }

    get dir() {
        return this._dir;
    }

    onEnable() {

    }

    onDestroy() {

    }

    noIdle() {
        this.mainState = null;
    }

    play(anim, times = 1) {
        if (this.skeleton) {
            let loop = times === 0;
            this.mainState = this.skeleton.setAnimation(0, anim, loop);
            if (this.mainState && this._completeCallback) {
                this.mainState.listener = {
                    complete: (entry: sp.spine.TrackEntry) => {
                        if (this._completeCallback) {
                            this._completeCallback.call(this._completeTarget, entry);
                        }
                    }
                } as sp.spine.AnimationStateListener;
            }
        }
        return this.mainState;
    }

    checkIdle() {
        if (this.mainState) {
            if (this.mainState.isComplete) {
                this.play('idle', 0)
                this.mainState = null;
                this.recoveryEmotion();
            }
        }
    }

    update() {

    }

    stopMain() {
        if (this.skeleton) {
            this.skeleton.clearTracks();
            this.mainState = null;
        }
    }


    mix(group: string, anim, layer, times = 1, dur = 0.2) {
        if (this.skeleton) {
            let trackIndex = layer;
            let state = this.skeleton.setAnimation(trackIndex, anim, times === 0);
            if (dur > 0) {
                state.mixDuration = dur;
            }
            this.animStates[group] = state;
            return state;
        }
        return null;
    }


    stop(group: string) {
        let state = this.animStates[group]
        if (state && this.skeleton) {
            this.skeleton.clearTrack(state.trackIndex);
            delete this.animStates[group];
        }
    }

    hold() {
        //hold something 
    }

    setEmotion(emotionName, layer = 0) {
        if (emotionName == null) {
            this.stop("emotion");
            return;
        }
        let state = this.mix("emotion", emotionName, EMOTION_WEIGHT, 0);
        if (state) {
            state.addBoneMask("head", true)
            // state.addBoneMask("r_eye");
            // state.addBoneMask("l_eye");
            // state.addBoneMask("l_eyeball");
            // state.addBoneMask("r_eyeball");
            // state.addBoneMask("mouse");
            // state.addBoneMask("nose");
        } else {
            console.warn("[setEmotion] not found: " + emotionName)
        }
    }

    setEarAttachment() {
        let state = this.mix("earphone", "head-earphone", 0, 1);
        state.addBoneMask("earphone")
    }

    blinkEye() {
        let state = this.mix("blink", "emotion-blink", 0);
        state.addBoneMask("l_eye")
        state.addBoneMask("r_eye")
    }

    eyeBallWander(times = 1) {
        let state = this.mix("eyeball", "anim-eyeball", 0, times)
        state.addBoneMask("l_eyeball")
        state.addBoneMask("r_eyeball")
    }

    setUpperBody(name = null, times = 0, dur = 0.2) {
        this.stop("upper");
        if (name == null) {
            return;
        }
        let state = this.mix("upper", name, UPPERBODY_WEIGHT, times, dur);
        if (state) {
            state.addBoneMask("l_u_arm")
            state.addBoneMask("r_u_arm")
            state.addBoneMask("l_hand")
            state.addBoneMask("r_hand")
            state.addBoneMask("head")
            this.recoveryEmotion();
        } else {
            console.warn("[setUpperBody] not found: " + name)
        }
    }

    // setBodyPose(name) {
    //     if (name == null) {
    //         this.stop("body");
    //         return;
    //     }
    //     let state = this.mix("body", name, 0, 0);
    // }

    setFeet(name = null) {
        if (name == null) {
            this.stop("feet");
            return;
        }
        let state = this.mix("feet", name, 0, 0);
        state.addBoneMask("r_feet")
        state.addBoneMask("l_feet")
    }


    setBody(name = null, times = 0) {
        let state = this.mix("body", name, BODY_PART_WEIGHT, times)
        if (state) {
            this.recoveryEmotion();
        }
    }

    recoveryEmotion() {
        let emotion = this.animStates['emotion']
        if (emotion && emotion.animation) {
            this.setEmotion(emotion.animation.name);
        }
    }

    startWalk(shakeHands = true, dur = null) {
        let state = this.mix("body", 'walk', BODY_PART_WEIGHT, 0, dur)
        if (!shakeHands) {
            state.addBoneMask("l_feet")
            state.addBoneMask("r_feet")
            // state.addBoneMask("bone")
            state.addBoneMask("head2")
        }
        if (state) {
            this.recoveryEmotion();
        }
    }

    startRun(shakeHands = true) {
        let state = this.mix("body", 'run', BODY_PART_WEIGHT, 0)
        if (!shakeHands) {
            state.addBoneMask("l_feet")
            state.addBoneMask("r_feet")
            state.addBoneMask("head2")
        }
        if (state) {
            this.recoveryEmotion();
        }
    }

    stopRun() {
        this.idle();
    }

    stopWalk() {
        this.idle();
    }

    idle() {
        this.stop("body")
        let state = this.mix("body", 'idle', BODY_PART_WEIGHT, 0)
        if (state) {
            this.recoveryEmotion();
        }
    }

}