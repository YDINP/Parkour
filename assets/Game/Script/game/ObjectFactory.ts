import PoolManager from "../../../framework/core/PoolManager";
import gUtil from "../../../framework/core/gUtil";
import FxHelpher from "../../../framework/extension/fxplayer/FxHelpher";
import { EaseType } from "../../../framework/extension/qanim/EaseType";
import { FizzBodyType } from "../../../framework/fizzx/components/FizzBody";
import { ParkourType, pdata } from "../data/PlayerInfo";
import Game, { root } from "./Game";
import ItemData from "./model/ItemData";
import Item from "./objects/Item";
import Obstacle from "./objects/Obstacle";

function playEnter(node: cc.Node, style) {
    switch (style) {
        case "1":
            var y = node.y;
            node.y += node.height;
            cc.tween(node).delay(0.3).to(0.5, { position: cc.v2(node.x, y) }, { easing: EaseType[EaseType.backInOut] }).start();
            break;
        case "2":
            var y = node.y;
            node.y += cc.winSize.height + node.height;
            cc.tween(node).delay(0.3).to(0.3, { position: cc.v2(node.x, y) }, { easing: EaseType[EaseType.sineIn] }).call(() => {
                cc.tween(node).to(0.1, { scaleY: 0.8 }).to(0.1, { scaleY: 1 }).start();
                FxHelpher.play("map", "land_dust&s=2", cc.v2(node.x, node.y - node.height / 2))
            }).start();
            break;
        case "3":
            node.angle = 90;
            let sway = cc.tween(node).to(2, { angle: -90 }, { easing: EaseType[EaseType.sineInOut] }).to(2, { angle: 90 }, { easing: EaseType[EaseType.sineInOut] })
            cc.tween(node).repeatForever(sway).start();
            break;
    }
}

const creators = {
    object_item: {
        default(node: cc.Node, name) {
            let item = gUtil.getOrAddComponent(node, Item);
            let ok = item.setItem(name)
            root.addBodyToLayer(node, root.itemLayer)
            return item;
        },
        //变豆子
        item_bean_001(node: cc.Node, name) {
            let item = gUtil.getOrAddComponent(node, Item);
            //item_bean_001
            let lv = pdata.abilitys['beanup']
            let paddedLv = gUtil.padNum(lv, 3);
            let nname = 'item_bean_' + paddedLv;
            let ok = item.changeItem(nname)
            //普通 豆 跟据当前豆子的等级变化外形 
            root.addBodyToLayer(node, root.itemLayer)
            return item;
        },
        changeItem(node: cc.Node, name) {
            let item = gUtil.getOrAddComponent(node, Item);
            let ok = item.changeItem(name)
            root.addBodyToLayer(node, root.itemLayer)
            return item;
        },
        showtime_s(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        showtime_h(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        showtime_o(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        showtime_w(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        showtime_t(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        showtime_i(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        showtime_m(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        showtime_e(node: cc.Node, name) {
            return this.changeItem(node, "item_004")
        },
        item_009(node: cc.Node, name) {
            // showtime 变为item002 (大星星)
            return this.changeItem(node, "item_002")
        },

        // animation_item_heart001(node: cc.Node, name) {
        //     if (pdata.gameMode == ParkourType.Normal) {
        //         node.destroy();
        //     } else {
        //         this.default(node, name)
        //     }
        //     return true;
        // }
    },

    object_obstacle: {
        default(node: cc.Node, name, properties) {
            let obstacle = gUtil.getOrAddComponent(node, Obstacle);
            obstacle.setBody();
            let ok = obstacle.set(name)
            if (ok) {
                obstacle.body.setShape(node.width * 0.5, node.height * 0.9)
                obstacle.body.response = true;
                root.addBodyToLayer(node, root.obstacleLayer)
                playEnter(node, properties.down);
                return obstacle;
            }
        },

        bg_cell_block_up_03(node: cc.Node, name, properties) {
            let obstacle = gUtil.getOrAddComponent(node, Obstacle);

            obstacle.set(name)
            root.addToLayer(node, root.obstacleLayer)
            // 
            node.setAnchorPoint(0.5, 1)
            node.y += node.height;
            playEnter(node, properties.down);

            // set collider box 
            let bodyNode = new cc.Node();
            bodyNode.setContentSize(180, 180)
            bodyNode.setPosition(0, -500)
            bodyNode.parent = node;
            obstacle.setBody(bodyNode);
            obstacle.body.isUpdateChild = true;
            obstacle.body.response = false;

            return obstacle;
        }
    },

    object_monster: {
        default(node: cc.Node, name, properties) {
            let newNode = PoolManager.get('monsters').get(name)
            if (newNode == null) {
                //未找到骨骼，使用常规障碍
                console.warn("未找到骨骼动画" + name + " in " + ObjectFactory.cmap.name + " ,使用常规障碍!")
                return creators.object_obstacle.default(node, name, properties)
            }
            if (node.isValid) {
                newNode.parent = node.parent;
                newNode.position = node.position.addSelf(cc.v3(node.width / 2, node.height / 2, 0));
                let monster = gUtil.getOrAddComponent(newNode, Obstacle);
                monster.setBody();
                monster.body.response = false;
                monster.set(name);
                root.addBodyToLayer(newNode, root.obstacleLayer);
                node.destroy();
                return monster;
            }
        },
        action_008(node: cc.Node) {
            FxHelpher.play("screen", "warnning&d=1.2", cc.v2(cc.winSize.width / 2 - 100, node.y + node.height / 2))
            node.active = false;
            node.x += 64 * 10; // 往后移 20 格
            root.scheduleOnce(v => {
                let mob = this.default(node, "action_008") as Obstacle;
                // 向左移动
                mob.body.bodyType = FizzBodyType.Kinematic;
                mob.body.xv = -700;
            }, 1)
            return true;
        },
        action_015(node: cc.Node) {
            FxHelpher.play("screen", "warnning&d=1.2", cc.v2(cc.winSize.width / 2 - 100, node.y + node.height / 2))
            node.active = false;
            node.x += 64 * 10; // 往后移 20 格
            root.scheduleOnce(v => {
                let mob = this.default(node, "action_015") as Obstacle;
                // 向左移动
                mob.body.bodyType = FizzBodyType.Kinematic;
                mob.body.xv = -1100;
            }, 1)
            return true;
        },
        action_014(node: cc.Node) {
            FxHelpher.play("screen", "warnning&d=1.2", cc.v2(cc.winSize.width / 2 - 100, node.y + node.height / 2))
            node.active = false;
            node.x += 64 * 8; // 往后移 20 格
            root.scheduleOnce(v => {
                let mob = this.default(node, "action_015") as Obstacle;
                // 向左移动
                mob.body.bodyType = FizzBodyType.Kinematic;
                mob.body.xv = -800;
            }, 1)
            return true;
        }

    }
}



export default class ObjectFactory {

    static cmap: cc.TiledMap;

    public static create(tiledmap: cc.TiledMap, layerName, properties: any, node: cc.Node) {
        let layerFuncs = creators[layerName];
        let name = properties.action || properties.imageName;
        let creator = layerFuncs[name];
        this.cmap = tiledmap;
        if (creator) {
            let obj = creator.call(layerFuncs, node, name, properties);
            return obj;
        } else {
            let obj = layerFuncs.default.call(layerFuncs, node, name, properties)
            return obj;
        }
    }

}