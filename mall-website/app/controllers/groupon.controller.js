"use strict";

let co = require("co"),
    querystring = require("querystring"),
    GrouponService = require("../services/groupon.service.js"),
    OpenGrouponService = require("../services/open-groupon.service.js"),
    UserService = require("../services/user.service.js");

function openList(req, res, next) {
    return co(function *() {
        let id = req.query.id,
            groupon = yield new GrouponService().getGroupon(id),
            data = yield new OpenGrouponService().getOpenGroupons(id);
        return res.render("open-list", {
            title: "正在开团",
            groupon: groupon,
            data: data
        });
    }).catch(error => next(err));
}

function open(req, res, next) {
    return co(function *() {
        let userId = req.session.SUSER.userId,
            body = req.body || {},
            result = yield new OpenGrouponService().setOpen(userId, body.grouponId, Number(body.quantity));
        if (result.state === 1) return res.redirect("/order/confirm?" + querystring.stringify({type: 2}));
        else return res.redirect("/commodity/detail?" + querystring.stringify({id: body.id, msg: result.msg}));
    }).catch(err => next(err));
}

function join(req, res, next) {
    return co(function *() {
        let userId = req.session.SUSER.userId,
            body = req.body || {},
            result = yield new OpenGrouponService().setJoin(body.openGrouponId, userId, Number(body.quantity));
        if (result.state === 1) return res.redirect("/order/confirm?" + querystring.stringify({type: 2}));
        else return res.redirect("/commodity/detail?" + querystring.stringify({id: body.id, msg: result.msg}));
    }).catch(err => next(err));
}

module.exports = {
    openList: openList,
    open: open,
    join: join
};
