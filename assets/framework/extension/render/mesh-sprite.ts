// author: lamyoung.com
// modified : rw(mimgame.com) 2020/4/6

const gfx = cc.gfx;

let { executeInEditMode, ccclass, property } = cc._decorator
@ccclass
@executeInEditMode
export default class MeshSprite extends cc.Component {

    @property({ displayName: "刷新" })
    _temp_refresh: boolean = true;
    @property({ displayName: "刷新" })
    get temp_refresh() {
        return this._temp_refresh;
    }
    set temp_refresh(v) {
        this._temp_refresh = v;
        this._applyVertexes();
    }

    @property(cc.Vec2)
    _offset: cc.Vec2 = cc.v2();
    /**
     * !#en Position offset
     * !#zh 位置偏移量
     * @property offset
     * @type {Vec2}
     */
    @property({ type: cc.Vec2 })
    get offset() {
        return this._offset;
    }

    set offset(value) {
        this._offset = value;
        if (this.temp_refresh || !CC_EDITOR)
            this._applyVertexes();
    }
    @property(cc.SpriteFrame)
    _spriteFrame: cc.SpriteFrame = null;
    /**
     * !#en The sprite frame of the sprite.
     * !#zh 精灵的精灵帧
     * @property spriteFrame
     * @type {SpriteFrame}
     * @example
     * sprite.spriteFrame = newSpriteFrame;
     */
    @property({ type: cc.SpriteFrame })
    get spriteFrame() {
        return this._spriteFrame;
    }

    set spriteFrame(v) {
        this._spriteFrame = v;
        this._applySpriteFrame();
    }
    @property([cc.Vec2])
    _vertexes: cc.Vec2[] = [
        cc.v2(-100, -100),
        cc.v2(100, -100),
        cc.v2(100, 100),
        cc.v2(-100, 100)
    ]
    /**
     * !#en Polygon points
     * !#zh 多边形顶点数组
     * @property points
     * @type {Vec2[]}
     */
    @property({ type: [cc.Vec2] })
    get vertexes() {
        return this._vertexes;
    }
    set vertexes(value) {
        this._vertexes = value;
        this._updateMesh();
        if (this.temp_refresh || !CC_EDITOR) {
            this._applyVertexes();
        }
    }

    @property
    customShader: boolean = false;

    @property
    deleteMode: boolean = false;

    renderer: cc.MeshRenderer;

    _meshCache: any;

    mesh: cc.Mesh;

    texture: cc.Texture2D;

    @property(cc.Color)
    _color: cc.Color = cc.color(255, 255, 255, 255);

    set diffuseColor(v) {
        if (v == null) return;
        const renderer = this.renderer;
        if (!cc.isValid(renderer)) return
        let material = renderer.getMaterial(0);
        if (!cc.isValid(material)) return;
        material.setProperty("diffuseColor", v)
        this._color = v;
    }

    onLoad() {
        this._meshCache = {};
        this._updateMesh();

        let renderer = this.node.getComponent(cc.MeshRenderer);
        if (!renderer) {
            renderer = this.node.addComponent(cc.MeshRenderer);
        }

        renderer.mesh = null;
        this.renderer = renderer;

        if (!this.customShader) {
            let builtinMaterial = new cc.Material();
            builtinMaterial.copy(cc.Material.getInstantiatedBuiltinMaterial("unlit", this));   //getBuiltinMaterial
            renderer.setMaterial(0, builtinMaterial);
        }
        // renderer.getMaterial(0).setProperty("mainOffset", cc.v2(0.1, 0.2))
        this._applySpriteFrame();
        this._applyVertexes();
    }

    onDestroy() {
        this.mesh.destroy();
    }

