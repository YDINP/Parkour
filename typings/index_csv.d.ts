
declare namespace csv{
    interface Item_ {
        type:number;
        id:number;
        count:number;
    }
    
    interface Anim_Row {
        
        /**
         * @type {string}
         * @description name -  
         */
        name?:string,

        /**
         * @type {string}
         * @description pattern -  
         */
        pattern?:string,

        /**
         * @type {number}
         * @description begin -  
         */
        begin?:number,

        /**
         * @type {number}
         * @description end -  
         */
        end?:number,

        /**
         * @type {string}
         * @description description -  
         */
        description?:string,

        /**
         * @type {number}
         * @description wrapMode -  
         */
        wrapMode?:number,

        /**
         * @type {number}
         * @description speed -  
         */
        speed?:number,

        /**
         * @type {number}
         * @description disapearAtEnd -  
         */
        disapearAtEnd?:number
    };
    
    export class Anim{
        static get(id:number|string):Anim_Row
        static values:Anim_Row[];
        static search(predicate: (value: Anim_Row, index: number) => boolean):Anim_Row[]
        static size:number;
    }


    export class Audio{
        
        /**
         * @type {string}
         * @description  - home 
         */
        static homeBgm?:string;

        /**
         * @type {string}
         * @description  - boy_jump 
         */
        static sfx_player_jump?:string;

        /**
         * @type {string}
         * @description  - trans 
         */
        static sfx_player_attack?:string;

        /**
         * @type {string}
         * @description  - win 
         */
        static sfx_gameWin?:string;

        /**
         * @type {string}
         * @description  - hurt 
         */
        static sfx_player_hurt?:string;

        /**
         * @type {string}
         * @description  - result 
         */
        static sfx_addgemOrGold?:string;

        /**
         * @type {string}
         * @description  - sound_buyItem 
         */
        static sfx_subgemOrGold?:string;

        /**
         * @type {string}
         * @description  - egg 
         */
        static sfx_openEgg?:string;

        /**
         * @type {string}
         * @description  - game 
         */
        static gameBgm?:string;

        /**
         * @type {string}
         * @description "" - btn_click 
         */
        static btn_click?:string;

        /**
         * @type {string}
         * @description "" - hurt 
         */
        static sfx_player_hurt?:string;

        /**
         * @type {string}
         * @description "" - strong 
         */
        static sfx_buff_strong?:string;

        /**
         * @type {string}
         * @description "" - shield 
         */
        static sfx_buff_shield?:string;

        /**
         * @type {string}
         * @description "" - i_rush 
         */
        static sfx_buff_rush?:string;

        /**
         * @type {string}
         * @description "" - showtime 
         */
        static sfx_showtime?:string;
    }

    interface BuyProps_Row {
        
        /**
         * @type {number}
         * @description 编号 -  
         */
        id?:number,

        /**
         * @type {string}
         * @description 类型 -  
         */
        type?:string,

        /**
         * @type {string}
         * @description 图片 -  
         */
        icon?:string,

        /**
         * @type {string}
         * @description 名字 -  
         */
        name?:string,

        /**
         * @type {string}
         * @description 描述 -  
         */
        describe?:string,

        /**
         * @type {number}
         * @description 金币 -  
         */
        cost?:number,

        /**
         * @type {number}
         * @description buff时间 -  
         */
        buff?:number,

        /**
         * @type {string}
         * @description 使用音效 -  
         */
        useAudio?:string
    };
    
    export class BuyProps{
        static get(id:number|string):BuyProps_Row
        static values:BuyProps_Row[];
        static search(predicate: (value: BuyProps_Row, index: number) => boolean):BuyProps_Row[]
        static size:number;
    }


    export class Config{
        
        /**
         * @type {number}
         * @description 多少级解锁无尽模式 - 3 
         */
        static Unlock_Endless?:number;

        /**
         * @type {number}
         * @description 新记录获得额外的钻石 - 1 
         */
        static NewRecordReward_Diamond?:number;

