/**
 * @author renwang
 * @description csv-parser for creator ,work along with typing_csv.js
 */
var csv = {}
csv.__ID__ = "id"
csv.__ROWS__ = "values"
csv.__SIZE__ = "size"
csv.__PS_INDEX__ = 0
csv.__TYPE_INDEX__ = 2;
csv.__HEADER_INDEX__ = 1;
csv.__DATA_INDEX__ = 3;
const number_expr = 'number,int,float'
/**
 * @constuctor
 * @param {}
 * @private
 */
csv._StructData = function () {
    this.header = []
    this.type = []
    this.body = []
}

/**
 * @constructor
 * @param data {csv._StructData}
 * @param values {Array.<number>}
 * @param index {number}
 */
csv._Row = function (data, values, index) {
    var self = this;
    // /**
    //  * @type {Array.<number>}
    //  */
    // this._values = values;
    // /**
    //  * @type {Array}
    //  */
    // this._keys = keys;
    this.index = index;
    let keys = data.header;
    let types = data.type;
    let parsedTypes = []
    // let names = []
    types.forEach(function (v, i) {
        //number:[]
        var [type, arr] = v.split(":")
        if (type) {
            var result = arr && arr.match(/\[\]/);
            if (result) {
                type = "array." + type;
            }
        }
        parsedTypes.push(type);
    })

    keys.forEach(function (name, i) {
        var val = values[i];
        //分析每个字段，并跟据字段类型进行解析成 object
        var type = parsedTypes[i]
        if (type.startsWith("array")) {
            if (val && val.length > 0) {
                val = val.split(/[,\+&;\/\s]/);
                if (number_expr.indexOf(type) > -1) {
                    val = val.map(function (x) {
                        return Number(x)
                    })
                    // } else if (type.endsWith("int")) {
                    //     val = val.map(v => parseInt(v))
                    // } else if (type.endsWith("float")) {
                    //     val = val.map(v => parseFloat(v))
                } else if (type.endsWith("string")) {

                } else {
                    throw new Error("[csv]: field with type (array." + type + ") can not be parsed!")
                }
            } else {
                val = []
            }
        } else if (number_expr.indexOf(type) > -1) {
            var val_n = Number(val);
            if (!isNaN(val_n)) {
                val = val_n
            }
            // } else if (type == "int") {
            //     val = parseInt(val)
            // } else if (type == "float") {
            //     val = parseFloat(val);
        } else if (type.endsWith("string")) {

        } else if (type == 'boolean') {
            val = Number(val);
            val = val ? true : false;
        }
        else {
            throw new Error("[csv]: field with type (" + type + ") can not be parsed!")
        }
        if (csv._fieldParser) {
            let tt = types[i]//配置里的type
            val = csv._fieldParser(tt, val) || val
        }
        Object.defineProperty(self, name, {
            value: val,
            writable: false
        })
    });
}


csv._Row.prototype.match = function (cond) {
    if (cond && cond(this, this.index)) {
        return true;
    }
    return false;
}


/**
 * @constuctor
 * @param {csv._StructData} data
 */
csv._CSV = function (data) {
    /**
     * @type {csv._StructData} 
     */
    this._data = data;
    /**
     * @type {Object.<number,csv._Row>}
     */
    this._rows = {};
    this._values = null;
    var self = this;
    let id_index = data.header.indexOf(csv.__ID__)
    id_index = id_index < 0 ? 0 : id_index
    data.body.forEach(function (v, i) {
        var row = new csv._Row(data, v, i)
        // release data
        delete data.body[i]
        self._rows[v[id_index]] = row;
    })
    // empty array 
    data.body.splice(0)
    Object.defineProperty(this, csv.__ROWS__, {
        // value:this._rows,
        get: function () {
            if (this._values == null) {
                this._values = Object.values(self._rows)
            }
            return this._values;
        },
        // writable:false
    })
    Object.defineProperty(this, csv.__SIZE__, {
        value: this.values.length,
        writable: false
    })
}

/**
 * @param {string|number}  key
 */
csv._CSV.prototype.get = function (id) {
    return this._rows[id]
}


csv._CSV.prototype.search = function (cond) {
    let arrs = []
    for (var k in this._rows) {
        var row = this._rows[k]
        if (row.match(cond)) {
            arrs.push(row)
        }
    }
    return arrs;
}


/**
 * @type {Array.<csv._CSV>}
 */
csv.pathToCSV = {}
csv.cache_indexKeyToTable = {}
csv._fieldParser = null;
csv._evt_tbl = {
    load: []
};

csv.on = function (evtname, callback, target) {
    let load_funcs = csv._evt_tbl[evtname]
    if (load_funcs == null) {
        console.log("[csv] unrecognized event name :" + evtname)
    } else {
        load_funcs.push([callback, target]);
    }
}

csv.off = function (evtname, callback, target) {
    /**
     * @type {Array.<Array.<number>>}
     */
    let load_funcs = csv._evt_tbl[evtname]
    if (load_funcs == null) {
        console.log("[csv] unrecognized event name :" + evtname)
    } else {
        let idx = load_funcs.findIndex(v => v[0] == callback && v[1] == target)
        if (idx >= 0) {
            load_funcs.splice(idx, 1);
        }
    }
}