    _updateMesh() {
        let mesh = this._meshCache[this.vertexes.length];
        if (!mesh) {
            mesh = new cc.Mesh();
            mesh.init(new gfx.VertexFormat([
                { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
                { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            ]), this.vertexes.length, true);
            this._meshCache[this.vertexes.length] = mesh;
        }
        this.mesh = mesh;
        // cc.log('_updateMesh');
    }

    // 更新顶点
    _applyVertexes() {
        // cc.log('_applyVertexes');

        // 设置坐标
        const mesh = this.mesh;
        mesh.setVertices(gfx.ATTR_POSITION, this.vertexes);

        if (this.texture) {
            let uvs = [];
            // 计算uv
            for (const pt of this.vertexes) {
                const vx = (pt.x + this.texture.width / 2 + this.offset.x) / this.texture.width;
                const vy = 1.0 - (pt.y + this.texture.height / 2 + this.offset.y) / this.texture.height
                uvs.push(cc.v2(vx, vy));
            }
            mesh.setVertices(gfx.ATTR_UV0, uvs);
        }

        if (this.vertexes.length >= 3) {
            // 计算顶点索引 
            let ids = [];
            const vertexes = [].concat(this.vertexes);

            // 多边形切割，未实现相交的复杂多边形，确保顶点按顺序且围成的线不相交
            let index = 0, rootIndex = -1;
            while (vertexes.length > 3) {
                const p1 = vertexes[index];
                const p2 = vertexes[(index + 1) % vertexes.length];
                const p3 = vertexes[(index + 2) % vertexes.length];

                const v1 = p2.sub(p1);
                const v2 = p3.sub(p2);
                if (v1.cross(v2) >= 0) {
                    // 是凸点
                    let isIn = false;
                    for (const p_t of vertexes) {
                        if (p_t !== p1 && p_t !== p2 && p_t !== p3 && this._testInTriangle(p_t, p1, p2, p3)) {
                            // 其他点在三角形内
                            isIn = true;
                            break;
                        }
                    }
                    if (!isIn) {
                        // 切耳朵，是凸点，且没有其他点在三角形内
                        ids = ids.concat([this.vertexes.indexOf(p1), this.vertexes.indexOf(p2), this.vertexes.indexOf(p3)]);
                        vertexes.splice(vertexes.indexOf(p2), 1);
                        rootIndex = index;
                    } else {
                        index = (index + 1) % vertexes.length;
                        if (index === rootIndex) {
                            cc.log('循环一圈未发现');
                            break;
                        }
                    }
                } else {
                    index = (index + 1) % vertexes.length;
                    if (index === rootIndex) {
                        cc.log('循环一圈未发现');
                        break;
                    }
                }
            }
            ids = ids.concat(vertexes.map(v => { return this.vertexes.indexOf(v) }));
            mesh.setIndices(ids);

            if (this.renderer.mesh != mesh) {
                // mesh 完成后再赋值给 MeshRenderer , 否则模拟器(mac)会跳出
                this.renderer.mesh = mesh;
            }
        } else {

        }
    }

    // 判断一个点是否在三角形内
    _testInTriangle(point, triA, triB, triC) {
        let AB = triB.sub(triA), AC = triC.sub(triA), BC = triC.sub(triB), AD = point.sub(triA), BD = point.sub(triB);
        return (AB.cross(AC) >= 0 ^ AB.cross(AD) < 0)  // D,C 在AB同同方向
            && (AB.cross(AC) >= 0 ^ AC.cross(AD) >= 0) // D,B 在AC同同方向
            && (BC.cross(AB) > 0 ^ BC.cross(BD) >= 0); // D,A 在BC同同方向
    }

    // 更新图片
    _applySpriteFrame() {
        // cc.log('_applySpriteFrame');
        if (this.spriteFrame) {
            const renderer = this.renderer;
            let material = renderer.getMaterial(0);
            // Reset material
            let texture = this.spriteFrame.getTexture();
            material.define("USE_DIFFUSE_TEXTURE", true);
            material.setProperty('diffuseTexture', texture);
            this.texture = texture;
            material.setProperty("diffuseColor", this.node.color)
        }
    }



    // update() {
    //     if (CC_EDITOR) {
    //         if (this.temp_refresh) {
    //             // this._applyVertexes();
    //         }
    //     }
    // }

}