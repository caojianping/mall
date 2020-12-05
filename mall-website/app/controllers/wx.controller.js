"use strict";

let wxHelper = require("../../wx/weixinHelper.js");

function getSignature(req, res, next) {
    if (!req.xhr) return next(new Error("不支持的请求方式！"));

    let body = req.body || {},
        url = body.url || "";
    if (!url) return res.json({state: 0, msg: "无效的地址！"});

    wxHelper.getJsConfigData(url, function (err, data) {
        return res.json(err ?
            {state: 0, msg: err.message} :
            {state: 1, data: data, suser: req.session.SUSER}
        );
    });
}

module.exports = {
    getSignature: getSignature
};