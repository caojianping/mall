/**
 * Created by ycl on 2016/7/22.
 */
var common=require("./common");
var request=require('request');
var config=require("./config.json");
var co=require('co');
var APPID=config.appid,
    APPSECRET=config.APPSECRET,
    TOKEN=config.TOKEN;

/*接口Url*/
var wxUrls= {
    get_outh2_url: function (code) {
        return "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + APPID + "&secret=" + APPSECRET + "&code=" + code + "&grant_type=authorization_code";
    },
    get_userInfo_url: function (openid, cb) {
        getAccessToken(function (err, accessToken) {
            if (err)  return cb(err);
            cb(null, "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + accessToken + "&openid=" + openid + "&lang=zh_CN");
        })
    },
    get_basicAccessToken_url: function () {
        return "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET;
    },
    get_jsticket_url: function (cb) {
        getAccessToken(function (err, accessToken) {
            if (err) return cb(err);
            cb(null, "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + accessToken + "&type=jsapi");
        })
    },
    get_snsapi_base_url: function (strurl, flag) {
        return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
            APPID + "&redirect_uri=" +
            encodeURIComponent(strurl) + "&response_type=code&scope=snsapi_base&state=" +
            flag + "#wechat_redirect";
    },
    get_snsapi_userinfo_url: function (strurl, flag) {
        return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + APPID + "&redirect_uri=" +
            encodeURIComponent(strurl) + "&response_type=code&scope=snsapi_userinfo&state=" +
            flag + "#wechat_redirect";
    },
    get_QR_url: function (cb) {
        getAccessToken(function (err, accessToken) {
            if (err) return cb(err);
            cb(null, "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + accessToken);
        })
    }
}

/*获取AccessToken,缓存结果*/
var getAccessToken= (function getAccessToken() {
    var endTimeTick,token;
    return function (callback) {
        if(endTimeTick>Date.now() &&token) return callback(null,token);
        request.get(wxUrls.get_basicAccessToken_url(),function (err, res) {
            if(err) return callback(err);
            try{
                var result=JSON.parse(res.body);
                token=result.access_token;
                endTimeTick=Date.now()+ result.expires_in*1000;
                callback(null,result.access_token);
            }catch (e){
                callback(e);
            }
        })
    }
})();

var jsapi_ticket=(function getJsapi_ticket() {
    var endTimeTick,token;
    return function (callback) {
        if(endTimeTick>Date.now() &&token) return callback(null,token);
        wxUrls.get_jsticket_url(function (err, ticketUrl) {
            request.get(ticketUrl,function (err, res) {
                if(err) return callback(err);
                try{
                    var result=JSON.parse(res.body);
                    token=result.ticket;
                    endTimeTick=Date.now()+ result.expires_in*1000;
                    callback(null,token);
                }catch (e){
                    callback(e);
                }
            })
        })
    }
})();

/*根据指定code获取用户openId*/
function getOpenId(code,callback) {
    request.get(wxUrls.get_outh2_url(code), function (err, res) {
        if(err) return callback(err);
        try{
            var result=JSON.parse(res.body);
            console.log("get openid:",result);
            callback(null,result.openid);
        }catch (e){
            callback(e);
        }
    });
}

function getOpenIdAndAccessToken(code,callback) {
    request.get(wxUrls.get_outh2_url(code), function (err, res) {
        if (err) return callback(err);
        try {
            var result = JSON.parse(res.body);
            callback(null, {
                openId: result.openid,
                accessToken: result.access_token,
                scope: result.scope
            });
        } catch (e) {
            callback(e);
        }
    });
}

function getUserInfo(openId,callback) {
    wxUrls.get_userInfo_url(openId,function (err, url) {
        if(err) return callback(err);
        request.get(url,function (err, res) {
            if(err) return callback(err);
            try{
                callback(null,JSON.parse(res.body));
            }catch (e){
                callback(e);
            }
        })
    })
}

function get_snsapi_userinfo(openId, accessToken,callback) {
    var url =`https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`;
    request.get(url,function (err,res) {
        if(err) return callback(err);
        var result =JSON.parse(res.body);
        callback(null,result);
    })
}

function getUserInfoByCode(code) {
    return co(function *() {
        var result = yield Promise.promiseify(getOpenIdAndAccessToken)(code);
        if (result.scope.includes('snsapi_userinfo')) {
            return Promise.promiseify(get_snsapi_userinfo)(result.openId, result.accessToken);
        }
        return result;
    })
}

function checkSignature(signature,timestamp,nonce,echostr) {
    var arrs=[TOKEN,timestamp,nonce];
    arrs.sort();
    if(signature===common.sha1(arrs.join(''))) return echostr;
}

function getJsConfigData(url,callback) {
    jsapi_ticket(function (err, ticket) {
        var data = {
            "noncestr": common.randomString(16, true),
            "jsapi_ticket": ticket,
            "timestamp": Date.now().toString(),
            "url": url
        };
        var keys = Object.keys(data);
        keys.sort();
        data.signature = common.sha1(keys.map((item)=>item + "=" + data[item]).join("&"));
        data.appID =APPID;
        callback(null, data);
    })
}

/*hours=0,永久*/
function getQR(arg,hours,callback) {
    wxUrls.get_QR_url(function (err, url) {
        if (err) return callback(err);
        var body = {
            "action_name": hours === 0 ? "QR_LIMIT_SCENE" : "QR_SCENE",
            "action_info": {
                "scene": {}
            }
        };
        if (hours > 0) body.expire_seconds = hours * 3600;
        if (typeof arg === "string") {
            body.action_info.scene.scene_str = arg;
        } else {
            body.action_info.scene.scene_id = arg;
        }
        request.post({
            url: url,
            body: JSON.stringify(body)
        }, function (err, res, body) {
            if (err) return callback(err);
            else
                body=JSON.parse(body);
                return callback(null, {
                    ticket: body.ticket,
                    expire_seconds: body.expire_seconds,
                    url: body.url,
                    qrUrl: "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket="+body.ticket
                });
        })
    })
}

module.exports= {
    getUserInfoByCode:getUserInfoByCode,
    getOpenIdAndAccessToken:getOpenIdAndAccessToken,
    get_snsapi_userinfo:get_snsapi_userinfo,
    getQR:getQR,/*获取指定格式的二维码 getQR(arg,hours,callback)*/
    getOpenId: getOpenId, /*获取访问用户的getOpenId(code,cb)*/
    getUserInfo: getUserInfo, /*获取用户的详细信息getUserInfo(openid,cb)*/
    checkSignature: checkSignature, /*微信服务器签权使用checkSignature(signature,timestamp,nonce,echostr)*/
    get_snsapi_base_url: wxUrls.get_snsapi_base_url, /*获取auto2的转换地址,通过此函数转换后的地址即可得到code,get_snsapi_base_url(url,flag)*/
    get_snsapi_userinfo_url: wxUrls.get_snsapi_userinfo_url, /*获取auto2的转换地址,通过此函数转换后的地址即可得到code并可以进一步转换,get_snsapi_base_url(url,flag)*/
    getJsConfigData: getJsConfigData/*获取weixin,js签权的对象,对象中含[noncestr,timestamp,url,signature],getJsConfigData(url,cb)*/
}


