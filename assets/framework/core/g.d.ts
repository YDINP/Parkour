
interface Array<T> {
    shuffle();
    // getRandom():T
    // find(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any);
}
module globalThis {
    interface Window {
        /**手Q */
        qq: any;
        /**头条 */
        tt: any;
        /**微信  */
        wx: any
    }
}

interface String {
    format(...args): string;
}
interface Date {
    format(fmtStr): string;
}

interface Number {
    toUnitString(fix?: number): string;
}

declare var g: {
    getRandom<T>(arr: T[]): T;
    lastEvent: cc.Event;
    setGlobalInstance(obj: any, name?: string): void;
    iswxgame(): boolean;
    getGlobal(s?: string): any;
    randomInt(min: number, max?: number): number;
    getRandomInArray(arr: any[]): any;
    randomFloat(min: number, max: number): number;
    foreachNode(node: cc.Node, callback: Function, target?: any): void;
    getParents(node: cc.Node): cc.Node[];
    printScene(): void;
    isNextDay(timeSec: number): boolean;
    isGreaterDate(now: Date, before: Date): boolean;
    uuid(len?: number, radix?: number): string;
    padNum(num: number, length: number): string;
    map(val: number, s1: number, s2: number, e1: number, e2: number): number;
    execScript(exp: string): void;
    v2(v3: cc.Vec3): cc.Vec2;
    shuffle(self: any[], a?: number): void;
    increaseFomula(min: number, max: number, t: number, d: number): number;
    decreaseFomula(max: number, min: number, t: number, d: number): number;
    gcd(arr: number[]): number;
    allPossibles(x: number, y: number, ox: number, oy: number): number[][];
    fadeAndDestroy(node: cc.Node, t?: number): void;
    extendArray(array: any[], other_array: any[]): void;
    getRandomUniqueArray(arr: number | any[], num: number): any[];
    logColor(str: string, color?: string): void;
    dumpBuffer(res: any): void;
    _dumpBuffer(res: any, level: number): void;
    fbToJson(fb: any): void;
    [key: string]: any;
}

namespace cc {
    interface Component {
        log(msg, ...params);
        warn(msg, ...params);
        error(msg, ...params);
        getOrAddComponent<T extends Component>(type: { new(): T } | { prototype: T }): T;
        getComponentInParent<T extends Component>(type: { new(): T } | { prototype: T }): T;
    }

    interface _BaseNode {
        getOrAddComponent<T extends Component>(type: { new(): T } | { prototype: T }): T;
        getComponentInParent<T extends Component>(type: { new(): T } | { prototype: T }): T;
    }
    interface Animation {
        //move to target frame 
        /**
            !#zh 跳转到指定位置 <br/>
            @param percent 跳转的位置 
            @example ``` 1/3 ```
                 1 表示第一帧 
                 3 表示总帧数
                
        */
        stepTo(percent: number, name?: string)
    }

    interface Layout {
        showlist<T>(callback: (node: Node, data: T, i: number) => void, dataList: T[], template?: cc.Node)
    }

    interface ScrollView {
        showlist<T>(callback: (node: Node, data: T, i: number) => void, dataList: T[], template?: cc.Node)
    }


    interface Camera {
        canSee(node: cc.Node): boolean;
    }


}

// interface String{
//     startWith(str);
//     endWith(str);
// }
