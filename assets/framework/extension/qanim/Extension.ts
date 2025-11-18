export function lerpVec2(out, a, b, t) {
    let ax = a.x,
        ay = a.y;
    out.x = ax + t * (b.x - ax);
    out.y = ay + t * (b.y - ay);
    return out;
}
export function lerpVec3(out, a, b, t) {
    let ax = a.x,
        ay = a.y,
        az = a.z;
    out.x = ax + t * (b.x - ax);
    out.y = ay + t * (b.y - ay);
    out.z = az + t * (b.z - az);
    return out;
}
export function lerpf(a, b, t) {
    return cc.misc.lerp(a, b, t);
}