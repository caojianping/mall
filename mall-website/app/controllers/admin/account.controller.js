"use strict";

let ManagerService = require("../../services/manager.service.js");

function login(req, res, next) {
    let method = req.method.toLowerCase();
    if (method === "get") {
        let suser = req.session.SUSER_ADMIN;
        if (suser && req.query.from !== "pwd") res.redirect("/admin/commodity/index");
        else res.render("admin/login", {title: "七彩空间生活馆CMS", msg: null});
    } else if (method === "post") {
        let body = req.body || {};
        new ManagerService().login(body.username, body.password)
            .then(result => {
                let state = result.state;
                if (state !== 1) return res.render("admin/login", {title: "七彩空间生活馆CMS", msg: state});

                let data = result.data;
                req.session.SUSER_ADMIN = {userId: data._id, username: data.username};
                req.session.cookie.maxAge = body.rememberMe === "true" ? ONE_WEEK : TWO_HOURS;
                req.app.locals.username = data.username;
                return res.redirect("/admin/commodity/index");
            })
            .catch(err => next(err));
    } else return next(new Error("不支持的请求方式！"));
}

function logout(req, res, next) {
    delete req.session.SUSER_ADMIN;
    delete req.app.locals.username;
    res.redirect("/admin/account/login");
}

function secure(req, res, next) {
    return res.render("admin/secure", {
        title: "安全中心",
        msg: req.query.msg || ""
    });
}

function password(req, res, next) {
    let body = req.body || {};
    new ManagerService().password(req.session.SUSER_ADMIN.userId, body.oldPwd, body.newPwd, body.confirmPwd)
        .then(result => {
            if (result.state === 1) res.redirect("/account/login");
            else res.redirect("/account/secure?msg=" + result.state);
        })
        .catch(err => next(err));
}

module.exports = {
    login: login,
    logout: logout,
    secure: secure,
    password: password
};