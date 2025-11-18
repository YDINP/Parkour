namespace cc {

    interface VertexFormatElement {
        name: string;
        type: number;
        num: number;
        normalize?: true;
    }

    export class VertexFormat {
        constructor(arr: VertexFormatElement[]);
    }

    export var gfx = {
        ATTR_BITANGENT: "a_bitangent",
        ATTR_COLOR: "a_color",
        ATTR_COLOR0: "a_color0",
        ATTR_COLOR1: "a_color1",
        ATTR_JOINTS: "a_joints",
        ATTR_NORMAL: "a_normal",
        ATTR_POSITION: "a_position",
        ATTR_TANGENT: "a_tangent",
        ATTR_TYPE_FLOAT32: 5126,
        ATTR_TYPE_INT8: 5120,
        ATTR_TYPE_INT16: 5122,
        ATTR_TYPE_INT32: 5124,
        ATTR_TYPE_UINT8: 5121,
        ATTR_TYPE_UINT16: 5123,
        ATTR_TYPE_UINT32: 5125,
        ATTR_UV: "a_uv",
        ATTR_UV0: "a_uv0",
        ATTR_UV1: "a_uv1",
        ATTR_UV2: "a_uv2",
        ATTR_UV3: "a_uv3",
        ATTR_UV4: "a_uv4",
        ATTR_UV5: "a_uv5",
        ATTR_UV6: "a_uv6",
        ATTR_UV7: "a_uv7",
        ATTR_WEIGHTS: "a_weights",
        BLEND_CONSTANT_ALPHA: 32771,
        BLEND_CONSTANT_COLOR: 32769,
        BLEND_DST_ALPHA: 772,
        BLEND_DST_COLOR: 774,
        BLEND_FUNC_ADD: 32774,
        BLEND_FUNC_REVERSE_SUBTRACT: 32779,
        BLEND_FUNC_SUBTRACT: 32778,
        BLEND_ONE: 1,
        BLEND_ONE_MINUS_CONSTANT_ALPHA: 32772,
        BLEND_ONE_MINUS_CONSTANT_COLOR: 32770,
        BLEND_ONE_MINUS_DST_ALPHA: 773,
        BLEND_ONE_MINUS_DST_COLOR: 775,
        BLEND_ONE_MINUS_SRC_ALPHA: 771,
        BLEND_ONE_MINUS_SRC_COLOR: 769,
        BLEND_SRC_ALPHA: 770,
        BLEND_SRC_ALPHA_SATURATE: 776,
        BLEND_SRC_COLOR: 768,
        BLEND_ZERO: 0,
        CULL_BACK: 1029,
        CULL_FRONT: 1028,
        CULL_FRONT_AND_BACK: 1032,
        CULL_NONE: 0,
        DS_FUNC_ALWAYS: 519,
        DS_FUNC_EQUAL: 514,
        DS_FUNC_GEQUAL: 518,
        DS_FUNC_GREATER: 516,
        DS_FUNC_LEQUAL: 515,
        DS_FUNC_LESS: 513,
        DS_FUNC_NEVER: 512,
        DS_FUNC_NOTEQUAL: 517,
        FILTER_LINEAR: 1,
        FILTER_NEAREST: 0,
        INDEX_FMT_UINT8: 5121,
        INDEX_FMT_UINT16: 5123,
        INDEX_FMT_UINT32: 5125,
        PT_LINES: 1,
        PT_LINE_LOOP: 2,
        PT_LINE_STRIP: 3,
        PT_POINTS: 0,
        PT_TRIANGLES: 4,
        PT_TRIANGLE_FAN: 6,
        PT_TRIANGLE_STRIP: 5,
        RB_FMT_D16: 33189,
        RB_FMT_D24S8: 34041,
        RB_FMT_RGB5_A1: 32855,
        RB_FMT_RGB565: 36194,
        RB_FMT_RGBA4: 32854,
        RB_FMT_S8: 36168,
        STENCIL_DISABLE: 0,
        STENCIL_ENABLE: 1,
        STENCIL_INHERIT: 2,
        STENCIL_OP_DECR: 7683,
        STENCIL_OP_DECR_WRAP: 34056,
        STENCIL_OP_INCR: 7682,
        STENCIL_OP_INCR_WRAP: 34055,
        STENCIL_OP_INVERT: 5386,
        STENCIL_OP_KEEP: 7680,
        STENCIL_OP_REPLACE: 7681,
        STENCIL_OP_ZERO: 0,
        TEXTURE_FMT_111110F: 22,
        TEXTURE_FMT_A8: 9,
        TEXTURE_FMT_D16: 25,
        TEXTURE_FMT_D24S8: 27,
        TEXTURE_FMT_D32: 26,
        TEXTURE_FMT_L8: 10,
        TEXTURE_FMT_L8_A8: 11,
        TEXTURE_FMT_R4_G4_B4_A4: 14,
        TEXTURE_FMT_R5_G5_B5_A1: 13,
        TEXTURE_FMT_R5_G6_B5: 12,
        TEXTURE_FMT_R32F: 21,
        TEXTURE_FMT_RGB8: 15,
        TEXTURE_FMT_RGB16F: 17,
        TEXTURE_FMT_RGB32F: 19,
        TEXTURE_FMT_RGBA8: 16,
        TEXTURE_FMT_RGBA16F: 18,
        TEXTURE_FMT_RGBA32F: 20,
        TEXTURE_FMT_RGBA_DXT1: 1,
        TEXTURE_FMT_RGBA_DXT3: 2,
        TEXTURE_FMT_RGBA_DXT5: 3,
        TEXTURE_FMT_RGBA_ETC2: 29,
        TEXTURE_FMT_RGBA_PVRTC_2BPPV1: 6,
        TEXTURE_FMT_RGBA_PVRTC_4BPPV1: 8,
        TEXTURE_FMT_RGB_DXT1: 0,
        TEXTURE_FMT_RGB_ETC1: 4,
        TEXTURE_FMT_RGB_ETC2: 28,
        TEXTURE_FMT_RGB_PVRTC_2BPPV1: 5,
        TEXTURE_FMT_RGB_PVRTC_4BPPV1: 7,
        TEXTURE_FMT_SRGB: 23,
        TEXTURE_FMT_SRGBA: 24,
        USAGE_DYNAMIC: 35048,
        USAGE_STATIC: 35044,
        USAGE_STREAM: 35040,
        WRAP_CLAMP: 33071,
        WRAP_MIRROR: 33648,
        WRAP_REPEAT: 10497,
        //FrameBuffer
        //IndexBuffer
        // Program
        //RenderBuffer
        //Texture
        //Texture2D
        //TextureCube
        // VertexBuffer
        //VertexFormat
        // static ATTR_POSITION: any;
        // static ATTR_TYPE_FLOAT32: any;
        // static ATTR_UV0: any;
        VertexFormat = VertexFormat
        // VertexFormat(arr: VertexFormatElement[]);

    }
    interface VertexFormat {

    }
}