        /**
         * @type {string}
         * @description banner显示白名单 - UIDiamondShop，UIImgConfirm，UIPause，UIRedHeartShop，UISetting，UITextConfirm 
         */
        static BannerAdWhiteList?:string;

        /**
         * @type {string}
         * @description banner刷新白名单 - UIRevive，UIEndPage 
         */
        static BannerAdRefreshWhiteList?:string
    }

    interface drawBox_Row {
        
        /**
         * @type {number}
         * @description ID -  
         */
        id?:number,

        /**
         * @type {string}
         * @description 名字 -  
         */
        name?:string,

        /**
         * @type {number}
         * @description 数量 -  
         */
        num?:number,

        /**
         * @type {string}
         * @description 保存字段 -  
         */
        saveKey?:string,

        /**
         * @type {string}
         * @description icon地址 -  
         */
        iconPath?:string
    };
    
    export class drawBox{
        static get(id:number|string):drawBox_Row
        static values:drawBox_Row[];
        static search(predicate: (value: drawBox_Row, index: number) => boolean):drawBox_Row[]
        static size:number;
    }


    interface HeroInfo_Row {
        
        /**
         * @type {number}
         * @description up_cost -  
         */
        id?:number,

        /**
         * @type {string}
         * @description name -  
         */
        name?:string,

        /**
         * @type {string}
         * @description 武器 -  
         */
        weapon?:string,

        /**
         * @type {string}
         * @description quality -  
         */
        quality?:string,

        /**
         * @type {string}
         * @description skeleton -  
         */
        skeleton?:string,

        /**
         * @type {string}
         * @description image -  
         */
        image?:string,

        /**
         * @type {number}
         * @description hp -  
         */
        hp?:number,

        /**
         * @type {string}
         * @description 购买条件 -  
         */
        buycost?:string,

        /**
         * @type {string}
         * @description 等级技能描述 -  
         */
        lvdesc?:string,

        /**
         * @type {string}
         * @description 死亡回调 -  
         */
        deadBuff?:string,

        /**
         * @type {string}
         * @description 被动技能 -  
         */
        passiveSkill?:string,

        /**
         * @type {any}
         * @description "jumpMax" -  
         */
        "jumpMax"?:any,

        /**
         * @type {string}
         * @description skill -  
         */
        skill?:string,

        /**
         * @type {string}
         * @description 等级属性 -  
         */
        lvnum?:string,

        /**
         * @type {string}
         * @description 等级花费 -  
         */
        lvcost?:string,

        /**
         * @type {string}
         * @description string_info -  
         */
        string_info?:string,

        /**
         * @type {string}
         * @description 技能音效 -  
         */
        skillAudio?:string,

        /**
         * @type {string}
         * @description 死亡音效 -  
         */
        dieAudio?:string
    };
    
    export class HeroInfo{
        static get(id:number|string):HeroInfo_Row
        static values:HeroInfo_Row[];
        static search(predicate: (value: HeroInfo_Row, index: number) => boolean):HeroInfo_Row[]
        static size:number;
    }


    interface InfiniteLevel_Row {
        
        /**
         * @type {number}
         * @description id -  
         */
        id?:number,

        /**
         * @type {string}
         * @description begin -  
         */
        begin?:string,

        /**
         * @type {number}
         * @description speed -  
         */
        speed?:number,

        /**
         * @type {number}
         * @description 添加概率 -  
         */
        rate?:number,

        /**
         * @type {string}
         * @description begin_type -  
         */
        begin_type?:string,

        /**
         * @type {string}
         * @description type -  
         */
        type?:string
    };
    
    export class InfiniteLevel{
        static get(id:number|string):InfiniteLevel_Row
        static values:InfiniteLevel_Row[];
        static search(predicate: (value: InfiniteLevel_Row, index: number) => boolean):InfiniteLevel_Row[]
        static size:number;
    }


    interface Item_Row {
        [x: string]: number | string;
        
        /**
         * @type {string}
         * @description id -  
         */
        id?:string,

