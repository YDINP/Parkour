

let query = {
    ald_media_id:"15645",
    ald_link_key:"8ebc0645ddba0996",
    ald_position_id:"0",
}
let cfg = '1001'
let s = cfg + ""
let arr = s.split(/[,\s]+/)
let ok = arr.some(a => {
    let kvs = a.split(/[\?&]/)
    kvs = kvs.filter(v => v != '')
    //是否解析出来的k和 launch option query 对象key 对应的值相等
    return kvs.every(kv => {
        let [k, v] = kv.split('=')
        let rv = query[k]
        if(rv == undefined && v== undefined) return false;
        return rv == v;
    })
})

console.log(ok);
let xx = '?ald_media_id=12443&ald_link_key=7369b81a68ae4a43&ald_position_id=0'
xx = xx.replace(/[\?&]/g,"@")
console.log(xx);