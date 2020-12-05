"use strict";

let device = require("device");

function getUserAgent(req) {
    if (!req) throw new Error("无效的请求上下文！");

    let headers = req.headers;
    if (!headers) throw new Error("无效的请求头数据！");

    let userAgent = headers["user-agent"];
    if (!userAgent) throw new Error("无效的用户代理数据！");
    return userAgent;
}

module.exports = {
    isMobile: function (req) {
        let userAgent = getUserAgent(req),
            mydevice = device(userAgent);
        return mydevice.type !== "desktop";
    },
    isWechat: function (req) {
        let userAgent = getUserAgent(req);
        return /micromessenger/i.test(userAgent.toLowerCase());
    }
};