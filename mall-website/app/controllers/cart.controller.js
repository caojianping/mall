"use strict";

let co = require("co"),
    querystring = require("querystring"),
    CartService = require("../services/cart.service.js");

function index(req, res, next) {
    new CartService().getCarts(req.session.SUSER.userId)
        .then(data => res.render("cart", {
            title: "我的购物车",
            msg: req.query.msg || "",
            data: data
        }))
        .catch(err => next(err));
}

function add(req, res, next) {
    if (!req.xhr) return next(new Error("不支持的请求方式！"));

    return co(function *() {
        let userId = req.session.SUSER.userId,
            body = req.body || {},
            immediate = req.query.immediate === "1",
            result = yield new CartService().addCart(userId, body.commodityId, body.unitId, body.quantity, immediate);
        if (result.state !== 1) return res.json(result);

        let count = yield new CartService().getQuantityByUserId(userId);
        return res.json({state: 1, count: count});
    }).catch(err => res.json({state: 0, msg: err.message}));
}

function settle(req, res, next) {
    if (!req.xhr) return next(new Error("不支持的请求方式！"));

    let body = req.body || [];
    new CartService().settleCarts(req.session.SUSER.userId, body)
        .then(result => {
            let state = result.state;
            if (state !== 1) return res.json(result);

            let data = body.map(function (item) {
                return item.id;
            });
            return res.json({state: 1, data: data});
        })
        .catch(err => res.json({state: 0, msg: err.message}));
}

function remove(req, res, next) {
    let redirectUrl = "/cart/index",
        ids = req.body.ids;
    if (ids === undefined) {
        ids = [];
    } else if (typeof ids === "string") {
        ids = [ids];
    }
    new CartService().removeCarts(req.session.SUSER.userId, ids)
        .then(result => {
            if (!result) {
                redirectUrl += "?" + querystring.stringify({msg: "删除失败！"});
            }
            return res.redirect(redirectUrl);
        })
        .catch(err => next(err));
}

module.exports = {
    index: index,
    add: add,
    settle: settle,
    remove: remove
};
