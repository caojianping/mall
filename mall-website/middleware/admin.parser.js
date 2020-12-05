"use strict";

let console = require("../helpers/log.helper.js").console;

module.exports = function () {
    return function (req, res, next) {
        let suser = req.session.SUSER_ADMIN;
        if (suser) return next();

        let baseUrl = req.baseUrl;
        if (baseUrl.equals("/admin") || baseUrl.equals("/admin/account/login")) return next();
        else return res.redirect("/admin/account/login");
    }
};