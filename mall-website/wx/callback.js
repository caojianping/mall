/**
 * Created by ycl on 2016/7/25.
 */
/*url:wx/callback*/
var concat=require('concat-stream');
var tool=require("./common");
var wxHelper=require('./weixinHelper');
var debug=require("debug")("weixin:wx");
// var ec=require("../eventCtrl");

function done(req,res) {
    var method = req.method.toLowerCase();
    if (method === "get") {
        get(req, res);
    } else if (method === "post") {
        post(req, res);
    } else {
        res.end("unknown method %s", method);
    }
}

function get(req, res) {
    var result = wxHelper.checkSignature(req.query.signature, req.query.timestamp, req.query.nonce, req.query.echostr);
    if (result)
        res.end(result);
    else res.end("check err query:" + JSON.stringify(req.query));
}

function post(req,res) {
    req.pipe(concat(function (body) {
        xml2js(body).then(obj=>{
            obj=obj.xml;
            if(obj.MsgType==="event"){
                // ec.router(obj);
            }
        });
        res.end("");
    }));
}

function transform(req, res) {
    req.query= require('url').parse(req.url,true);
}

function xml2js(data) {
    return new Promise(function (resolve, reject) {
        require("xml2js").parseString(data, {explicitArray: false}, function (err, json) {
            if (err) return reject(err);
            else return resolve(json);
        })
    })
    //return Promise.promiseify(require("xml2js").parseString)(data, {explicitArray: false});
}

module.exports=done;