/**
 * g.js 기능을 안전하게 래핑한 TypeScript 유틸리티
 * g.js가 로드되기 전에도 오류 없이 동작하도록 fallback 제공
 */

import { LocalizationManager } from "../../Localization/LocalizationManager";

declare var g: any;

export default class gUtil {
    /**
     * 배열에서 랜덤 요소 선택
     */
    static getRandom<T>(arr: T[]): T | undefined {
        if (!arr || arr.length === 0) return undefined;
        if (typeof g !== 'undefined' && g && g.getRandom && typeof g.getRandom === 'function') {
            return g.getRandom(arr);
        }
        // Fallback
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * 배열에서 랜덤 요소 선택 (getRandomInArray와 동일)
     */
    static getRandomInArray<T>(arr: T[]): T | undefined {
        if (!arr || arr.length === 0) return undefined;
        if (typeof g !== 'undefined' && g && g.getRandomInArray && typeof g.getRandomInArray === 'function') {
            return g.getRandomInArray(arr);
        }
        // Fallback
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * 랜덤 정수 생성
     */
    static randomInt(min: number, max?: number): number {
        if (typeof g !== 'undefined' && g && g.randomInt && typeof g.randomInt === 'function') {
            return g.randomInt(min, max);
        }
        // Fallback
        if (max == null) {
            max = min;
            min = 0;
        }
        const val = Math.random() * (max - min);
        return Math.floor(val) + min;
    }

    /**
     * 랜덤 실수 생성
     */
    static randomFloat(min: number, max: number): number {
        if (typeof g !== 'undefined' && g && g.randomFloat && typeof g.randomFloat === 'function') {
            return g.randomFloat(min, max);
        }
        // Fallback
        return Math.random() * (max - min) + min;
    }

    /**
     * UUID 생성
     */
    static uuid(len?: number, radix?: number): string {
        if (typeof g !== 'undefined' && g && g.uuid && typeof g.uuid === 'function') {
            return g.uuid(len, radix);
        }
        // Fallback
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
        const uuid: string[] = [];
        radix = radix || chars.length;

        if (len) {
            for (let i = 0; i < len; i++) {
                uuid[i] = chars[Math.floor(Math.random() * radix)];
            }
        } else {
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
            uuid[14] = "4";
            for (let i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    const r = Math.floor(Math.random() * 16);
                    uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        return uuid.join("");
    }

    /**
     * 숫자를 지정된 길이로 패딩
     */
    static padNum(num: number, length: number): string {
        if (typeof g !== 'undefined' && g && g.padNum && typeof g.padNum === 'function') {
            return g.padNum(num, length);
        }
        // Fallback
        const str = num.toString();
        const pad = "0".repeat(length);
        return (pad + str).substr(-length);
    }

    /**
     * 다음 날인지 확인
     */
    static isNextDay(timeSec: number): boolean {
        if (typeof g !== 'undefined' && g && g.isNextDay && typeof g.isNextDay === 'function') {
            return g.isNextDay(timeSec);
        }
        // Fallback
        const now = new Date();
        const time = new Date(timeSec);
        return now.getDate() !== time.getDate() || 
               now.getMonth() !== time.getMonth() || 
               now.getFullYear() !== time.getFullYear();
    }

    /**
     * 날짜 비교
     */
    static isGreaterDate(now: Date, before: Date): boolean {
        if (typeof g !== 'undefined' && g && g.isGreaterDate && typeof g.isGreaterDate === 'function') {
            return g.isGreaterDate(now, before);
        }
        // Fallback
        return now.getTime() > before.getTime();
    }

    /**
     * 값 매핑 (map 함수)
     */
    static map(val: number, s1: number, s2: number, e1: number, e2: number): number {
        if (typeof g !== 'undefined' && g && g.map && typeof g.map === 'function') {
            return g.map(val, s1, s2, e1, e2);
        }
        // Fallback
        if (s2 === s1) return e1;
        return e1 + (val - s1) * (e2 - e1) / (s2 - s1);
    }

    /**
     * 스크립트 실행
     */
    static execScript(exp: string): void {
        if (typeof g !== 'undefined' && g && g.execScript && typeof g.execScript === 'function') {
            g.execScript(exp);
        }
        // Fallback: execScript는 보안상 실행하지 않음
    }

    /**
     * 전역 인스턴스 설정
     */
    static setGlobalInstance(obj: any, name?: string): void {
        if (typeof g !== 'undefined' && g && g.setGlobalInstance && typeof g.setGlobalInstance === 'function') {
            g.setGlobalInstance(obj, name);
        }
        // Fallback: window에 직접 설정
        const _G = window || (globalThis as any);
        if (name) {
            _G[name] = obj;
        } else if (obj && obj.__classname__) {
            _G[obj.__classname__] = obj;
        }
    }

    /**
     * 전역 객체 가져오기
     */
    static getGlobal(s?: string): any {
        if (typeof g !== 'undefined' && g && g.getGlobal && typeof g.getGlobal === 'function') {
            return g.getGlobal(s);
        }
        // Fallback
        const _G = window || (globalThis as any);
        if (s == null || s == undefined) return _G;
        else return _G[s];
    }

    /**
     * 마지막 이벤트 가져오기
     */
    static get lastEvent(): cc.Event | undefined {
        if (typeof g !== 'undefined' && g && g.lastEvent) {
            return g.lastEvent;
        }
        return undefined;
    }

    /**
     * 노드 순회
     */
    static foreachNode(node: cc.Node, callback: Function, target?: any): void {
        if (typeof g !== 'undefined' && g && g.foreachNode && typeof g.foreachNode === 'function') {
            g.foreachNode(node, callback, target);
            return;
        }
        // Fallback
        if (node == null || node == undefined) return;
        for (let i = 0; i < node.childrenCount; i++) {
            const child = node.children[i];
            callback.call(target, child);
            if (child.childrenCount > 0) {
                gUtil.foreachNode(child, callback, target);
            }
        }
    }

    /**
     * 부모 노드들 가져오기
     */
    static getParents(node: cc.Node): cc.Node[] {
        if (typeof g !== 'undefined' && g && g.getParents && typeof g.getParents === 'function') {
            return g.getParents(node);
        }
        // Fallback
        const parents: cc.Node[] = [];
        let current = node;
        while (current && current.parent) {
            parents.push(current.parent);
            current = current.parent;
        }
        return parents;
    }

    /**
     * Vec3를 Vec2로 변환
     */
    static v2(v3: cc.Vec3): cc.Vec2 {
        if (typeof g !== 'undefined' && g && g.v2 && typeof g.v2 === 'function') {
            return g.v2(v3);
        }
        // Fallback
        return cc.v2(v3.x, v3.y);
    }

    /**
     * 배열 섞기
     */
    static shuffle<T>(arr: T[], a?: number): void {
        if (typeof g !== 'undefined' && g && g.shuffle && typeof g.shuffle === 'function') {
            g.shuffle(arr, a);
            return;
        }
        // Fallback: Fisher-Yates shuffle
        if (!arr || arr.length <= 1) return;
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    /**
     * 증가 공식
     */
    static increaseFomula(min: number, max: number, t: number, d: number): number {
        if (typeof g !== 'undefined' && g && g.increaseFomula && typeof g.increaseFomula === 'function') {
            return g.increaseFomula(min, max, t, d);
        }
        // Fallback: 선형 보간
        return min + (max - min) * (t / d);
    }

    /**
     * 감소 공식
     */
    static decreaseFomula(max: number, min: number, t: number, d: number): number {
        if (typeof g !== 'undefined' && g && g.decreaseFomula && typeof g.decreaseFomula === 'function') {
            return g.decreaseFomula(max, min, t, d);
        }
        // Fallback: 선형 보간
        return max - (max - min) * (t / d);
    }

    /**
     * 최대공약수
     */
    static gcd(arr: number[]): number {
        if (typeof g !== 'undefined' && g && g.gcd && typeof g.gcd === 'function') {
            return g.gcd(arr);
        }
        // Fallback
        if (!arr || arr.length === 0) return 1;
        let result = arr[0];
        for (let i = 1; i < arr.length; i++) {
            result = this._gcd(result, arr[i]);
        }
        return result;
    }

    private static _gcd(a: number, b: number): number {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    /**
     * 페이드 아웃 후 제거
     */
    static fadeAndDestroy(node: cc.Node, t: number = 0.3): void {
        if (typeof g !== 'undefined' && g && g.fadeAndDestroy && typeof g.fadeAndDestroy === 'function') {
            g.fadeAndDestroy(node, t);
            return;
        }
        // Fallback
        const seq = cc.sequence(cc.fadeOut(t), cc.callFunc(() => node.destroy(), node));
        node.runAction(seq);
    }

    /**
     * 배열 확장
     */
    static extendArray<T>(array: T[], other_array: T[]): void {
        if (typeof g !== 'undefined' && g && g.extendArray && typeof g.extendArray === 'function') {
            g.extendArray(array, other_array);
            return;
        }
        // Fallback
        other_array.forEach(v => array.push(v));
    }

    /**
     * 랜덤 고유 배열
     */
    static getRandomUniqueArray<T>(arr: number | T[], num: number): T[] {
        if (typeof g !== 'undefined' && g && g.getRandomUniqueArray && typeof g.getRandomUniqueArray === 'function') {
            return g.getRandomUniqueArray(arr, num);
        }
        // Fallback
        let temp_array: T[] = [];
        if (Array.isArray(arr)) {
            temp_array = [...arr];
        } else {
            for (let i = 0; i < arr; i++) {
                temp_array.push(i as any);
            }
        }
        const return_array: T[] = [];
        for (let i = 0; i < num && temp_array.length > 0; i++) {
            const arrIndex = Math.floor(Math.random() * temp_array.length);
            return_array[i] = temp_array[arrIndex];
            temp_array.splice(arrIndex, 1);
        }
        return return_array;
    }

    /**
     * WeChat 게임인지 확인
     */
    static iswxgame(): boolean {
        if (typeof g !== 'undefined' && g && g.iswxgame && typeof g.iswxgame === 'function') {
            return g.iswxgame();
        }
        // Fallback
        return cc.sys.platform == cc.sys.WECHAT_GAME;
    }

    /**
     * Component 또는 Node에서 컴포넌트를 가져오거나 추가
     */
    static getOrAddComponent<T extends cc.Component>(obj: cc.Component | cc.Node, type: { new(): T } | { prototype: T }): T {
        if (obj && typeof (obj as any).getOrAddComponent === 'function') {
            return (obj as any).getOrAddComponent(type);
        }
        // Fallback
        let comp = obj.getComponent(type as any);
        if (!comp) {
            comp = obj.addComponent(type as any);
        }
        return comp as T;
    }

    /**
     * 부모 노드에서 컴포넌트 찾기
     */
    static getComponentInParent<T extends cc.Component>(obj: cc.Component | cc.Node, type: { new(): T } | { prototype: T }): T | null {
        if (obj && typeof (obj as any).getComponentInParent === 'function') {
            return (obj as any).getComponentInParent(type);
        }
        // Fallback: 수동으로 부모 노드 순회
        let node: cc.Node | null = null;
        if (obj instanceof cc.Component) {
            node = obj.node;
        } else if (obj instanceof cc.Node) {
            node = obj;
        }
        
        while (node) {
            let component = node.getComponent(type as any);
            if (component) {
                return component as T;
            }
            node = node.parent;
            if (node && node instanceof cc.Scene) {
                break;
            }
        }
        return null;
    }

    /**
     * 카메라에서 노드가 보이는지 확인
     */
    static canSee(camera: cc.Camera, node: cc.Node): boolean {
        if (camera && typeof (camera as any).canSee === 'function') {
            return (camera as any).canSee(node);
        }
        // Fallback: 수동으로 계산
        try {
            const rect = gUtil.getWorldBoundingBox(node);
            const plb = rect.origin;
            const prt = cc.v2(rect.xMax, rect.yMax);
            const p = camera.getWorldToScreenPoint(plb, cc.Vec2.ZERO);
            const p2 = camera.getWorldToScreenPoint(prt, cc.Vec2.ZERO);
            if (
                p.y > cc.visibleRect.height ||
                p2.y < 0 ||
                p2.x < 0 ||
                p.x > cc.visibleRect.width
            ) {
                return false;
            }
            return true;
        } catch (e) {
            return true; // 에러 발생 시 기본값
        }
    }

    /**
     * 노드의 월드 바운딩 박스 가져오기
     */
    static getWorldBoundingBox(node: cc.Node): cc.Rect {
        if (node && typeof (node as any).getWorldBoundingBox === 'function') {
            return (node as any).getWorldBoundingBox();
        }
        // Fallback
        const parent = node.parent;
        if (parent == null) return cc.rect();
        const box = node.getBoundingBox();
        const xy = cc.v2(box.xMin, box.yMin);
        const xy2 = cc.v2(box.xMax, box.yMax);
        const worldXy = parent.convertToWorldSpaceAR(xy);
        const worldXy2 = parent.convertToWorldSpaceAR(xy2);
        const wh = worldXy2.sub(worldXy);
        return cc.rect(worldXy.x, worldXy.y, wh.x, wh.y);
    }

    /**
     * Layout에 리스트 표시
     */
    static showlistLayout(layout: cc.Layout, callback: (node: cc.Node, data: any, i: number) => void, list: any[], template?: cc.Node): void {
        if (layout && typeof (layout as any).showlist === 'function') {
            (layout as any).showlist(callback, list, template);
            return;
        }
        // Fallback
        if (!template) {
            template = layout.node.children[0];
        }
        if (!template) return;

        let pool = (layout as any)["node-pool"];
        if (!pool) {
            pool = new cc.NodePool();
            (layout as any)["node-pool"] = pool;
        }

        // 기존 노드들 제거 (템플릿 제외)
        // g.js의 원래 로직과 동일하게 구현
        // 역순으로 제거하여 인덱스 문제 방지
        const children = layout.node.children;
        for (let i = children.length - 1; i >= 0; i--) {
            let v = children[i];
            if (v !== template && v && v.isValid) {
                if (v.parent === layout.node) {
                    layout.node.removeChild(v);
                }
                pool.put(v);
            }
        }

        if (template) template.active = false;

        for (let i = 0; i < list.length; i++) {
            const cfg = list[i];
            let node = pool.get();
            if (node == null) {
                node = LocalizationManager.instantiatePrefab(template);
            }
            node.active = true;
            node.parent = layout.node;
            if (callback) callback(node, cfg, i);
        }
    }

    /**
     * ScrollView에 리스트 표시
     */
    static showlistScrollView(scrollView: cc.ScrollView, callback: (node: cc.Node, data: any, i: number) => void, list: any[], template?: cc.Node): void {
        if (scrollView && typeof (scrollView as any).showlist === 'function') {
            (scrollView as any).showlist(callback, list, template);
            return;
        }
        // Fallback
        if (!template) {
            template = scrollView.content.children[0];
        }
        if (!template) return;

        // 기존 노드들 제거 (템플릿 제외)
        scrollView.content.children.forEach(v => {
            if (v !== template) {
                v.destroy();
            }
        });

        template.active = false;

        for (let i = 0; i < list.length; i++) {
            const cfg = list[i];
            const node = LocalizationManager.instantiatePrefab(template);
            node.active = true;
            scrollView.content.addChild(node);
            if (callback) callback(node, cfg, i);
        }
    }

    /**
     * Animation을 특정 프레임으로 이동
     */
    static stepToAnimation(anim: cc.Animation, percent: number, anim_name?: string): void {
        if (anim && typeof (anim as any).stepTo === 'function') {
            (anim as any).stepTo(percent, anim_name);
            return;
        }
        // Fallback
        const animation_state = anim.play(anim_name);
        if (animation_state) {
            anim.setCurrentTime(animation_state.duration * percent, anim_name);
            animation_state.step();
        }
    }

    /**
     * 씬 구조 출력
     */
    static printScene(): void {
        if (typeof g !== 'undefined' && g && g.printScene && typeof g.printScene === 'function') {
            g.printScene();
            return;
        }
        // Fallback
        const canvas = cc.find("Canvas");
        if (canvas && typeof (canvas as any).walk === 'function') {
            try {
                (canvas as any).walk((node: cc.Node) => {
                    const parents = gUtil.getParents(node);
                    const s = Array(parents.length - 1).fill("\t").join("");
                    console.log(s + node.name);
                }, () => 0);
            } catch (e) {
                // walk 함수가 다른 시그니처를 가질 수 있음
                console.warn("[gUtil.printScene] walk function error:", e);
            }
        }
    }

    /**
     * 값이 비어있는지 확인
     */
    static isEmpty(obj: any): boolean {
        if (typeof window !== 'undefined' && (window as any).isEmpty && typeof (window as any).isEmpty === 'function') {
            return (window as any).isEmpty(obj);
        }
        // Fallback
        if (obj === null) return true;
        if (typeof obj === "undefined") {
            return true;
        }
        if (typeof obj === "string") {
            if (obj === "") {
                return true;
            }
            const reg = new RegExp("^([ ]+)|([　]+)$");
            return reg.test(obj);
        }
        return false;
    }
}

