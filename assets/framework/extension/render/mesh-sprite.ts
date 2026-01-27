// author: lamyoung.com
// modified : rw(mimgame.com) 2020/4/6

const gfx = cc.gfx;

let { executeInEditMode, ccclass, property } = cc._decorator
@ccclass
@executeInEditMode
export default class MeshSprite extends cc.Component {

    @property({ displayName: "Refresh" })
    _temp_refresh: boolean = true;
    @property({ displayName: "Refresh" })
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
     * !#zh Position offset
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
     * !#zh Sprite's sprite frame
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
     * !#zh Polygon vertex array
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

    // Update vertices
    _applyVertexes() {
        // cc.log('_applyVertexes');

        // Set coordinates
        const mesh = this.mesh;
        mesh.setVertices(gfx.ATTR_POSITION, this.vertexes);

        if (this.texture) {
            let uvs = [];
            // Calculate uv
            for (const pt of this.vertexes) {
                const vx = (pt.x + this.texture.width / 2 + this.offset.x) / this.texture.width;
                const vy = 1.0 - (pt.y + this.texture.height / 2 + this.offset.y) / this.texture.height
                uvs.push(cc.v2(vx, vy));
            }
            mesh.setVertices(gfx.ATTR_UV0, uvs);
        }

        if (this.vertexes.length >= 3) {
            // Calculate vertex indices
            let ids = [];
            const vertexes = [].concat(this.vertexes);

            // Polygon cutting, complex intersecting polygons not implemented, ensure vertices are in order and lines don't intersect
            let index = 0, rootIndex = -1;
            while (vertexes.length > 3) {
                const p1 = vertexes[index];
                const p2 = vertexes[(index + 1) % vertexes.length];
                const p3 = vertexes[(index + 2) % vertexes.length];

                const v1 = p2.sub(p1);
                const v2 = p3.sub(p2);
                if (v1.cross(v2) >= 0) {
                    // Is convex point
                    let isIn = false;
                    for (const p_t of vertexes) {
                        if (p_t !== p1 && p_t !== p2 && p_t !== p3 && this._testInTriangle(p_t, p1, p2, p3)) {
                            // Other point is inside triangle
                            isIn = true;
                            break;
                        }
                    }
                    if (!isIn) {
                        // Ear clipping, is convex and no other points inside triangle
                        ids = ids.concat([this.vertexes.indexOf(p1), this.vertexes.indexOf(p2), this.vertexes.indexOf(p3)]);
                        vertexes.splice(vertexes.indexOf(p2), 1);
                        rootIndex = index;
                    } else {
                        index = (index + 1) % vertexes.length;
                        if (index === rootIndex) {
                            cc.log('Looped once without finding');
                            break;
                        }
                    }
                } else {
                    index = (index + 1) % vertexes.length;
                    if (index === rootIndex) {
                        cc.log('Looped once without finding');
                        break;
                    }
                }
            }
            ids = ids.concat(vertexes.map(v => { return this.vertexes.indexOf(v) }));
            mesh.setIndices(ids);

            if (this.renderer.mesh != mesh) {
                // Assign to MeshRenderer after mesh is complete, otherwise simulator (mac) will crash
                this.renderer.mesh = mesh;
            }
        } else {

        }
    }

    // Check if a point is inside a triangle
    _testInTriangle(point, triA, triB, triC) {
        let AB = triB.sub(triA), AC = triC.sub(triA), BC = triC.sub(triB), AD = point.sub(triA), BD = point.sub(triB);
        return (AB.cross(AC) >= 0 ^ AB.cross(AD) < 0)  // D,C are on same side of AB
            && (AB.cross(AC) >= 0 ^ AC.cross(AD) >= 0) // D,B are on same side of AC
            && (BC.cross(AB) > 0 ^ BC.cross(BD) >= 0); // D,A are on same side of BC
    }

    // Update sprite
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