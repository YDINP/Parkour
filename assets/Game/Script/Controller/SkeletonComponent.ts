
let { ccclass, property, menu } = cc._decorator

const BODY_PART_WEIGHT = 0.5;
const UPPERBODY_WEIGHT = 1;
const EMOTION_WEIGHT = 0;
@ccclass
@menu("story/SkeletonComponent")
export default class SkeletonComponent extends cc.Component {

    private _display: dragonBones.ArmatureDisplay = null;

    private _armature: dragonBones.Armature = null;


    animStates: { [index: string]: dragonBones.AnimationState } = {};

    mainState: dragonBones.AnimationState = null;

    baseScaleX: number = 0;

    speakerNode: cc.Node = null;

    initDir: number = 1;

    _dir: number = 1;

    public get display(): dragonBones.ArmatureDisplay {
        if (this._display == null)
            this._display = this.getComponent(dragonBones.ArmatureDisplay);
        return this._display;
    }
    public set display(value: dragonBones.ArmatureDisplay) {
        this._display = value;
    }

    public get armature(): dragonBones.Armature {
        if (this._armature == null) {
            if (this.display)
                this._armature = this.display.armature() as dragonBones.Armature;
        }
        return this._armature;
    }
    public set armature(value: dragonBones.Armature) {
        this._armature = value;
    }

    onLoad() {
        this.speakerNode = this.node.children[0];
        this.node.on(cc.Node.EventType.SCALE_CHANGED, this.onScaleChanged, this)
    }

    onComplete(callback, target) {
        this.display.addEventListener(dragonBones.EventObject.COMPLETE, callback, target);
    }

    offComplete(callback, target) {
        this.display.removeEventListener(dragonBones.EventObject.COMPLETE, callback, target)
    }

    setArmature(name) {
        this.display.armatureName = name;
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
        this.mainState = this.display.playAnimation(anim, times)
        return this.mainState;
    }

    checkIdle() {
        if (this.mainState) {
            if (this.mainState.isCompleted) {
                this.play('idle', 0)
                this.mainState = null;
                this.recoveryEmotion();
            }
        }
    }

    update() {

    }

    stopMain() {
        if (this.mainState) {
            // this.mainState.resetToPose = true;
            this.mainState.stop();
        }
    }


    mix(group: string, anim, layer, times = 1, dur = 0.2) {
        return this.animStates[group] = this.armature.animation.fadeIn(anim, dur, times, layer, group, dragonBones.AnimationFadeOutMode.SameLayerAndGroup)
    }


    stop(group: string) {
        let state = this.animStates[group]
        if (state)
            state.stop();
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
        if (emotion) {
            this.setEmotion(emotion.name);
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