        /**
         * @type {string}
         * @description image -  
         */
        image?:string,

        /**
         * @type {string}
         * @description name -  
         */
        name?:string,

        /**
         * @type {number}
         * @description score -  
         */
        score?:number,

        /**
         * @type {number}
         * @description coin -  
         */
        coin?:number,

        /**
         * @type {number}
         * @description life -  
         */
        life?:number,

        /**
         * @type {string}
         * @description dead_fx -  
         */
        dead_fx?:string,

        /**
         * @type {string}
         * @description anim -  
         */
        anim?:string,

        /**
         * @type {string}
         * @description buff -  
         */
        buff?:string,

        /**
         * @type {string}
         * @description audio -  
         */
        audio?:string,

        /**
         * @type {number}
         * @description isBean -  
         */
        isBean?:number
    };
    
    export class Item{
        static get(id:number|string):Item_Row
        static values:Item_Row[];
        static search(predicate: (value: Item_Row, index: number) => boolean):Item_Row[]
        static size:number;
    }


    interface Level_Row {
        
        /**
         * @type {any}
         * @description "level" -  
         */
        "level"?:any,

        /**
         * @type {any}
         * @description "地图片段" -  
         */
        "segs"?:any,

        /**
         * @type {any}
         * @description "关卡名" -  
         */
        "name"?:any,

        /**
         * @type {string}
         * @description 关卡奖励 -  
         */
        rewards?:string,

        /**
         * @type {string}
         * @description 引导 -  
         */
        guide?:string
    };
    
    export class Level{
        static get(id:number|string):Level_Row
        static values:Level_Row[];
        static search(predicate: (value: Level_Row, index: number) => boolean):Level_Row[]
        static size:number;
    }


    interface MapBg_Row {
        
        /**
         * @type {string}
         * @description bg_key -  
         */
        bg_key?:string,

        /**
         * @type {string}
         * @description layer1 -  
         */
        layer1?:string,

        /**
         * @type {string}
         * @description layer2 -  
         */
        layer2?:string
    };
    
    export class MapBg{
        static get(id:number|string):MapBg_Row
        static values:MapBg_Row[];
        static search(predicate: (value: MapBg_Row, index: number) => boolean):MapBg_Row[]
        static size:number;
    }


    interface MapSeg_Row {
        
        /**
         * @type {any}
         * @description "ID" -  
         */
        "id"?:any,

        /**
         * @type {any}
         * @description "缩写" -  
         */
        "abbr"?:any,

        /**
         * @type {any}
         * @description "文件名" -  
         */
        "level_tmx"?:any,

        /**
         * @type {any}
         * @description "主题" -  
         */
        "theme"?:any,

        /**
         * @type {any}
         * @description "背景" -  
         */
        "mapbg"?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any,

        // /**
        //  * @type {any}
        //  * @description  -  
        //  */
        // ?:any
    };
    
    export class MapSeg{
        static get(id:number|string):MapSeg_Row
        static values:MapSeg_Row[];
        static search(predicate: (value: MapSeg_Row, index: number) => boolean):MapSeg_Row[]
        static size:number;
    }


    interface Mob_Row {
        
        /**
         * @type {any}
         * @description "名称" -  
         */
        "name"?:any,

        /**
         * @type {any}
         * @description "备注" -  
         */
        "ps"?:any,

        /**
         * @type {any}
         * @description "生命值" -  
         */
        "life"?:any,

        /**
         * @type {any}
         * @description "伤害值" -  
         */
        "damage"?:any,

        /**
         * @type {any}
         * @description "出厂方式" -  
         */
        "enterway"?:any,

        /**
         * @type {any}
         * @description "死亡效果" -  
         */
        "dead_fx"?:any,

        /**
         * @type {string}
         * @description 死亡音效 -  
         */
        dead_audio?:string,

        /**
         * @type {string}
         * @description size -  
         */
        size?:string,

        /**
         * @type {number}
         * @description score -  
         */
        score?:number
    };
    
