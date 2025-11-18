import Device from "../../core/Device";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/util/ClickAudio")
export default class ClickAudio extends cc.Component {

    @property({ type: cc.AudioClip })
    audio: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    audio_down: cc.AudioClip = null;

    onLoad() {

        this.node.on('touchstart', _ => {
            //cc.EaseElasticOut:create(
            // this.node.stopAllActions();
            this.audio_down && Device.playEffect(this.audio_down, false)
        }, this.node);

        this.node.on("touchend", _ => {
            this.audio && Device.playEffect(this.audio, false)
        })
        this.node.on("touchcancel", _ => {
        })
    }

    // update (dt) {}
}
