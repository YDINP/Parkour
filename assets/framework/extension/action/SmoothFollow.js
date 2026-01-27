/*
 * cc.Follow is a follow action which makes its target follows another node.
 *
 * @example
 * //example
 * //Instead of using cc.Camera as a "follower", use this action instead.
 * layer.runAction(cc.follow(hero));
 *
 * @property {Number}  leftBoundary - world leftBoundary.
 * @property {Number}  rightBoundary - world rightBoundary.
 * @property {Number}  topBoundary - world topBoundary.
 * @property {Number}  bottomBoundary - world bottomBoundary.
 *
 * @param {cc.Node} followedNode
 * @param {Rect} rect
 * @example
 * // creates the action with a set boundary
 * var followAction = new cc.Follow(node, cc.rect(0, 0, s.width * 2 - 100, s.height));
 * this.runAction(followAction);
 *
 * // creates the action with no boundary set
 * var followAction = new cc.Follow(node);
 * this.runAction(followAction);
 *
 * @class
 * @extends Action
 */
cc.SmoothFollow = cc.Class({
    name: 'cc.SmoothFollow',
    extends: cc.Action,

    /*
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * creates the action with a set boundary. <br/>
     * creates the action with no boundary set.
     * @param {cc.Node} followedNode
     * @param {Rect} rect
     */
    ctor: function (followedNode, rect, moveSpeed, offset) {
        // node to follow
        this._followedNode = null;
        this._followOffset = offset || cc.Vec2.ZERO;
        // whether camera should be limited to certain area
        this._boundarySet = false;
        // if screen size is bigger than the boundary - update not needed
        this._boundaryFullyCovered = false;
        // fast access to the screen dimensions
        this._halfScreenSize = null;
        this._fullScreenSize = null;

        this.leftBoundary = 0.0;
        this.rightBoundary = 0.0;
        this.topBoundary = 0.0;
        this.bottomBoundary = 0.0;
        this._worldRect = cc.rect(0, 0, 0, 0);
        this.moveSpeed = 0;

        if (followedNode)
            rect ? this.initWithTarget(followedNode, rect, moveSpeed)
                : this.initWithTarget(followedNode, moveSpeed);
    },

    clone: function () {
        var action = new cc.Follow();
        var locRect = this._worldRect;
        var rect = new cc.Rect(locRect.x, locRect.y, locRect.width, locRect.height);
        action.initWithTarget(this.moveSpeed, this._followedNode, rect);
        return action;
    },

    /*
     * Get whether camera should be limited to certain area.
     *
     * @return {Boolean}
     */
    isBoundarySet: function () {
        return this._boundarySet;
    },

    /*
     * alter behavior - turn on/off boundary.
     *
     * @param {Boolean} value
     */
    setBoudarySet: function (value) {
        this._boundarySet = value;
    },



    /*
     * initializes the action with a set boundary.
     *
     * @param {cc.Node} followedNode
     * @param {Rect} [rect=]
     * @return {Boolean}
     */
    initWithTarget: function (followedNode, rect, moveSpeed) {
        if (!followedNode) {
            cc.errorID(1022);
            return false;
        }

        var _this = this;
        _this.moveSpeed = moveSpeed || 0.05;
        rect = rect || cc.rect(0, 0, 0, 0);
        _this._followedNode = followedNode;
        _this._worldRect = rect;





        var winSize = cc.winSize;
        _this._fullScreenSize = cc.v2(winSize.width, winSize.height);
        _this._halfScreenSize = _this._fullScreenSize.mul(0.5);
        _this.updateBoundary(rect);

        return true;
    },

    updateBoundary: function (rect) {
        var _this = this;
        _this._boundaryFullyCovered = false;
        _this._boundarySet = !(rect.width === 0 && rect.height === 0);
        if (_this._boundarySet) {
            _this.leftBoundary = -((rect.x + rect.width) - _this._fullScreenSize.x);
            _this.rightBoundary = -rect.x;
            _this.topBoundary = -rect.y;
            _this.bottomBoundary = -((rect.y + rect.height) - _this._fullScreenSize.y);

            if (_this.rightBoundary < _this.leftBoundary) {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                _this.rightBoundary = _this.leftBoundary = (_this.leftBoundary + _this.rightBoundary) / 2;
            }
            if (_this.topBoundary < _this.bottomBoundary) {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                _this.topBoundary = _this.bottomBoundary = (_this.topBoundary + _this.bottomBoundary) / 2;
            }

            if ((_this.topBoundary === _this.bottomBoundary) && (_this.leftBoundary === _this.rightBoundary))
                _this._boundaryFullyCovered = true;
        }
    },

    step: function (dt) {
        var targetWorldPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        var followedWorldPos = this._followedNode.convertToWorldSpaceAR(cc.Vec2.ZERO.add(this._followOffset));
        // compute the offset between followed and target node
        var delta = targetWorldPos.sub(followedWorldPos);
        var tempPos = this.target.parent.convertToNodeSpaceAR(delta.add(this._halfScreenSize));

        let pos
        if (this._boundarySet) {
            // whole map fits inside a single screen, no need to modify the position - unless map boundaries are increased
            if (this._boundaryFullyCovered)
                return;

            pos = cc.v2(cc.misc.clampf(tempPos.x, this.leftBoundary, this.rightBoundary), cc.misc.clampf(tempPos.y, this.bottomBoundary, this.topBoundary));
        } else {
            pos = cc.v2(tempPos.x, tempPos.y);
        }

        let moveVec = cc.Vec2.ZERO;
        let oldPos = this.target.position;
        moveVec = pos.sub(oldPos)
        let dist = moveVec.mag();
        if (dist > 1) {
            moveVec.mulSelf(this.moveSpeed);
            oldPos.addSelf(moveVec);
            // Fix tilemap vertical line artifacts by snapping to integer coordinates
            oldPos.x = Math.round(oldPos.x);
            oldPos.y = Math.round(oldPos.y);
            this.target.setPosition(oldPos);
        }
    },

    isDone: function () {
        return (!this._followedNode.activeInHierarchy);
    },

    stop: function () {
        this.target = null;
        cc.Action.prototype.stop.call(this);
    }
});

/**
 * !#en Create a follow action which makes its target follows another node.
 * !#zh 追踪目标节点的位置。
 * @method smoothFollow
 * @param {cc.Node} followedNode
 * @param {cc.Rect} rect
 * @param {number}  moveSpeed
 * @return {Action|Null} returns the cc.Follow object on success
 * @example
 * // example
 * // creates the action with a set boundary
 * var followAction = cc.follow(targetNode, cc.rect(0, 0, screenWidth * 2 - 100, screenHeight));
 * node.runAction(followAction);
 *
 * // creates the action with no boundary set
 * var followAction = cc.follow(targetNode);
 * node.runAction(followAction);
 */
cc.smoothFollow = function (followedNode, rect, moveSpeed, offset) {
    return new cc.SmoothFollow(followedNode, rect, moveSpeed, offset);
};
