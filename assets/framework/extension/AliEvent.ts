export default class AliEvent {
    constructor() { }

    private static z_uuid;
    private static z_newuser;
    private static z_appid_self;

    /**
     * 初始化埋点
     * @param appid 该游戏appid
     *  */
    public static init(appid) {
        this.z_appid_self = appid;
        this.getIP();
        var t = new Date().getTime();
        var data = {
            xsl_t: t,
            xsl_action: 'init',
        };

        var sendData = {
            xsl_uuid: this.z_uuid,
            xsl_appid: this.z_appid_self,
            xsl_from: this.z_appid_self,
            xsl_newuser: this.z_newuser
        };
        if (data != null) {
            for (var key in data) {
                sendData[key] = data[key];
            }
        }

        let url = 'https://r.qpzq.net/r.gif?'
        for (var key in sendData) {
            url += key
            url += '=' + sendData[key] + '&'
        }
        this.httpRequest('sendPath', url, null, null);
    }

    /**
     * 自定义埋点
     * @param action
     * @param value
     */
    public static aliEvent(action, value) {
        let _url = 'https://r.qpzq.net/r.gif?xsl_uuid=' + window['uuid'] + '&xsl_appid=' + this.z_appid_self + '&xsl_from=' + this.z_appid_self + '&xsl_newuser=' +
         this.z_newuser + '&xsl_event=' + action + '&xsl_param=' + JSON.stringify(value);
        this.httpRequest('sendPath', _url, null, null);
    }

    /**获取ip计算uuid */
    private static getIP() {
        if (cc.sys.localStorage.getItem('uuid') && cc.sys.localStorage.getItem('uuid') != 'undefined') {
            this.z_uuid = cc.sys.localStorage.getItem('uuid');
            this.z_newuser = 0;
            if (cc.sys.localStorage.getItem('uuidData')) {
                // 如果有存了时间，判断时间是否为今天，如果是今天，则还算是新用户
                let date = new Date();
                let month = Number(date.getMonth()) + 1;
                let day = Number(date.getDate());
                let _str = month + '-' + day;
                if (cc.sys.localStorage.getItem('uuidData') == _str) {
                    // 还是今天，新用户
                    this.z_newuser = 1;
                }
            }
        } else {
            this.z_uuid = this.create_uuid();
            this.z_newuser = 1; // 当前为新用户

            // 存一下当前日期
            let date = new Date();
            let month = Number(date.getMonth()) + 1;
            let day = Number(date.getDate());
            let _str = month + '-' + day;
            console.log('当前日期：', _str);
            cc.sys.localStorage.setItem('uuid', this.z_uuid);
            cc.sys.localStorage.setItem('uuidData', _str);
        }
        window['uuid'] = this.z_uuid;
        console.log('获取uuid：', this.z_uuid, this.z_newuser);
    }

    private static create_uuid() {
        function e() {
            return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
        }
        return e() + e() + e() + e() + e() + e() + e() + e()
    }

    private static httpRequest(type, url, param = null, succ = null) {
        let httpReq = new XMLHttpRequest();
        if (!httpReq) {
            alert('Giving up :( Cannot create an XMLHTTP instance');
            return;
        }
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState == XMLHttpRequest.DONE) {
                if (type != 'sendPath') {
                    if (httpReq.status === 200) {
                        // console.log('ajax success');
                        var response = httpReq.responseText;
                        try {
                            response = JSON.parse(response);
                        } catch (e) {
                            response = httpReq.responseText;

                        }
                        succ && succ(response)
                    } else {
                        console.log('There was a problem with the request.');
                    }
                }
            }
        };
        httpReq.open('GET', url);
        if (param != null) {
            httpReq.send(param);
        } else {
            httpReq.send();
        }

    }

}