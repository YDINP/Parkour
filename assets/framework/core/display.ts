
export default class display {

    static _width: number = 0;
    static _height: number = 0;


    static _hw: number = 0;
    static _hh: number = 0;

    static _inited: boolean = false;

    static lazyInit() {
        if (!this._inited) {

            let size = cc.winSize;
            this._width = size.width;
            this._height = size.height;
            this._hw = this._width / 2
            this._hh = this._height / 2
            this._inited = true;
        }
    }

    static get center() {
        this.lazyInit();
        return cc.v2(this.hw, this.hh);
    }

    static get leftTop() {
        this.lazyInit();
        return cc.v2(0, this._height);
    }


    static get hw() {
        this.lazyInit();
        return this._hw;
    }


    static get hh() {
        this.lazyInit();
        return this._hh;
    }

    static get height() {
        this.lazyInit();
        return this._height;
    }

    static get width() {
        this.lazyInit();
        return this._width;
    }


}