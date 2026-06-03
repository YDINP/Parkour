/*
 * KakaoRankView.js  —  Cocos Creator 2.4.x 카카오 리더보드 (탭형, prefab 기반)
 * ─────────────────────────────────────────────────────────────────────────────
 * 카카오SDK 샘플(cocos-kakao-leaderboard) 의 rankViewCmpt 를 CC2.x 로 포팅한 것.
 * 이전 코드렌더(cc.Graphics) 단순뷰를 대체 [Parkour] — 이번달/지난달 탭 + 초기화 안내 라벨.
 *
 * Kakao 는 showRank(랭킹 UI postMessage)을 미지원 → 게임이 getRankings/getMyRanking
 * 으로 데이터를 받아 prefab(rankView/rankItem)을 직접 채운다.
 *
 * 자산: resources/prefab/ui/kakao/{rankView,rankItem}.prefab + resources/kakao/{leaderboard,font}
 * ⚠ lbrefresh 는 cc.RichText → settings/project.json 의 excluded-modules 에서 RichText 제거 필요(완료).
 * 데이터: ./business/kakaoSdk (이 프로젝트의 카카오 래퍼). 시그니처:
 *   getRankings(seasonSeq, begin, end) -> Promise<[{playerId,rank,score,nickname}]>
 *   getMyRanking(seasonSeq)            -> Promise<{playerId,rank,score,nickname}|null>
 * 호출:  require('<경로>/KakaoRankView').open();
 * ─────────────────────────────────────────────────────────────────────────────
 */

var kakaoSdk = require('./business/kakaoSdk');

var TOP_N = 50;
var VIEW_PREFAB = 'prefab/ui/kakao/rankView';
var ITEM_PREFAB = 'prefab/ui/kakao/rankItem';
var COLOR_ACTIVE = cc.color(26, 26, 46);
var COLOR_INACTIVE = cc.color(112, 91, 80);

// Parkour = 주간 리더보드 (실제 초기화 주기 = 카카오 어드민 설정. 라벨은 표시용).
var DEFAULT_TEXT = {
    title: 'RANKING',
    curWeek: '이번주 랭킹',
    prevWeek: '지난주 랭킹',
    me: '나',
    refresh: '매주 월요일 <color=#ef6f26>00:00</color> 초기화',
};

