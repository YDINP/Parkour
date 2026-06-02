/**
 * Indicator Manager for Cocos Creator 2.x (싱글톤)
 *
 * 카카오 리워드 광고 로딩 중 표시할 인디케이터. 프리팹/에셋 UUID 결합이 프로젝트 간
 * 깨지기 쉬워(114-shiba 파일럿 확정) 노드를 코드로 직접 생성한다(프리팹/에셋 의존 0).
 *   - 반투명 풀스크린 오버레이(터치 차단) + 중앙 회전 스피너(cc.Graphics 링)
 *   - show(parent, cb): 씬 루트(다이얼로그와 동일 부모)에 부착, zIndex=MAX → 최상단
 *   - hide(): 노드 제거
 */
var IndicatorManager = (function () {
    var indicatorNode = null;

    // 1x1 흰색 SpriteFrame (오버레이용) — 텍스처 에셋 의존 없이 코드로 생성.
    function makeWhiteFrame() {
        var tex = new cc.Texture2D();
        var data = new Uint8Array([255, 255, 255, 255]);
        tex.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
        return new cc.SpriteFrame(tex);
    }

    function buildIndicator() {
        var node = new cc.Node('indicator');

        // 반투명 오버레이 (터치 차단)
        var bg = new cc.Node('overlay');
        var size = cc.winSize;
        bg.setContentSize(size.width, size.height);
        var sprite = bg.addComponent(cc.Sprite);
        sprite.spriteFrame = makeWhiteFrame();
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bg.color = cc.color(0, 0, 0);
        bg.opacity = 120;
        bg.addComponent(cc.BlockInputEvents);
        node.addChild(bg);

        // 회전 스피너 (Graphics 링)
        var spin = new cc.Node('loading');
        var g = spin.addComponent(cc.Graphics);
        g.lineWidth = 8;
        g.strokeColor = cc.color(255, 255, 255);
        g.arc(0, 0, 28, Math.PI * 0.25, Math.PI * 1.75, false);
        g.stroke();
        node.addChild(spin);

        // 회전 애니메이션 (컴포넌트 없이 tween)
        cc.tween(spin)
            .repeatForever(cc.tween().by(0.8, { angle: -360 }))
            .start();

        return node;
    }

    return {
        show: function (parent, callback) {
            // stale 참조 방어: 씬 전환 등으로 노드가 파괴됐는데 참조만 남은 경우 정리 후 재생성.
            if (indicatorNode && !cc.isValid(indicatorNode)) { indicatorNode = null; }
            if (indicatorNode) { if (callback) callback(); return; }
            indicatorNode = buildIndicator();
            var scene = cc.director.getScene && cc.director.getScene();
            var targetParent = parent || scene || cc.find('Canvas');
            if (targetParent) {
                targetParent.addChild(indicatorNode);
                if (targetParent === scene) {
                    var size = cc.winSize;
                    indicatorNode.x = size.width / 2;
                    indicatorNode.y = size.height / 2;
                }
                indicatorNode.zIndex = cc.macro.MAX_ZINDEX;
                if (typeof indicatorNode.setSiblingIndex === 'function') {
                    indicatorNode.setSiblingIndex(targetParent.childrenCount - 1);
                }
            }
            if (callback) callback();
        },

        hide: function () {
            if (indicatorNode) {
                if (cc.isValid(indicatorNode)) indicatorNode.destroy();
                indicatorNode = null;
            }
        },

        isShowing: function () {
            return indicatorNode !== null && cc.isValid(indicatorNode);
        }
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndicatorManager;
} else {
    window.IndicatorManager = IndicatorManager;
}
