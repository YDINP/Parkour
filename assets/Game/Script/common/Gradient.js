// GRID_TYPE enum
var GRID_TYPE = cc.Enum({
  GRID_HORIZONTAL: 0,
  GRID_VERTICAL: 1
});

cc.Class({
  extends: cc.Component,
  
  editor: {
    executeInEditMode: true
  },
  
  properties: {
    invert: {
      default: false,
      tooltip: "是否反向",
      notify: function() {
        this.markColorDirty();
      }
    },
    
    dir: {
      default: GRID_TYPE.GRID_VERTICAL,
      type: GRID_TYPE,
      notify: function() {
        this.markColorDirty();
      }
    },
    
    downColor: {
      default: cc.Color.WHITE,
      notify: function() {
        this.markColorDirty();
      }
    },
    
    upColor: {
      default: cc.Color.WHITE,
      notify: function() {
        this.markColorDirty();
      }
    },
    
    gradientPosition: {
      default: 0.5,
      tooltip: "그라데이션 위치 (작을수록 위쪽 색상 영역 넓음)",
      range: [0, 1],
      slide: true,
      notify: function() {
        this.markColorDirty();
      }
    }
  },
  
  onLoad: function() {
    var render = this.getComponent(cc.RenderComponent);
    render["_updateColor"] = this._updateColor.bind(this);
    this.markColorDirty();
  },
  
  markColorDirty: function() {
    var render = this.getComponent(cc.RenderComponent);
    if (render && render.node) {
      render.node["_renderFlag"] |= cc.RenderFlow.FLAG_COLOR | cc.RenderFlow.FLAG_OPACITY;
    }
  },
  
  // 두 색상 사이의 중간 색상 계산
  lerpColor: function(color1, color2, ratio) {
    return cc.color(
      color1.r + (color2.r - color1.r) * ratio,
      color1.g + (color2.g - color1.g) * ratio,
      color1.b + (color2.b - color1.b) * ratio,
      color1.a + (color2.a - color1.a) * ratio
    );
  },
  
  _updateColor: function() {
    var colors = [];
    
    // 2색 그라데이션 + 위치 조정
    // gradientPosition = 아래쪽 정점이 얼마나 downColor에 가까운지
    var topVertexColor = this.upColor;
    var bottomVertexColor = this.lerpColor(this.upColor, this.downColor, this.gradientPosition);
    
    // 정점 순서: [왼쪽아래, 오른쪽아래, 왼쪽위, 오른쪽위]
    switch(this.dir) {
      case GRID_TYPE.GRID_VERTICAL:
        colors = [bottomVertexColor, bottomVertexColor, topVertexColor, topVertexColor];
        break;
      case GRID_TYPE.GRID_HORIZONTAL:
        colors = [bottomVertexColor, topVertexColor, bottomVertexColor, topVertexColor];
        break;
    }
    
    if (this.invert) {
      colors = colors.reverse();
    }
    
    var cmp = this.getComponent(cc.RenderComponent);
    if (!cmp) return;
    
    var _assembler = cmp['_assembler'];
    if (!(_assembler instanceof cc['Assembler2D'])) return;
    
    var uintVerts = _assembler._renderData.uintVDatas[0];
    if (!uintVerts) return;
    
    var color = this.node.color;
    var floatsPerVert = _assembler.floatsPerVert;
    var colorOffset = _assembler.colorOffset;
    var count = 0;
    
    for (var i = colorOffset, l = uintVerts.length; i < l; i += floatsPerVert) {
      uintVerts[i] = (colors[count++] || color)['_val'];
    }
    
    cmp.setVertsDirty();
  }
});

// GRID_TYPE을 전역으로 export
window.GRID_TYPE = GRID_TYPE;