import Fizz from "../fizz";
import { ShapeType } from "../shapes";

interface TileObject {
    points: cc.Vec2[],
    offset: cc.Vec2,
    type: number,
    visible: boolean,
    width: number,
    height: number,
    x: number,
    y: number,
    id: number,
    name: string,
    slip: boolean,
    friction: number,
    bounce: number,
    damping: number,
    left: boolean,
    right: boolean,
    top: boolean,
    bottom: boolean,
    oneWay: boolean,
    polylinePoints: cc.Vec2[]
}

export interface BodyProperties {
    slip: boolean,
    friction: number,
    bounce: number,
    damping: number,
    left: boolean,
    right: boolean,
    top: boolean,
    bottom: boolean,
    oneWay: boolean,
    group: string
    paddingTop: number;
}

enum TileObjectType {
    Rect = 0,
    Ellipse = 1,
    Poly = 2,
    PolyPoints = 3,
}


export default class FizzHelper {
    static h = 0;
    static w = 0;
    static initWithMap(w, h) {
        this.h = h;
        this.w = w;
    }

    static attributes = ['name', 'id', 'slip', 'friction', 'bounce', 'damping', 'left', 'right', 'top', 'bottom']

    static setProperties(shape, custom) {
        this.attributes.forEach(v => {
            shape[v] = custom[v]
        })

    }

    static createRectBody(rect: cc.Rect, options?: BodyProperties) {
        if (options && options.paddingTop) {
            rect.height -= options.paddingTop;
        }
        let center = rect.center
        let hw = rect.width / 2;
        let hh = rect.height / 2;
        let body = Fizz.addStatic(null, ShapeType.rect, center.x, center.y, hw, hh)
        this.setDefaulaValues(body, options);
        return body;
    }

    static setDefaulaValues(v, options: any = {}) {
        v.slip = (v.slip == null || options.slip == null) ? true : v.slip;
        v.friction = v.friction || options.friction
        if (v.friction == null) v.friction = 1;
        v.bounce = v.bounce || options.bounce || 0
        v.damping = v.damping || options.damping || 0
        v.left = v.left || options.left || false
        v.right = v.right || options.right || false
        v.top = v.top || options.top || false
        v.bottom = v.bottom || options.bottom || false
        v.oneWay = v.oneWay || options.oneWay || false
        v.group = v.group || options.group || ""
        v.topOffset = v.topOffset || options.topOffset || 0
        if (v.oneWay) {
            v.left = true, v.right = true, v.bottom = true
            v.top = false
            v.oneWay = true;
        }
    }

    static createShape(v: TileObject, options) {
        let shapes = []
        this.setDefaulaValues(v, options);
        if (v.type == TileObjectType.Poly) {
            let minp = cc.v2(v.points[0])
            let maxp = cc.v2(v.points[0])
            let startp = v.offset;
            startp.y = this.h - startp.y
            let rect = cc.rect(startp.x + minp.x, startp.y - minp.y, maxp.x - minp.x, Math.abs(maxp.y - minp.y))
            let lastpoint = v.points[0]
            lastpoint.x = startp.x + lastpoint.x;
            lastpoint.y = startp.y - lastpoint.y;
            let points = []
            let offsetp = cc.v2(lastpoint.x - rect.x, lastpoint.y - rect.y)
            points.push(offsetp);
            for (let i = 1; i < v.points.length; i++) {
                let p = v.points[i]
                let endpx = startp.x + p.x, endpy = startp.y + p.y
                let shape = null;
                if (lastpoint.x == endpx) {
                    //shape = fizz.addStatic('line', lastpoint.x,lastpoint.y-1 ,endpx,endpy-1)
                    if (endpy > lastpoint.y) {
                        let hh = (endpy - lastpoint.y) / 2 - 1;
                        shape = Fizz.addStatic(null, ShapeType.rect, lastpoint.x, lastpoint.y + hh, 2, hh)
                        shapes.push(shape)

                    } else {
                        let hh = (lastpoint.y - endpy) / 2 - 1;
                        shape = Fizz.addStatic(null, 'rect', lastpoint.x, lastpoint.y - hh, 2, hh)
                        shapes.push(shape)
                    }
                } else {
                    shape = Fizz.addStatic(null, ShapeType.line, lastpoint.x, lastpoint.y, endpx - 2, endpy)
                    shapes.push(shape)
                }
                lastpoint.x = endpx
                lastpoint.y = endpy
                // 得到相对于矩形原点坐标的相对位置 
                let offsetp = cc.v2(endpx - rect.x, endpy - rect.y)
                // table.insert(points,);
                points.push(cc.v2(offsetp.x, offsetp.y))
            }
            // should loop  ?
            let shape = Fizz.addStatic(null, ShapeType.line, lastpoint.x, lastpoint.y, startp.x, startp.y)
            shapes.push(shape)
            console.log(v.slip)
            //dump(points)
        } else if (v.type == TileObjectType.Rect) {
            let x = v.offset.x;
            let hw = v.width / 2;
            let hh = v.height / 2;
            let y = this.h - v.offset.y - v.height
            let shape = Fizz.addStatic(null, ShapeType.rect, x + hw, y + hh, hw, hh)
            shapes.push(shape);
            // this.drawer.fillRect(x, y, v.width, v.height);
        } else if (v.type == TileObjectType.Ellipse) {
            let x = v.offset.x;
            let hw = v.width / 2;
            let hh = v.height / 2;
            if (hw == hh) {
                let y = this.h - v.offset.y - v.height
                let shape = Fizz.addStatic(null, ShapeType.circle, x + hw, y + hh, hw)
                shapes.push(shape);
            } else {
                console.warn(v.id + ": not support ellipse shape!")
            }
            // 
        } else if (v.type == TileObjectType.PolyPoints) {
            let startp = v.offset;
            startp.y = this.h - startp.y
            let p = v.polylinePoints[1];
            let endpx = startp.x + p.x, endpy = startp.y + p.y
            let shape = Fizz.addStatic(null, ShapeType.line, startp.x, startp.y, endpx, endpy)
            shapes.push(shape);
        }

        shapes.forEach(s => this.setProperties(s, v))

        return shapes;
        // all poly points 
        //self:processlines(points)
    }

}