var request=require("request");
var common=require("./common");
 var xml2js=require("xml2js");
var qr=require("qr-image");
var _config=require("./config.json");
var KEY=_config.key;

var defaultConfig=(function () {
    return {
        nonce_str:common.randomString(32),
        appid:_config.appid,
        mch_id:_config.mch_id,
        trade_type:"NATIVE",
        spbill_create_ip:_config.spbill_create_ip,
        notify_url:_config.notify_url,
        fee_type:"CNY"
    }
})();
/*经看配置*/
// var KEY="48815cf5c01cde25d8d36ee2929c32fe";
//
// var defaultConfig=(function () {
//     return {
//         nonce_str:common.randomString(32),
//         appid:"wxfe00f3ca54d73f36",
//         mch_id:"1429680802",
//         trade_type:"NATIVE",
//         spbill_create_ip:"106.14.33.236",
//         notify_url:"http://www.jingkan.net/pay",
//         fee_type:"CNY"
//     }
// })();
//

// /*epg配置*/
// var KEY = "dfsfsdfhjw2eqwoiujsd21eu90sakasd";
// //
// var defaultConfig = (function () {
//     return {
//         nonce_str: common.randomString(32),
//         appid: "wxdecc0e2486bcdd24",
//         mch_id: "1231621302",
//         trade_type: "NATIVE",
//         spbill_create_ip: "106.14.33.236",
//         notify_url: "http://www.jingkan.net/pay",
//         fee_type: "CNY"
//     }
// })();


/*创建订单*/
function createOrder(opt) {
    Object.keys(defaultConfig).forEach(function (key) {
        if (!(key in opt)) opt[key] = defaultConfig[key];
    });
    opt.sign = common.sign(opt, KEY);
    var arr = Object.keys(opt).map(function (key) {
        return common.toXmlElementString(key, opt[key], key === "detail");
    });
    return common.toXml(arr,"\n");
}
function pay(opt,callback) {
    var p = payInner(opt)
        .then(obj=>qr.image(obj.code_url));
    if (!callback) return p;
    p.then(result=>callback(null, result)).catch(err=>callback(err));
}

/*
* productDesc,商品描述（腾讯充值中心-QQ会员充值）
*totalFee，总金额（单位[int]：分）
* outTradeNo，系统订单号（<32字符）
* */
function jsapiPay(openId,productDesc, totalFee, outTradeNo,callback) {
    var opt={}
    var userDefault = {
        "device_info": "WEB",
        "body": productDesc,
        "out_trade_no": outTradeNo,
        "trade_type": "JSAPI",
        "total_fee": parseInt(totalFee),
        "openid":openId
    }
    Object.assign(opt, defaultConfig,userDefault);
    var p = payInner(opt).then(obj=> {
        var ret = {
            appId: opt.appid,
            timeStamp: Math.floor(new Date().getTime() / 1000).toString(),
            nonceStr: common.randomString(32, true, false),
            package: "prepay_id=" + obj.prepay_id,
            signType: "MD5"
        };
        ret.paySign = common.sign(ret, KEY);
        console.log(ret);
        return ret;
    });
    if (!callback) return p;
    p.then(result=>callback(null, result))
        .catch(error=>callback(error))
}

/*支付*/
function payInner(opt) {
    var order = createOrder(opt);//可以预定义与调用者接口
    console.log(order);
    var options = {
        headers: {"Connection": "close"},
        url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
        method: 'POST',
        body: order
    };
    var p = new Promise(function (resolve, reject) {
        request.post(options, order, function (err, res, body) {
            if (err) reject(err);
            else {
                xml2js.parseString(body, {explicitArray: false}, function (err, json) {
                    //console.log(json)
                    json=json.xml;
                    if (err)  reject(err);
                    else {
                        if (json.return_code.toLocaleLowerCase() === "success"&&
                            json.result_code.toLocaleLowerCase()==="success") resolve(json);
                        else reject(json);
                    }
                });
            }
        });
    });
    return p;
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
    pay: pay,
    jsapiPay:jsapiPay
}

