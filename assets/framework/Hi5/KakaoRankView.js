/**
 * 카카오 리더보드 뷰 (CC 2.4.13) — 프리팹/외부에셋 의존 0, 코드로 직접 렌더.
 *
 * 카카오는 showRank(native UI) 미지원 → 게임이 getRankings/getMyRanking 로 직접 그린다.
 * 프로젝트 간 prefab/폰트/이미지 UUID 결합이 깨지기 쉬워(114-shiba 파일럿 확정)
 * cc.Label + cc.Graphics 로만 구성된 자족형 다이얼로그로 렌더한다.
 *
 * i18n: Parkour 는 LocalizationManager(@key, ko/en/cn) 사용. window.LocalizationManager 가
 *   setupHtmlBridge 에서 전역 노출되므로 그것을 경유하고, 미초기화 시 fallback 문자열 사용.
 *
 * 사용:  require('KakaoRankView').open();
 */
var kakaoSdk = require('./business/kakaoSdk');

var TOP_N = 50;
var COLOR_DIM = cc.color(0, 0, 0, 175);
var COLOR_FRAME = cc.color(255, 255, 255);
var COLOR_TEXT = cc.color(40, 40, 60);
var COLOR_ME = cc.color(255, 245, 200);

function t(key, fallback) {
    try {
        var LM = window['LocalizationManager'];
        if (LM && typeof LM.getText === 'function') {
            var v = LM.getText(key);
            // getText 는 미발견 시 키(접두사 제거)를 그대로 반환 → fallback 으로 대체
            var bare = key.replace('@', '');
            if (v && v !== bare && v !== key) return v;
        }
    } catch (e) {}
    return fallback;
}

