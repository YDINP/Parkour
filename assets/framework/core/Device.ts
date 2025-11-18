
export default class Device {

    static isSfxEnabled = true;

    static isBgmEnabled = true;
    static isVibrateEnabled = true;

    static audio_path = "Audio/";

    static bgmClipUrl = null;
    static setSoundsEnable(b: boolean) {
        Device.setSFXEnable(b)
        Device.setBGMEnable(b);
    }

    static setSFXEnable(b) {
        Device.isSfxEnabled = b;
    }

    static setVibrateEnable(b) {
        Device.isVibrateEnabled = b;
    }

    static tmp_bgm_url: string = null;

    static setBGMEnable(b) {
        Device.isBgmEnabled = b;
        if (!b) {
            // cc.audioEngine.pauseMusic()
            Device.stopMusic();
            // Device.bgm_clip && Device.bgm_clip.pause();
        }
        if (b) {
            if (Device.tmp_bgm_url == null) return;
            Device.playBGM(Device.tmp_bgm_url);
            // Device.bgm_clip && Device.bgm_clip.play();
            // cc.audioEngine.resumeMusic();
        }
    }

    static _clips: { [index: string]: any } = {}

    static playSfx(url, loop = false, volume = 1) {
        if (url == "" || url == null) return;
        Device.stopSfx(url);
        if (!Device.isSfxEnabled) { return }
        cc.loader.loadRes(Device.audio_path + url, cc.AudioClip, (err, clip: cc.AudioClip) => {
            if (err)
                console.warn(err)
            else {
                Device._clips[url] = Device.playEffect(clip, loop, volume);
            }
        });
    }

    static stopSfx(url) {
        let clip = Device._clips[url]
        cc.audioEngine.stopEffect(clip);
        // if (clip) {
        //     clip.stop();
        // }
    }

    static stopAllEffect() {
        cc.audioEngine.stopAllEffects();
        // for (var k in Device._clips) {
        //     let v = Device._clips[k]
        //     cc.audioEngine.stopEffect(v)
        // }
    }

    static wx_bgms: { [index: string]: InnerAudioContext } = {}

    static getPlayingBGM() {
        if (cc.audioEngine.isMusicPlaying()) {
            return null;
        }
        return Device.tmp_bgm_url;
    }

    static playBGM(url, loop = true) {
        //如果和上次播放的一样，无需重新播放
        if (Device.tmp_bgm_url == url) return;
        Device.tmp_bgm_url = url;
        if (!Device.isBgmEnabled) { return }
        Device.stopMusic();

        // cc.loader.loadRes(Device.audio_path + url, cc.AudioClip, (err, clip: cc.AudioClip) => {
        //     if (err)
        //         console.log(err)
        //     else {
        //         Device.playMusic(clip, loop);
        //     }
        // });
        // if (!CC_WECHATGAME || window.tt || !cc.loader.md5Pipe) {
        cc.loader.loadRes(Device.audio_path + url, cc.AudioClip, (err, clip: cc.AudioClip) => {
            if (err)
                console.log(err)
            else {
                Device.bgmClipUrl = Device.audio_path + url;
                Device.playMusic(clip, loop);
            }
        });
        // }
        // } else {
        //     let bgm_wx = Device.wx_bgms[url]
        //     if (bgm_wx == null) {
        //         if (cc.loader.md5Pipe) {
        //             let rel_url = cc.url.raw("resources/" + Device.audio_path + url + ".mp3");
        //             //@ts-ignore
        //             rel_url = wxDownloader.REMOTE_SERVER_ROOT + cc.loader.md5Pipe.transformURL(rel_url);
        //             bgm_wx = wx.createInnerAudioContext();
        //             bgm_wx.src = rel_url;
        //             bgm_wx.loop = true
        //             Device.wx_bgms[url] = bgm_wx;
        //         }

        //         bgm_wx.play();
        //     }
        // }
    }

    static resumeBgm() {
        if (CC_WECHATGAME) {
            let bgm = Device.wx_bgms[Device.tmp_bgm_url]
            if (bgm) {
                bgm.play();
            }
        }
    }

    static pauseBGM() {
        if (CC_WECHATGAME) {
            let bgm = Device.wx_bgms[Device.tmp_bgm_url]
            if (bgm) {
                bgm.pause();
            }
        }
    }

    static setAudioPath(path) {
        Device.audio_path = path;
    }

    static playEffect(clip: cc.AudioClip, loop = false, volume = 1) {
        if (!clip) {
            return
        }
        if (Device.isSfxEnabled) {
            return cc.audioEngine.playEffect(clip, loop);
        }
    }

    static stopEffect(id: number) {
        cc.audioEngine.stopEffect(id);
    }

    static bgm_clip: any = null;
    static stopMusic() {
        // Device.bgm_clip && Device.bgm_clip.stop();
        // if (CC_WECHATGAME && !window.tt) {
        //     let bgm_wx = Device.wx_bgms[Device.tmp_bgm_url]
        //     if (bgm_wx) {
        //         bgm_wx.stop();
        //     }
        // } else {
        cc.audioEngine.stopMusic();
        // }
    }

    static playMusic(clip: cc.AudioClip, loop = true) {
        if (Device.isBgmEnabled) {
            // Device.bgm_clip = clip;
            Device.bgm_clip = cc.audioEngine.playMusic(clip, loop);
            // clip.setLoop(loop);
            // return clip.play();

        }
    }

    static getBgmState(url) {
        if (Device.bgmClipUrl == Device.audio_path + url) {
            return cc.audioEngine.getState(Device.bgm_clip);
        }
        return false
    }

    static vibrate(long?) {
        if (!Device.isVibrateEnabled) {
            return;
        }
        if (cc.sys.WECHAT_GAME == cc.sys.platform) {
            if (long)
                wx.vibrateLong()
            else
                wx.vibrateShort();
        } else {
            // console.log("not support vibrate on except-wx platfrom ")
        }
    }
}

cc.game.on(cc.game.EVENT_SHOW, () => {
    Device.resumeBgm();
})

cc.game.on(cc.game.EVENT_HIDE, () => {
    Device.pauseBGM();
})