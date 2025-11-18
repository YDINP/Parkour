import { IGameConfig } from "../../../../framework/extension/sdks/SDKInterafce";
import { ServerConfig } from "../ServerConfig";

export var GameConfig: IGameConfig = {
    gameId: "parkour",
    appId: "wxa55a38f225da39ed",
    banner_ad_id: "adunit-1b2f4fc8ee785027",
    video_ad_id: "adunit-6d8b8b2d9bee3332",
    interstitial_ad_id: "adunit-027c6e2f0e7eb90c",
    portal_id: "",
    // tmplIds: ['1dVy0WLUvht0nQAvjo3p2eb9JhckUpe9nhvt_dGNf7g'],
    version: ServerConfig.version,
    cloudUrl: "https://mimgame.com/cloud/conf/get"
    // cloudUrl: "http://192.168.124.39:8888/conf/get"
}


