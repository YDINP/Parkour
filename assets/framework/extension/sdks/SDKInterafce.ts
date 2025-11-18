export interface IGameConfig {
    gameId: string;
    appId: string,
    banner_ad_id: string
    video_ad_id: string
    interstitial_ad_id: string
    portal_id?: string
    tmplIds?: string[]
    version?: string
    cloudUrl?: string;
}

// export interface SystemInfo {
//     SDKVersion: string,
//     batteryLevel: number,
//     benchmarkLevel: number,
//     brand: string,
//     devicePixelRatio: number
//     fontSizeSetting: number,
//     language: string,
//     model: string,//"iPhone 6/7/8 Plus"
//     pixelRatio: number
//     platform: string;//"devtools"
//     safeArea: any;//{ right, bottom, left, top, width }
//     screenHeight: number;
//     screenWidth: number;
//     statusBarHeight: number;
//     system: string;//"iOS 10.0.1"
//     version: string;//"7.0.4"
//     windowHeight: number
//     windowWidth: number;
// }

export class SDKBase {
    static _gameConf: IGameConfig = null;
    static instance: SDKBase = null;
    constructor() {
        SDKBase.instance = this;
    }
    static initConfig(cf: IGameConfig) {
        this._gameConf = cf;
    }
    static get gameConfig() {
        return SDKBase._gameConf;
    }
}
