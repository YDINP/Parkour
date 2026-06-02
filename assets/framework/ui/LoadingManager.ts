const { ccclass, property, menu } = cc._decorator;

// SDK-native 인디케이터(hi5-sdk cocos-loading-indicator 샘플의 cc2 포트, 프리팹/에셋 의존 0).
//   프로젝트 전역 로딩 표시를 이 하나로 통일 — 모든 Loading.* 호출이 네이티브 스타일 인디케이터로 렌더된다.
const IndicatorManager = require("../Hi5/control/indicatorManager");

export var Loading: LoadingManager = null;

@ccclass
@menu("mimgame/UI/LoadingManager")
export default class LoadingManager extends cc.Component {

    // ── 레거시 프리팹 슬롯 (씬 참조 보존용, 더 이상 렌더에 사용하지 않음) ──
    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    @property
    rotate: boolean = true;

    _callback: any = null;
    _target: any = null;

    onLoad() {
        Loading = this;
        if (CC_DEBUG) {
            window['loading'] = this;
        }
    }

    dealyClose() {
        this.hide();
        if (this._callback) {
            this._callback.call(this._target)
        }
    }

    /**
     * 로딩 표시. SDK-native 인디케이터(IndicatorManager)에 위임.
     * @param timeout >0 이면 해당 초 후 자동 hide (+ callback)
     * @param text   (미사용) 네이티브 인디케이터는 텍스트 없음 — 시그니처 호환용으로만 유지
     * @param modal  (미사용) 인디케이터는 항상 입력 차단(모달)
     */
    show(timeout, text = null, modal = true, callback = null, target = null) {
        this._callback = callback;
        this._target = target;
        IndicatorManager.show(this.node, null);
        if (timeout > 0) {
            this.unschedule(this.dealyClose);
            this.scheduleOnce(this.dealyClose, timeout)
        }
        console.log("loading enter----------")
    }

    hide() {
        IndicatorManager.hide();
        this.unschedule(this.dealyClose);
        console.log("loading exit----------")
    }

    /**
     * 심플 인디케이터 표시 (타임아웃 없이, hideIndicator()로 숨김)
     */
    indicator() {
        IndicatorManager.show(this.node, null);
        this.unschedule(this.dealyClose);
        console.log("[Indicator] show");
    }

    /**
     * 인디케이터 숨기기
     */
    hideIndicator() {
        this.hide();
        console.log("[Indicator] hide");
    }

    onDestroy() {
        Loading = null;
    }

}
