export default class SoundHelper{
    static musicVolume=1;
    static music = [];
    static QQSoundContext:any = null;
    static QQMusic:any;
    static qqFlag=true;

    // LIFE-CYCLE CALLBACKS:

    static int() {
        for(let i=0;i<this.music.length;i++){
            this.music[i].id = -1;
        }
        if (cc.sys.platform === cc.sys.QQ_PLAY){
            this.QQMusic =[
                new BK.Audio(0,'GameRes://'+this.music[0].nativeUrl,-1),
                new BK.Audio(0,'GameRes://'+this.music[1].nativeUrl,-1),
                new BK.Audio(0,'GameRes://'+this.music[2].nativeUrl,-1),
            ];
        }
    };


    //播放背景音
    static playMusic(num?){
        num = num ===undefined?0:num;
        if (cc.sys.platform === cc.sys.QQ_PLAY){
            if(this.music[num].id === -1){
                this.QQMusic[num].startMusic();
                this.music[num].id = 1;
            }else{
                this.QQMusic[num].resumeMusic();
            }
            if(num!==0) this.qqFlag = false;
            return;
        }

        if(this.music[num].id === -1){
            this.music[num].id = cc.audioEngine.play(this.music[num], true, this.musicVolume);
        }else{
            cc.audioEngine.resume(this.music[num].id);
        }
    };

    static _soundContext:BK.AudioElement[] = []

    static getSoundContext():BK.AudioElement
    {
        let sc:BK.AudioElement = this._soundContext[this._soundContext.length];
        if(!sc)
        {
            sc = BK.createAudioContext();
            
        }else{
            this._soundContext.pop();
        }
        return sc;
    }

    static playSound2(sound)
    {
        let audio = new BK.Audio(1,'GameRes://'+sound.toString(),1);
        audio.startMusic(sound);
    }

    //播放音效
    static playSound(sound){
        if(this.QQSoundContext == null)
            this.QQSoundContext = BK.createAudioContext({"type":"effect"});
        // let soundContext = this.getSoundContext();
        this.QQSoundContext.src = "GameRes://"+sound.toString();
        this.QQSoundContext.play();
        // soundContext.play({complete:function(result){
        //     SoundHelper._soundContext.push(soundContext)
        // }});
        // soundContext.play();
        // soundContext.on("ended",function(){
            // SoundHelper._soundContext.push(soundContext)
        // })
    };

    //停止背景音
    static stopMusic(num){
        num = num ===undefined?0:num;
        if(this.music[num].id ===-1 )return;
        if (cc.sys.platform === cc.sys.QQ_PLAY){
            this.QQMusic[num].stopMusic();
            this.music[num].id = -1;
            this.QQMusic[num] =  new BK.Audio(0,'GameRes://'+this.music[num].nativeUrl,-1)
            return;
        }
        cc.audioEngine.stop(this.music[num].id);
        this.music[num].id = -1;
    };

    //暂停背景音
    static pauseMusic(num){
        num = num ===undefined?0:num;
        if (cc.sys.platform === cc.sys.QQ_PLAY){
            this.QQMusic[num].pauseMusic();
            return;
        }
        if(this.music[num].id ===-1 || cc.audioEngine.AudioState.PLAYING !== cc.audioEngine.getState(this.music[num].id) )return;
        cc.audioEngine.pause(this.music[num].id);
    };

    //设置背景音开关
    static setMusicOff(bool){
        if(bool){
            this.playMusic();
        }else{
            for(let i=0;i<this.music.length;i++){
                this.pauseMusic(i);
            }
        }
    };
    //设置音效开关
    static setSoundOff(bool){
    };

    //设置背景音里
    static setMusicVolume(value){
        this.musicVolume = value;
        for(let i=0;i<this.music.length;i++){
            if(this.music[i].id !== -1 && cc.audioEngine.AudioState.PLAYING === cc.audioEngine.getState(this.music[i].id)){
                cc.audioEngine.setVolume(this.music[i].id,this.musicVolume);
            }
        }
    };
    //设置音效音量
    static setSoundVolume(value){
        // this.soundVolume = value;
    };


    static qqMusicResume(){
        if (cc.sys.platform !== cc.sys.QQ_PLAY) return;
        if(this.music[1].id !== -1 || this.music[2].id!== -1 || this.qqFlag) return;
        this.playMusic(0);
    };

}
