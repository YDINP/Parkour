import Net from "../../../framework/core/Net";
import Platform from "../../../framework/extension/Platform";
import { UInfo } from "../../../framework/extension/weak_net_game/UInfo";
import mvcView from "../../../framework/ui/mvcView";
import { Toast } from "../../../framework/ui/ToastManager";
import ccUtil from "../../../framework/utils/ccUtil";
import { ServerConfig } from "../common/ServerConfig";
import { pdata } from "../data/PlayerInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRank extends mvcView {

    @property(cc.Node)
    node_world: cc.Node = null;
    @property(cc.Node)
    node_friend: cc.Node = null;
    @property(cc.Node)
    node_btn: cc.Node = null;
    @property(cc.Layout)
    content: cc.Layout = null;
    @property(cc.SpriteFrame)
    spr: cc.SpriteFrame[] = [];

    private _time: number = 0;
    private arr: Array<any>;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.register(this.content, _ => this.arr, this.setList.bind(this));
        this.click_world();
    }

    onShow() {
        // this.render();
        let time = Date.now();
        if (time > this._time) {
            this._time = time + 60000;
            this.getRankData();
        }
    }

    private async getRankData() {
        let res = await new Net().httpGet(ServerConfig.root_url + "/api/rank", { orderBy: 'score' });
        if (!res) {
            Toast.make("数据异常");
            return;
        }
        let d = JSON.parse(res);
        let arr = this.arr = d.data.list;
        let openid = UInfo.userId;
        let myRank;
        // for (let index = 0; index < arr.length; index++) {
        //     if (openid == arr[index].openId) {
        //         this.playSet(this.playType.rank, index + 1);
        //         myRank = index + 1;
        //         break;
        //     }
        // }
        this.render();
    }

    private async setbottom() {
        let d = await Platform.getUserInfo();
        if (!d) {
            this.scheduleOnce(() => {
                Platform.showUserInfoButton({ left: (this.node.width / 2 + this.node_btn.x) / this.node.width, top: (this.node.height / 2 - this.node_btn.y) / this.node.height, }, (d) => {
                    this.setUserInfo(d);
                    if (d) {
                        Platform.hideUserInfoButton();
                        this.click_world();
                    }
                    // Platform.synchroData('nickName', d.nickName);
                    // Platform.synchroData('avatarUrl', d.avatarUrl);
                });
            }, 1.1)
            return;
        }
        this.setUserInfo(d);
    }

    private setUserInfo(d) {
        if (!d) return;
        pdata.nickName = d.nickName;
        pdata.avatarUrl = d.avatarUrl;
        pdata.sendToServer("nickName,avatarUrl")
    }

    private setList(node: cc.Node, data: any, idx: number) {
        idx < 3 ? node.getChildByName('img_rank').getComponent(cc.Sprite).spriteFrame = this.spr[idx] : node.getChildByName('lab_rank').getComponent(cc.Label).string = (idx + 1).toString();
        let spr = node.getChildByName('img_picture').getComponent(cc.Sprite);
        if (!data.avatarUrl) spr.spriteFrame = null;
        else ccUtil.setDisplay(spr, data.avatarUrl);
        node.getChildByName('lab_name').getComponent(cc.Label).string = data.nickName || '未知';
        node.getChildByName('lab_levels_online').getComponent(cc.Label).string = data.score || 1;
    }

    start() {
    }

    click_world() {
        this.node_world.active = true;
        this.node_friend.active = false;
    }

    click_friend() {
        this.node_world.active = false;
        Platform.postMessage('show');
        this.node_friend.active = true;
        this.setbottom();
    }

    click_closes() {
        Platform.hideUserInfoButton();
        vm.hide(this);
    }


    click_share() {
        Platform.share();
    }

    // update (dt) {}
}
