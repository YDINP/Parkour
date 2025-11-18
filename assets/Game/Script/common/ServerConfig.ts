// import { tmxLoader } from "../../../../framework/plugin_boosts/misc/RemoteTMXLoader";

export var ServerConfig = {
    version: "1.0.0",
    // root_url: `http://192.168.124.3:8888`,
    root_url: ``,
    cdn_url: ``,
    config_name: `config.json`,
    config_url: "",
    is_local_game: true,
    is_normal_login: true,
    userId: ""
}
if (CC_DEBUG) {
    // ServerConfig.is_local_game = true;
}
ServerConfig.cdn_url = `${ServerConfig.cdn_url}/${ServerConfig.version}/`
ServerConfig.config_url = ServerConfig.cdn_url + ServerConfig.config_name
// tmxLoader.baseUrl = ServerConfig.cdn_url + "cloud-levels/"