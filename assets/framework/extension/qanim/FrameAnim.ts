import ccCache from "../../utils/ccCache";

let { ccclass, property } = cc._decorator

export interface FrameAnimOption {
    name?: string;
    begin: number;
    end: number;
    pattern: string;
    /**
    *  Default: 0 
        Loop: 2
        LoopReverse: 38
        Normal: 1
        PingPong: 22
        PingPongReverse: 54
        Reverse: 36
    */
    wrapMode?: number;
    speed?: number;
    disapearAtEnd?: boolean;
}



@ccclass
export default class FrameAnim extends cc.Component {

    animation: cc.Animation;
    @property
    playOnLoad: boolean = true;

    defaultName: string = 'default'

    onLoad() {

    }

    start() {

    }


    loadFrames(option: FrameAnimOption | any) {
        ccCache.loadFrameAnimClip(option, this.onLoadedAnimation, this)
    }


    onLoadedAnimation(clip) {
        this.animation = this.getOrAddComponent(cc.Animation);
        this.animation.addClip(clip);
        if (this.playOnLoad) {
            this.play(clip.name);
        }
    }

    play(name?, speed: number = 1) {
        name = name || this.defaultName
        if (!this.animation) return;
        let state = this.animation.play(name);
        if (speed != 1) {
            state.speed = speed;
        }
    }

}