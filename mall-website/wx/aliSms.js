/*
* item：{tel:"13485695007",code:"12345",expire:new Date()}
* */
var request=require("request");

var items=[];

function sendModifyPassword(tel, cb) {
    sendLogin(tel, "SMS_31135060", cb);
}

function sendLogin(tel, cb) {
    sendLogin(tel, "SMS_31135062", cb);
}

/*发送登陆验证短信*/
function _sendLogin(tel,templateCode,cb) {
    var item=getItem(tel,true);
    //send
    var config={
        Format:"JSON",
        Version:"2016-09-27",
        AccessKeyId:"LTAIF6qD70wKdi64",
        SignatureMethod:"HMAC-SHA1",
        Timestamp:new Date().toISOString(),
        SignatureVersion:"1.0",
        SignatureNonce:randomString(9),
        Action:"SingleSendSms",
        SignName:"经看",
        TemplateCode:templateCode,
        RecNum:item.tel,
        ParamString:JSON.stringify({code:item.code,product:"【经看网】"})
    };
    config.Signature=sign(config);//sign
    var p= new Promise(function (resolve, reject) {
        request.post({
            url:'https://sms.aliyuncs.com/',
            form:config
        },function (err, res, body) {
            if(err) reject(err);
            else{
                item.expire=Date.now()+600000;
                resolve(true);
            }
        });
    });
    if(!cb) return p;
    p.then(o=>cb(null,o)).catch(err=>cb(err));
}

/*检验是否合法*/
function check(tel,code) {
    var index= items.findIndex(function (item) {
        return item.tel===tel&&item.code===code;
    });
    if(index!==-1){
        items.splice(index,1);
        return true;
    }
    return false;
}

/*根据手机号获取执行记录*/
function getItem(tel,isCreate) {
    var telItem = items.find(function (item) {
        return item.tel === tel;
    });
    if (isCreate && !telItem) {
        telItem = {tel: tel, code: randomString(6, false, true)};
        items.push(telItem);
    }
    return telItem;
}

/*定时清理*/
setInterval(function () {
    var now=Date.now();
    for(var i=0;i<items.length;i++){
        if(items[i].expire<=now){
            items.splice(i,1);
            i--;
        }
    }
    console.log("contains:",items.length);
},30000);

function randomString(len,hasUpper,onlydata) {
    len = len || 32;
    hasUpper=!!hasUpper;
    onlydata=!!onlydata;
    var sources =hasUpper?"ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678": 'abcdefhijkmnprstwxyz2345678';
    sources=onlydata?"0123456789":sources;
    var maxPos = sources.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += sources.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function sign(obj) {
    var arr = [];
    Object.keys(obj).forEach(function (key) {
        if (key !== "sign" && obj[key]) {
            arr.push(encodeURIComponent(key) + "=" + encodeURIComponent((typeof obj[key] === "object" ? JSON.stringify(obj[key]) : obj[key])));
        }
    });
    arr.sort();
    var strA = "POST&" + encodeURIComponent("/") + "&" + encodeURIComponent(arr.join("&"));
    console.log(strA);
    var hamc = require("crypto").createHmac("sha1", "Bmk7i4zqdMUhC0ai9hZFQny2YEGcIb&");
    //hamc.update(strA,'utf-8');
    hamc.update(new Buffer(strA,'utf-8'));
    return hamc.digest("base64");
}

module.exports= {
    send: sendLogin,
    check: check,
    sendModifyPassword:sendModifyPassword
}