function fmt(n) { return ('' + (n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function makeLabel(parent, str, fontSize, color, x, y, anchorX) {
    var node = new cc.Node('lb');
    var lb = node.addComponent(cc.Label);
    lb.string = str == null ? '' : ('' + str);
    lb.fontSize = fontSize;
    lb.lineHeight = fontSize + 4;
    node.color = color || COLOR_TEXT;
    node.anchorX = (anchorX == null ? 0.5 : anchorX);
    node.x = x; node.y = y;
    parent.addChild(node);
    return lb;
}

var KakaoRankView = cc.Class({
    extends: cc.Component,

    statics: {
        open: function () {
            var canvas = (cc.Canvas.instance && cc.Canvas.instance.node) || cc.find('Canvas');
            if (!canvas) { cc.warn('[KakaoRankView] Canvas 없음'); return; }
            if (canvas.getChildByName('kakaoRankView')) return;
            var node = new cc.Node('kakaoRankView');
            node.setContentSize(cc.winSize.width, cc.winSize.height);
            node.parent = canvas;
            node.setPosition(0, 0);
            node.zIndex = cc.macro.MAX_ZINDEX;
            node.addComponent(KakaoRankView);
        },
    },

    onLoad: function () {
        var self = this;
        var W = cc.winSize.width, H = cc.winSize.height;

        // dim (바깥 클릭 닫기)
        var dim = new cc.Node('dim');
        dim.setContentSize(W, H);
        var dg = dim.addComponent(cc.Graphics);
        dg.fillColor = COLOR_DIM;
        dg.rect(-W / 2, -H / 2, W, H);
        dg.fill();
        dim.addComponent(cc.BlockInputEvents);
        dim.on(cc.Node.EventType.TOUCH_END, function () { self.close(); });
        this.node.addChild(dim);

        // Frame
        var fw = Math.min(640, W * 0.86), fh = Math.min(900, H * 0.8);
        var frame = new cc.Node('Frame');
        frame.setContentSize(fw, fh);
        var fg = frame.addComponent(cc.Graphics);
        fg.fillColor = COLOR_FRAME;
        fg.roundRect(-fw / 2, -fh / 2, fw, fh, 24);
        fg.fill();
        frame.on(cc.Node.EventType.TOUCH_START, function () {}); // 안쪽 터치 스왈로
        this.node.addChild(frame);

        // 타이틀
        makeLabel(frame, t('@rank_title', 'Ranking'), 44, COLOR_TEXT, 0, fh / 2 - 56);

        // 닫기 버튼
        var btnX = new cc.Node('btn_x');
        makeLabel(btnX, 'X', 40, cc.color(120, 120, 140), 0, 0);
        btnX.x = fw / 2 - 44; btnX.y = fh / 2 - 56;
        btnX.setContentSize(60, 60);
        btnX.on(cc.Node.EventType.TOUCH_END, function () { self.close(); });
        frame.addChild(btnX);

        // 내 랭킹 (하단 고정)
        this._myLabel = makeLabel(frame, '', 30, COLOR_TEXT, 0, -fh / 2 + 44);

        // 리스트 ScrollView
        var listTop = fh / 2 - 110;
        var listH = (fh - 110 - 90);
        var sv = new cc.Node('ScrollView');
        sv.setContentSize(fw - 40, listH);
        sv.y = (listTop - listH / 2);
        var scroll = sv.addComponent(cc.ScrollView);
        var view = new cc.Node('view');
        view.setContentSize(fw - 40, listH);
        view.addComponent(cc.Mask);
        sv.addChild(view);
        var content = new cc.Node('content');
        content.setContentSize(fw - 40, listH);
        content.anchorY = 1;
        content.y = listH / 2;
        view.addChild(content);
        scroll.content = content;
        scroll.vertical = true;
        scroll.horizontal = false;
        frame.addChild(sv);
        this._content = content;
        this._rowW = fw - 40;

        makeLabel(content, t('@rank_loading', 'Loading'), 28, COLOR_TEXT, 0, -40);

        this._fetchAndRender();
    },

    _fetchAndRender: function () {
        var self = this;
        Promise.all([
            kakaoSdk.getRankings(0, 1, TOP_N),
            kakaoSdk.getMyRanking(0),
        ]).then(function (results) {
            if (!cc.isValid(self.node)) return;
            var rows = results[0] || [];
            var my = results[1] || null;
            self._render(rows, my);
        }).catch(function (err) {
            if (!cc.isValid(self.node)) return;
            cc.warn('[KakaoRankView] fetch 실패: ' + err);
            self._content.removeAllChildren();
            makeLabel(self._content, t('@rank_load_failed', 'Failed to load.'), 28, COLOR_TEXT, 0, -40);
        });
    },

    _render: function (rows, my) {
        this._content.removeAllChildren();
        var rowH = 64;
        var total = rows.length;
        if (total === 0) {
            makeLabel(this._content, t('@rank_empty', 'No ranking yet.'), 28, COLOR_TEXT, 0, -40);
        }
        this._content.height = Math.max(this._content.parent.height, total * rowH);
        var myId = my && my.playerId;

        for (var i = 0; i < total; i++) {
            var row = rows[i] || {};
            var rank = row.rank || (i + 1);
            var y = -(i * rowH) - rowH / 2;

            var rowNode = new cc.Node('row');
            rowNode.setContentSize(this._rowW, rowH - 6);
            rowNode.y = y;
            if (myId && row.playerId === myId) {
                var bg = rowNode.addComponent(cc.Graphics);
                bg.fillColor = COLOR_ME;
                bg.roundRect(-this._rowW / 2, -(rowH - 6) / 2, this._rowW, rowH - 6, 10);
                bg.fill();
            }
            makeLabel(rowNode, '' + rank, 30, COLOR_TEXT, -this._rowW / 2 + 40, 0, 0.5);
            makeLabel(rowNode, row.nickname || ('Player' + rank), 28, COLOR_TEXT, -this._rowW / 2 + 90, 0, 0);
            makeLabel(rowNode, fmt(row.score), 28, COLOR_TEXT, this._rowW / 2 - 30, 0, 1);
            this._content.addChild(rowNode);
        }

        // 내 랭킹 하단 라벨
        var me = t('@rank_me', 'Me');
        if (my) {
            var name = my.nickname || '';
            this._myLabel.string = (name ? (me + ' (' + name + ') ') : (me + ' ')) +
                (my.rank > 0 ? ('#' + my.rank) : '-') + '   ' + fmt(my.score);
        } else {
            this._myLabel.string = me + '  -';
        }
    },

    close: function () { if (cc.isValid(this.node)) this.node.destroy(); },
});

module.exports = KakaoRankView;
