"use strict";

let co = require("co"),
    terminal = require("../utils/terminal.js"),
    UserService = require("../app/services/user.service.js"),
    wxHelper = require("../wx/weixinHelper.js"),
    console = require("../helpers/log.helper.js").console,
    loggers = require("../helpers/log.helper.js").loggers;

module.exports = function () {
    return function (req, res, next) {
        //过滤管理路由
        let path = req.path;
        if (path.startsWith("/admin")) return next();

        //处理正常路由
        let isWechat = terminal.isWechat(req);
        console.info("/terminalParser isWechat:", isWechat);
        if (!isWechat) {
            let openId = "oxhwBv1iFWrkMPNtGNpV43SIuVuY",
                nickname = "曹剑平",
                avatar = "http://wx.qlogo.cn/mmopen/vi_32/gHUVCVKq0ZczJGVKbIADHcdUC5079ZibFgU8oDNIeuZIRiaibg9X01J5WcZtN638196Plv3DbIa0riceP5H1nv2Qcg/0";
            return new UserService().setUser(openId, nickname, avatar)
                .then(result => {
                    // console.info("/terminalParser result:", result);
                    if (result.state !== 1) return Promise.reject(new Error(result.msg));
                    let data = result.data;
                    req.session.SUSER = {userId: data._id, openId: data.openId};
                    req.session.cookie.maxAge = TWO_HOURS;
                    return next();
                })
                .catch(err => next(err));
        }

        let suser = req.session.SUSER;
        if (suser) return next();

        let code = req.query.code;
        if (!code) return next(new Error("无效的code！"));

        return co(function *() {
            let userInfo = yield wxHelper.getUserInfoByCode(code);
            if (!userInfo) return Promise.reject(new Error("微信用户信息获取失败！"));

            let data = yield new UserService().setUser(userInfo.openid, userInfo.nickname, userInfo.headimgurl);
            req.session.SUSER = {userId: data._id, openId: data.openId};
            req.session.cookie.maxAge = TWO_DAYS;
            return next();
        }).catch(err => {
            console.info("/terminalParser err：", err.message);
            loggers.info("/terminalParser err：", err);
            return next(err);
        });
    };
};