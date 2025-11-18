import { FrameAnimOption } from "../extension/qanim/FrameAnim"


export default class ccCache {
    static clipCaches = {}
    static loadFrameAnimClip(option: FrameAnimOption, callback?, target?) {
        if (option == null) return console.log("[loadFrameAnimClip] : option null")
        let clip = this.clipCaches[option.name]
        if (clip == null) {
            let arr = range(option.begin, option.end, 1).map(v => cc.js.formatStr(option.pattern, v))
            cc.loader.loadResArray(arr, cc.SpriteFrame, (err, frames) => {
                if (err) return console.error(err);
                if (option.disapearAtEnd)
                    frames.push(null);

                clip = cc.AnimationClip.createWithSpriteFrames(frames, 30);
                clip.name = option.name || "default";
                clip.speed = option.speed || 1;
                clip.wrapMode = option.wrapMode || cc.WrapMode.Normal;
                this.clipCaches[clip.name] = clip;
                callback && callback.call(target, clip)
            })
        } else {
            callback && callback.call(target, clip)
        }
    }

}