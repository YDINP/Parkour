const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/deprecate/LabelPlayer")
export default class LabelPlayer extends cc.Component {

    label: cc.Label = null;

    @property({ slide: true, range: [1, 60], step: 1 })
    framePerSec: number = 15;

    cursor: number = 0;

    end: number = 0;

    isLoop: boolean = false;

    _start: number = 0;

    isPlaying: boolean = false;

    @property({ type: [cc.String] })
    animations: string[] = []

    index2Frames: any[] = [];

    currentFrames = []

    @property
    playOnLoad: boolean = false;

    onLoad() {
        this.label = this.getComponent(cc.Label);
        this.animations.forEach((v, i) => {
            let [start, end] = v.split("-")
            let frames: number[] = null;
            if (end) {
                frames = range(start, end);
            } else {
                frames = v.split(",").map(v => Number(v))
            }
            this.index2Frames.push(frames);
        })
    }

    get interval() {
        return 1 / this.framePerSec
    }

    start() {
        if (this.playOnLoad) {
            this.playWithIndex(0, true);
        }
    }

    private _play(start, end, loop = false) {
        this.isPlaying = true;
        this._start = start;
        this.cursor = start;
        this.end = end;
        this.isLoop = loop;
    }

    play(start, end, loop = false) {
        let currentFrames = range(start, end)
        this.playArray(currentFrames, loop)
    }

    playIndexLoop(idx: number) {
        this.playArray(this.index2Frames[idx], true);
    }

    playIndex(idx: number) {
        this.playArray(this.index2Frames[idx], false);
    }


    playWithIndex(idx: number, loop = false) {
        this.playArray(this.index2Frames[idx], loop);
    }

    setInterval(interval) {
        this.unschedule(this.step)
        this.schedule(this.step, this.interval);
    }

    playArray(frames: number[], loop: boolean = false) {
        this.currentFrames = frames;
        this._play(0, frames.length - 1, loop)
    }

    onEnable() {
        this.schedule(this.step, this.interval);
    }

    onDisable() {
        this.unschedule(this.step);
    }

    step() {
        if (this.isPlaying) {
            let frame = this.currentFrames[this.cursor]
            this.label.string = frame.toString();
            this.cursor++;
            if (this.cursor > this.end) {
                if (this.isLoop) this.cursor = this._start;
                else this.isPlaying = false;
            }
        }
    }




}