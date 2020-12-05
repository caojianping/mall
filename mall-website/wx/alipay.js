var request=require("request");
var common=require("./common");
var qr=require("qr-image");
var KEY=`-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQC57HZnILNJ9HcVVXMwZQJhBJycvtJ4xpsUPUeekuMBF1NI5F/8
bgNsDEku3BX82bru+45AB34E1N4LbdF8UbZQx3Tn3EYZocbeQ14nxbrdTaF57uaR
nJomi4c6sPOwtqE2ZBSI6u92p1VDqdfXOqFViGOI38Emre7n6rBughw3lQIDAQAB
AoGAT9BpC+CH1wmxTWE/b9kM6mU2bjuk0uA/lrKv2i0ockF3KWWQpyb7JRkpGYq1
jbRSgWFQMcCFosFXCQT91yak4s/Psr67Ao287ipMqQNwiA8ndMbeP2I72V+i5sy9
Hv92jvNETVn+Ni1SNY4jgnXK/dj48JIh9UXdKzHnfMsHWcECQQD3dx7QoiT/vUUn
ZHK/rXBRuhLo3Q22iIxYq8SHuDLhijJBGCp0QukcYcQr53YVVZmbWQbB50jPF/ub
VXWxiZbZAkEAwFX9Ljz+i13gdHMZIiMWLe+znl5WMpUuk6KRlvPdOWedNPRkcr9C
cPpseKIsr3b6LwpP7ul34xNn2cSSeqyJHQJAS+puOKDVauMceOY20ZiacWf87xUJ
ZOrk6zrekqgua8RigFeyhnIUY1GWxcU/E3JsKh0YlpmmW2nHFTMVZP6JmQJACADL
+yuQj+4FE/NiHViGaLzrpXBZd9tbR8tg8X4OO4BDO1vb/iZVNmxFLTPaVibGPETa
lJ9kXK+HB7m1OqOJRQJBANXjHO36BrZ8B6owc2ecrxttjumPRZPLZfOzKCnlvKF3
NHqJDsSHRZ/mpeYC4EwW4TC+T7Pq0sustkHC7koFxms=
-----END RSA PRIVATE KEY-----
`;

var serverPublicKey=`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDI6d306Q8fIfCOaTXyiUeJHkr
IvYISRcc73s3vF1ZT7XN8RNPwJxo8pWaJMmvyTn9N4HQ632qJBVHf8sxHi/fEsra
prwCtzvzQETrNRwVxLO5jVmRGi60j8Ue1efIlzPXV9je9mkjzOmdssymZkh2QhUr
CmZYI/FCEa3/cNMW0QIDAQAB
-----END PUBLIC KEY-----
`;

var defaultConfig=(function () {
    return {
        app_id:"2016101902241494",
        method:"alipay.trade.precreate",
        format:"JSON",
        charset:"utf-8",
        sign_type:"RSA",
        timestamp:common.date2Str(new Date()),
        version:"1.0",
        notify_url:"http://jk.epg.org.cn/pay/zfb",
        biz_content:{
            timeout_express:"5m"
        }
    }
})();

/*创建订单*/
function createOrder(opt) {
    var data = defaultConfig;
    Object.keys(opt).forEach(function (key) {
        data.biz_content[key] = opt[key];
    });
    data.sign = common.signZfb(data, KEY);
    var arr= Object.keys(data).map(function (key) {
        return key + "=" +encodeURIComponent((typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key]));
    });
    return arr.join("&");
}

/*支付*/
function pay(opt,callback) {
    var order = createOrder(opt);//可以预定义与调用者接口
    var p = new Promise(function (resolve, reject) {
        var url = "https://openapi.alipay.com/gateway.do?charset=utf-8&" + order;
        request.get(url, function (err, res, body) {
            if (err) reject(err);
            else {
                var result = JSON.parse(body);
                //if (common.checkSignZfb(result, serverPublicKey) && "alipay_trade_precreate_response" in result && "qr_code" in result.alipay_trade_precreate_response) {
                if ("alipay_trade_precreate_response" in result && "qr_code" in result.alipay_trade_precreate_response) {
                    resolve(result.alipay_trade_precreate_response.qr_code);
                } else reject("server error(unsign or no qr_code)");
            }
        });
    }).then(code_url=> {
        return qr.image(code_url);
    });
    if (!callback) return p;
    p.then(result=>callback(null, result), err=>callback(err));
}

/*创建订单号含时间因子*/
function creatTradeNo(len) {
    len = len || 32;
    var str = Date.now().toString();
    return (len - str.length < 0 ? str.substr(-len) : str + common.randomString(len - str.length));
}

module.exports= {
    createOrder: createOrder,
    creatTradeNo, creatTradeNo,
    pay: pay
}