csv.emit = function (evtname, p1, p2, p3, p4) {
    let load_funcs = csv._evt_tbl[evtname]
    load_funcs.forEach(v => v[0].call(v[1], p1, p2, p3, p4))
}


csv.isLoaded = function (name) {
    return csv.pathToCSV[name] != null;
}

csv.load = function (path, callback, target) {
    //load res
    cc.loader.loadRes(path, cc.TextAsset, function (err, resource) {
        if (resource.name == '') return;
        if (!csv.pathToCSV[resource.name]) {
            try {
                var csv_ = csv.parse(resource.text)
                csv.pathToCSV[resource.name] = csv_;
                Object.defineProperty(csv, resource.name, {
                    value: csv_,
                    writable: false,
                    configurable: true
                })
                csv.emit('load', path)
            } catch (e) {
                console.log("load csv error:" + resource.name)
                console.error(e)
            }
        }
        cc.loader.releaseRes(path, cc.TextAsset);
        if (callback) callback.call(target)
    })
}

csv.remove = function (name) {
    delete csv.pathToCSV[name]
}

csv.loadString = function (name, csv_str, callback, target) {
    let old = csv.pathToCSV[name]
    csv.remove(name);
    if (!csv.pathToCSV[name]) {
        try {
            var csv_ = csv.parse(csv_str)
            csv.pathToCSV[name] = csv_;
            delete csv[name]
            Object.defineProperty(csv, name, {
                value: csv_,
                writable: false,
                configurable: true
            })
        }
        catch (e) {
            console.error("[csv]expcetion occur while parsing csv txt!", e)
            csv.pathToCSV[name] = old;
        }
    }
    if (callback) callback.call(target)
}

/**
 * @param {string} csv_text
 */
csv.parse = function (csv_text) {
    csv_text = csv_text.replace(/\"/g, "");
    var rows = csv_text.split(/\r?\n/g).filter(function (line) {
        return line != ""
    })
    var csv_data = new csv._StructData();
    csv_data.header = rows[csv.__HEADER_INDEX__].replace(/[\r]/g, "").split(/\s*\t/g)//.map(v=>v.replace(/\s/g,""))
    csv_data.type = rows[csv.__TYPE_INDEX__].replace(/[\r]/g, "").split(/\s*\t/g)
    csv_data.body = rows.slice(csv.__DATA_INDEX__).map(function (row) { return csv.parseRowWithT(row.replace(/\r/g, "")) })
    var csv_ = new csv._CSV(csv_data)
    return csv_;
}

csv.parseRowWithT = function (row) {
    return row.split("\t")
}


csv.parseRow = function (row) {
    if (row.indexOf('"') === -1) {
        return row.split(',');
    }
    var running = "";
    var result = [];
    var escapeMode = false;
    for (var i = 0; i < row.length; i++) {
        var current = row.charAt(i);
        if (current === '"') {
            escapeMode = !escapeMode;
            continue;
        }
        if (current === ',' && !escapeMode) {
            result.push(running);
            running = "";
            continue;
        }
        running += current;
    }
    result.push(running);
    return result;
};



csv.setParser = function (parser) {
    this._fieldParser = parser;
}

csv.hasIndex = function (key) {
    return csv.cache_indexKeyToTable[key] != null
}

csv.removeIndex = function (path, key_field) {
    let k = path + "." + key_field
    delete csv.cache_indexKeyToTable[k]
}


csv.createIndex = function (path, key_field, value_field) {
    this.removeIndex(path, key_field)
    if (csv.hasIndex(path + "." + key_field)) {
        return;
    }
    /**
     * @type {csv._CSV}
     */
    var c = this[path]
    if (c == null) return console.warn("먼저 Config를 로드한 후 인덱스를 생성하세요")
    c.values.forEach(function (v) {
        var key = v[key_field]
        if (key == "" || key == 0) return;
        key = key.replace(/\s*/g, "")
        Object.defineProperty(c, key, {
            value: v[value_field],
            writable: false
        })
    })
    csv.cache_indexKeyToTable[path + "." + key_field] = c;
}

csv.loadDir = function (dirPath, callback, target) {
    //load res
    cc.loader.loadResDir(dirPath, cc.TextAsset, function (err, resource, urls) {
        urls.forEach(function (path, i) {
            var csv_res = resource[i]
            path = path.substr(path.lastIndexOf("/") + 1);
            if (csv.pathToCSV[path]) {
                return
            }
            try {
                var csv_ = csv.parse(csv_res.text)
                csv.pathToCSV[path] = csv_;
                Object.defineProperty(csv, csv_res.name, {
                    value: csv_,
                    writable: false,
                    configurable: true
                })
                csv.emit('load', path)
            } catch (e) {
                console.error("load csv error:" + csv_res.name)
                console.error(e)
            }
        })
        //release 
        cc.loader.releaseResDir(dirPath, cc.TextAsset);
        return callback && callback.call(target)
    })
}

/**
 * @param {string} path
 */
csv.release = function (path) {

}
window.csv = csv;