    export class Mob{
        static get(id:number|string):Mob_Row
        static values:Mob_Row[];
        static search(predicate: (value: Mob_Row, index: number) => boolean):Mob_Row[]
        static size:number;
    }


    interface PetInfo_Row {
        
        /**
         * @type {string}
         * @description id -  
         */
        id?:string,

        /**
         * @type {string}
         * @description 骨骼文件名 -  
         */
        skeleton?:string,

        /**
         * @type {string}
         * @description 名称 -  
         */
        name?:string,

        /**
         * @type {string}
         * @description 品质 -  
         */
        quality?:string,

        /**
         * @type {string}
         * @description 图片 -  
         */
        image?:string,

        /**
         * @type {string}
         * @description 简要描述 -  
         */
        brief_info?:string,

        /**
         * @type {number}
         * @description 获取条件 -  
         */
        get_condition?:number,

        /**
         * @type {number}
         * @description 获取概率 -  
         */
        get_probability?:number,

        /**
         * @type {string}
         * @description 等级技能描述 -  
         */
        lvdesc?:string,

        /**
         * @type {string}
         * @description 等级属性 -  
         */
        lvnum?:string,

        /**
         * @type {string}
         * @description 等级花费 -  
         */
        lvcost?:string,

        /**
         * @type {string}
         * @description 被动技能 -  
         */
        passiveSkill?:string,

        /**
         * @type {string}
         * @description 技能名 -  
         */
        skill?:string,

        /**
         * @type {string}
         * @description 详细描述 -  
         */
        string_info?:string
    };
    
    export class PetInfo{
        static get(id:number|string):PetInfo_Row
        static values:PetInfo_Row[];
        static search(predicate: (value: PetInfo_Row, index: number) => boolean):PetInfo_Row[]
        static size:number;
    }


    interface Prop_Row {
        
        /**
         * @type {number}
         * @description 编号 -  
         */
        id?:number,

        /**
         * @type {string}
         * @description 类型 -  
         */
        type?:string,

        /**
         * @type {string}
         * @description 图片 -  
         */
        icon?:string,

        /**
         * @type {string}
         * @description 名字 -  
         */
        name?:string
    };
    
    export class Prop{
        static get(id:number|string):Prop_Row
        static values:Prop_Row[];
        static search(predicate: (value: Prop_Row, index: number) => boolean):Prop_Row[]
        static size:number;
    }


    interface QualityLevel_Row {
        
        /**
         * @type {string}
         * @description key -  
         */
        key?:string,

        /**
         * @type {number}
         * @description lv1 -  
         */
        lv1?:number,

        /**
         * @type {number}
         * @description lv2 -  
         */
        lv2?:number,

        /**
         * @type {number}
         * @description lv3 -  
         */
        lv3?:number,

        /**
         * @type {number}
         * @description lv4 -  
         */
        lv4?:number,

        /**
         * @type {number}
         * @description lv5 -  
         */
        lv5?:number,

        /**
         * @type {number}
         * @description lv6 -  
         */
        lv6?:number
    };
    
    export class QualityLevel{
        static get(id:number|string):QualityLevel_Row
        static values:QualityLevel_Row[];
        static search(predicate: (value: QualityLevel_Row, index: number) => boolean):QualityLevel_Row[]
        static size:number;
    }


    interface shopCap_Row {
        
        /**
         * @type {number}
         * @description 编号 -  
         */
        id?:number,

        /**
         * @type {string}
         * @description name -  
         */
        name?:string,

        /**
         * @type {string}
         * @description 类型 -  
         */
        type?:string,

        /**
         * @type {string}
         * @description 描述 -  
         */
        description?:string,

        /**
         * @type {string}
         * @description 路径 -  
         */
        path?:string,

        /**
         * @type {string}
         * @description 效果 -  
         */
        numerical_value?:string,

        /**
         * @type {string}
         * @description 价格 -  
         */
        price?:string
    };
    