var KakaoRankView = cc.Class({
    extends: cc.Component,

    statics: {
        TEXT: null,  // require('KakaoRankView').TEXT = { title, curWeek, prevWeek, me, refresh } 로 override

        open: function () {
            var canvas = (cc.Canvas.instance && cc.Canvas.instance.node) || cc.find('Canvas');
            if (!canvas) { cc.warn('[KakaoRankView] Canvas 없음'); return; }
            if (canvas.getChildByName('rankView')) return;
            cc.resources.load(VIEW_PREFAB, cc.Prefab, function (err, prefab) {
                if (err || !prefab) { cc.warn('[KakaoRankView] rankView prefab 로드 실패: ' + (err && err.message)); return; }
                if (canvas.getChildByName('rankView')) return;
                var node = cc.instantiate(prefab);
                node.parent = canvas;
                node.setPosition(0, 0);
                node.addComponent(KakaoRankView);
            });
        },
    },

    onLoad: function () {
        var self = this;
        var N = function (p) { return cc.find(p, self.node); };
        var T = Object.assign({}, DEFAULT_TEXT, KakaoRankView.TEXT || {});
        this._text = T;

        this._content = N('Frame/ScrollView/view/content');
        this._myRank = N('Frame/bottom/myRank/lbRank');
        this._myName = N('Frame/bottom/myRank/lbNickname');
        this._myScore = N('Frame/bottom/myRank/lbScore');

        this._markCur = N('Frame/top/curWeekCheckMark');
        this._markPrev = N('Frame/top/prevWeekCheckMark');
        this._lbCur = N('Frame/top/lbcur');
        this._lbPrev = N('Frame/top/lbprev');

        this._setLabel(N('Frame/title/titlelabel'), T.title);
        this._setLabel(this._lbCur, T.curWeek);
        this._setLabel(this._lbPrev, T.prevWeek);
        // lbrefresh: RichText(BBCode <color> 보존). 색상 마크업 없으면 기본 색으로 wrap.
        this._setText(N('Frame/top/Node/lbrefresh'), this._withRefreshColor(T.refresh));

        // dim(blockbg): 검정 반투명 + 바깥 클릭 닫기.
        var dim = N('blockbg');
        if (dim) {
            // blockbg 에 이미 Sprite(RenderComponent)가 있어 addComponent(cc.Graphics)가 null 반환
            // → g.fillColor throw → onLoad 중단되던 버그. 기존 Sprite 를 검정 반투명으로 틴트한다.
            try { dim.color = cc.color(0, 0, 0); dim.opacity = 175; } catch (e) {}
            dim.on(cc.Node.EventType.TOUCH_END, function () { self.close(); });
        }
        var frame = N('Frame');
        if (frame) frame.on(cc.Node.EventType.TOUCH_START, function () {});
        var closeBtn = N('closeBtn');
        if (closeBtn) closeBtn.on(cc.Node.EventType.TOUCH_END, function () { self.close(); });
        var btnX = N('Frame/btn_close');
        if (btnX) btnX.on(cc.Node.EventType.TOUCH_END, function () { self.close(); });

        var tabBtn = N('Frame/top/RankBtn');
        if (tabBtn) tabBtn.on(cc.Node.EventType.TOUCH_END, function () { self._toggleTab(); });

        this._currentTab = 'cur';
        this._cache = {};
        this._updateTabUI();
        this._clearList();

        cc.resources.load(ITEM_PREFAB, cc.Prefab, function (err, prefab) {
            if (err || !prefab) { cc.warn('[KakaoRankView] rankItem prefab 로드 실패: ' + (err && err.message)); }
            self._itemPrefab = prefab || null;
            self._fetchAndRender(self._currentTab);
        });
    },

    _toggleTab: function () {
        this._currentTab = this._currentTab === 'cur' ? 'prev' : 'cur';
        this._updateTabUI();
        if (this._cache[this._currentTab]) this._render(this._cache[this._currentTab]);
        else this._fetchAndRender(this._currentTab);
    },

    _updateTabUI: function () {
        var cur = this._currentTab === 'cur';
        if (this._markCur) this._markCur.active = cur;
        if (this._markPrev) this._markPrev.active = !cur;
        if (this._lbCur) this._lbCur.color = cur ? COLOR_ACTIVE : COLOR_INACTIVE;
        if (this._lbPrev) this._lbPrev.color = cur ? COLOR_INACTIVE : COLOR_ACTIVE;
    },

    _clearList: function () { if (this._content) this._content.removeAllChildren(); },

    // 데이터 fetch — 이 프로젝트 래퍼(business/kakaoSdk)는 이미 평탄화된 배열/객체를 반환.
    _fetchAndRender: function (tab) {
        var self = this;
        var seasonSeq = tab === 'cur' ? 0 : -1;
        Promise.all([
            kakaoSdk.getRankings(seasonSeq, 1, TOP_N),
            kakaoSdk.getMyRanking(seasonSeq),
        ]).then(function (results) {
            if (!cc.isValid(self.node)) return;
            var rows = results[0] || [];
            var my = results[1] || null;
            var data = { rows: rows, my: my };
            self._cache[tab] = data;
            if (self._currentTab === tab) self._render(data);
        }).catch(function (err) {
            if (!cc.isValid(self.node)) return;
            cc.warn('[KakaoRankView] fetch 실패: ' + err);
        });
    },

    _render: function (data) {
        this._renderMy(data.my);
        this._renderRows(data.rows, data.my && data.my.playerId);
    },

    _renderMy: function (my) {
        var me = this._text.me;
        var name = my && my.nickname;
        this._setLabel(this._myName, name ? (me + ' (' + name + ')') : me);
        if (!my) {
            this._setLabel(this._myRank, '-');
            this._setLabel(this._myScore, '0');
            return;
        }
        this._setLabel(this._myRank, my.rank > 0 ? ('' + my.rank) : '-');
        this._setLabel(this._myScore, this._fmt(my.score || 0));
    },

    _renderRows: function (rows, myPlayerId) {
        this._clearList();
        if (!this._content || !this._itemPrefab) return;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i] || {};
            var rank = row.rank || (i + 1);
            var item = cc.instantiate(this._itemPrefab);

            var isTop3 = rank >= 1 && rank <= 3;
            var lnRank = cc.find('frame/lnRank', item);
            this._setLabel(lnRank, '' + rank);
            if (lnRank) lnRank.active = !isTop3;
            var frame = cc.find('frame', item);
            if (frame) for (var m = 1; m <= 3; m++) {
                var medal = frame.getChildByName('' + m);
                if (medal) medal.active = (rank === m);
            }

            this._setLabel(cc.find('lbNickname', item), row.nickname || ('Player' + rank));
            this._setLabel(cc.find('lbScore', item), this._fmt(row.score || 0));

            if (myPlayerId && row.playerId === myPlayerId) item.color = cc.color(255, 245, 200);
            this._content.addChild(item);
        }
    },

    _fmt: function (n) { return ('' + n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); },

    _setLabel: function (node, str) {
        if (!node) return;
        var l = node.getComponent(cc.Label);
        if (l) l.string = (str == null ? '' : ('' + str));
    },

    // Label / RichText 자동 감지. BBCode 마크업(<color> 등)은 RichText 로만 정상 렌더.
    _setText: function (node, str) {
        if (!node) return;
        var v = (str == null ? '' : ('' + str));
        var l = node.getComponent(cc.Label);
        if (l) { l.string = v; return; }
        var r = node.getComponent(cc.RichText);
        if (r) { r.string = v; return; }
    },

    _withRefreshColor: function (text) {
        if (!text) return text || '';
        if (text.indexOf('<color=') >= 0) return text;
        return '<color=#705650>' + text + '</color>';
    },

    close: function () { if (cc.isValid(this.node)) this.node.destroy(); },
});

module.exports = KakaoRankView;
