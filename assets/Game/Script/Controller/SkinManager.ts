/**
 * refs:
 * https://www.cnblogs.com/pipiyabumaimeng/p/13532851.html
 * https://www.cnblogs.com/gamedaybyday/p/13021916.html
 * 
 */

import ccUtil from "../../../framework/utils/ccUtil";

interface DBAsset {
    asset,
    atlasAsset
}

const exlude_parts = ["r_handobj", 'r_eye', 'l_eye', "nose", "l_yeball", "l_yeball1", "mouse", 'l_hand', 'r_hand-replace']

export default class SkinManager {

    static dbs: DBAsset[] = []

    static baseDir: string = "skins/"
    static async getRes(path) {
        return ccUtil.getRes(path, cc.Asset);
    }


    static async loadDb(dataPath, atlasPath, name) {
        let factory = dragonBones.CCFactory.getInstance();
        let raw = await this.getRes(dataPath) as dragonBones.DragonBonesAsset;
        //@ts-ignore
        factory.parseDragonBonesData(raw._buffer);
        //读取龙骨贴图
        let atlas = await ccUtil.getRes(atlasPath, dragonBones.DragonBonesAtlasAsset) as dragonBones.DragonBonesAtlasAsset
        //解析龙骨贴图
        factory.parseTextureAtlasData(JSON.parse(atlas.atlasJson), atlas.texture, name + "")
        let db = { asset: raw, atlasAsset: atlas } as DBAsset
        this.dbs[name] = db;
        return db;
    }

    //替换部分
    static async changePart(armature: dragonBones.Armature) {
        //changeHead
        let factory = dragonBones.CCFactory.getInstance();
        let head_name = "lufei-head"
        let slot = armature.getSlot("head")
        if (factory.getDragonBonesData(head_name) == null) {
            //读取龙骨数据
            await this.loadDb("skins/lufei-head_ske.dbbin", "skins/lufei-head_tex.json", head_name)
        }
        slot.childArmature = factory.buildArmature("Armature", head_name)
    }

    //换皮肤！
    static async changeSkin(armature: dragonBones.Armature, skinName = 'wukong') {
        let factory = dragonBones.CCFactory.getInstance();
        if (skinName == 'default') {
            factory.replaceSkin(armature, armature.armatureData.defaultSkin, false, exlude_parts)
            return;
        }

        if (factory.getDragonBonesData(skinName) == null) {
            await this.loadDb(this.baseDir + skinName + "_ske.dbbin", this.baseDir + skinName + "_tex.json", skinName)
        }
        let data = factory.getArmatureData("Armature", skinName + "")
        factory.replaceSkin(armature, data.defaultSkin, false, exlude_parts)
    }


    static async setSkeleton(skeleton: dragonBones.ArmatureDisplay, skinName = 'wukong') {
        let db //= this.dbs[name]
        if (db == null) {
            db = await this.loadDb(this.baseDir + skinName + "_ske.dbbin", this.baseDir + skinName + "_tex.json", skinName)
        }
        skeleton.dragonAsset = db.asset;
        skeleton.dragonAtlasAsset = db.atlasAsset
        skeleton.armatureName = 'Armature'
    }

}