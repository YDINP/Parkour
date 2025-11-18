import DataCenter, { dc, field } from "../../../framework/core/DataCenter";

@dc("gdata")
export default class GameInfoDC extends DataCenter {

    @field()
    mapWidth: number = 0;


}

export let gdata: GameInfoDC = DataCenter.register(GameInfoDC);