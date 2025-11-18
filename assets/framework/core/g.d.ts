
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

declare class g {
    static getRandom<T>(arr: T[]): T;
    public static lastEvent: cc.Event;
}

namespace cc {
    interface Component {
        log(msg, ...params);
        warn(msg, ...params);
        error(msg, ...params);
        getOrAddComponent<T extends Component>(type: { prototype: T }): T;
        getComponentInParent<T extends Component>(type: { prototype: T }): T;
    }

    interface _BaseNode {
        getOrAddComponent<T extends Component>(type: { prototype: T }): T;
        getComponentInParent<T extends Component>(type: { prototype: T }): T;
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