    export class shopCap{
        static get(id:number|string):shopCap_Row
        static values:shopCap_Row[];
        static search(predicate: (value: shopCap_Row, index: number) => boolean):shopCap_Row[]
        static size:number;
    }


    interface SilverCoin_Row {
        
        /**
         * @type {number}
         * @description 编号 -  
         */
        id?:number,

        /**
         * @type {number}
         * @description 银币 -  
         */
        silver_coin?:number,

        /**
         * @type {number}
         * @description 钻石 -  
         */
        diamond?:number,

        /**
         * @type {string}
         * @description 图片 -  
         */
        icon?:string
    };
    
    export class SilverCoin{
        static get(id:number|string):SilverCoin_Row
        static values:SilverCoin_Row[];
        static search(predicate: (value: SilverCoin_Row, index: number) => boolean):SilverCoin_Row[]
        static size:number;
    }


    interface skin_Row {
        
        /**
         * @type {number}
         * @description 天数 -  
         */
        id?:number,

        /**
         * @type {string}
         * @description 名字 -  
         */
        name?:string,

        /**
         * @type {string}
         * @description 奖励类型 -  
         */
        type?:string,

        /**
         * @type {number}
         * @description 数量 -  
         */
        number?:number,

        /**
         * @type {string}
         * @description 日期 -  
         */
        date?:string,

        /**
         * @type {string}
         * @description 路径 -  
         */
        path?:string
    };
    
    export class skin{
        static get(id:number|string):skin_Row
        static values:skin_Row[];
        static search(predicate: (value: skin_Row, index: number) => boolean):skin_Row[]
        static size:number;
    }


    interface string_Row {
        
        /**
         * @type {string}
         * @description id -  
         */
        id?:string,

        /**
         * @type {string}
         * @description  -  
         */
        text?:string
    };
    
    export class string{
        static get(id:number|string):string_Row
        static values:string_Row[];
        static search(predicate: (value: string_Row, index: number) => boolean):string_Row[]
        static size:number;
    }


    interface User_Row {
        
        /**
         * @type {string}
         * @description id -  
         */
        id?:string,

        /**
         * @type {number}
         * @description 所需经验 -  
         */
        exp?:number,

        /**
         * @type {number}
         * @description 金币获得 -  
         */
        gold?:number,

        /**
         * @type {number}
         * @description 钻石获得 -  
         */
        diamond?:number,

        /**
         * @type {number}
         * @description 分数加成 -  
         */
        scoreAdd?:number
    };
    
    export class User{
        static get(id:number|string):User_Row
        static values:User_Row[];
        static search(predicate: (value: User_Row, index: number) => boolean):User_Row[]
        static size:number;
    }


    interface Weapon_Row {
        
        /**
         * @type {string}
         * @description 武器 -  
         */
        name?:string,

        /**
         * @type {string}
         * @description 武器名 -  
         */
        desc?:string,

        /**
         * @type {string}
         * @description 弹道 -  
         */
        bullet?:string,

        /**
         * @type {string}
         * @description 受击特效 -  
         */
        hit?:string,

        /**
         * @type {number}
         * @description 伤害值 -  
         */
        damage?:number,

        /**
         * @type {number}
         * @description 弹道速度 -  
         */
        speed?:number,

        /**
         * @type {number}
         * @description 弹道初始位置偏移 -  
         */
        startOffset?:number,

        /**
         * @type {any}
         * @description 可着落 -  
         */
        canLand?:any,

        /**
         * @type {number}
         * @description 子弹维持时间 -  
         */
        duration?:number,

        /**
         * @type {string}
         * @description 施法特效 -  
         */
        castFx?:string,

        /**
         * @type {string}
         * @description 施法特效偏移 -  
         */
        castFxOffset?:string
    };
    
    export class Weapon{
        static get(id:number|string):Weapon_Row
        static values:Weapon_Row[];
        static search(predicate: (value: Weapon_Row, index: number) => boolean):Weapon_Row[]
        static size:number;
    }


}