import Signal from "../../core/Signal";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("mimgame/Controller/Draggable")
export default class Draggable extends cc.Component {

    onDragStart: Signal = new Signal();
    onDragMove: Signal = new Signal();
    onDragEnd: Signal = new Signal();
    onDragCancel: Signal = new Signal();

    @property({ displayName: "Allow Drag Off Screen" })
    public oosEnabled = false;

    // @property({ displayName: "Allow Drag Off Screen" })
    // public isDir = [horizontal,];

    @property({ displayName: "Allow Drag Y" })
    public yEnabled = true;


    @property
    moveBackDur: number = 0.5;

    onLoad() {

    }

    start() {


    }

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCanceled, this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCanceled, this);
    }

    offset: cc.Vec2;

    dragStartPos: cc.Vec2;

    last: cc.Vec2;


    onTouchBegan(evt) {
        let v = evt.getLocation();
        this.dragStartPos = this.node.position;
        this.onDragStart.fire(v)
        evt.stopPropagation();
        this.isDrag = false;
        this.isDragging = true;
        this.last = this.node.parent.convertToNodeSpaceAR(v);
        this.offset = this.node.position.sub(this.last);
    }

    isDrag = false;

    isDragging = false;

    onTouchMoved(evt) {
        let v = evt.getLocation()
        // console.log(this.offset);
        // this.node.position = v.sub(this.offset);
        // let heroRigidBody = this.node.getComponent(cc.RigidBody);
        // heroRigidBody.applyLinearImpulse(evt.touch.getDelta(),
        //     heroRigidBody.getWorldCenter(),
        //     true
        // );
        if (this.yEnabled) {
            let cur = this.node.parent.convertToNodeSpaceAR(v);
            let p = cur.addSelf(this.offset)
            this.node.position = p;
            this.isDrag = true;
            this.last = cur;
            return;
        }
        if (evt.touch.getDelta().x > 20) {
            let offset = cc.v2(20, evt.touch.getDelta().y);
            this.node.x += offset.x;
            // if (this.yEnabled)
            //     this.node.y += offset.y;
        } else if (evt.touch.getDelta().x < -20) {
            let offset = cc.v2(-20, evt.touch.getDelta().y);
            this.node.x += offset.x;

            //this.node.y += offset.y;
        } else {
            this.node.x += evt.touch.getDelta().x;
            // if (this.yEnabled)
            //     this.node.y += evt.touch.getDelta().y;
        }

        this.onDragMove.fire(evt.touch.getDelta());

        this.isDrag = true;
    }

    onTouchEnded(evt) {
        this.isDragging = false;
        if (this.isDrag == false) return;
        let v = evt.getLocation()
        this.onDragEnd.fire(v)
        if (!this.oosEnabled) {
            if (!cc.Camera.main.canSee(this.node)) {
                this.moveBack();
            }

        }
    }

    onTouchCanceled(evt) {
        this.isDragging = false;
        let v = evt.getLocation()
        this.onDragCancel.fire(v)
        if (!this.oosEnabled) {
            if (!cc.Camera.main.canSee(this.node)) {
                this.moveBack();
            }
        }
    }


    moveBack() {
        this.node.runAction(cc.moveTo(this.moveBackDur, this.dragStartPos).easing(cc.easeBackInOut));
    }
}