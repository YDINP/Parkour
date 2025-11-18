
class TriggerPoint {
    min: number = Number.MIN_VALUE;
    max: number = Number.MAX_VALUE;
    callback: Function;
    id: number = 0;
    triggered: boolean = false;
    constructor(min, max, callback) {
        this.min = min;
        this.max = max;
        this.callback = callback;
    }
}

export enum TriggerTimes {
    ONCE = 1,
    UNLIMITED = -1,
}

export default class NumTrigger {

    points: TriggerPoint[] = []

    cursor: number = 0;

    add(min, max, callback) {
        if (max == 0) {
            max = Number.POSITIVE_INFINITY
        }
        let a = new TriggerPoint(min, max, callback);
        // TODO:是否和已有的point 有交集
        this.points.push(a);
    }

    triggerType: TriggerTimes = TriggerTimes.ONCE;

    reset() {
        this.points.forEach(v => v.triggered = false)
    }

    private trigger(v, p: TriggerPoint) {
        if (!p) return;
        if (p.triggered)
            return false;
        if (v >= p.min && v <= p.max) {
            if (this.triggerType == TriggerTimes.UNLIMITED) {
                this.reset();
            }
            p.triggered = true;
            this.cursor++;
            p.callback()
            return true;
        }
        return false
    }

    update(v) {
        if (this.points.length > 0) {
            this.trigger(v, this.points[this.cursor]);
        }
    }
}