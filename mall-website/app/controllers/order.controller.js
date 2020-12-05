"use strict";

let co = require("co"),
    querystring = require("querystring"),
    OrderService = require("../services/order.service.js"),
    GrouponOrderService = require("../services/groupon-order.service.js"),
    CartService = require("../services/cart.service.js");

function index(req, res, next) {
    return co(function *() {
        let userId = req.session.SUSER.userId,
            query = req.query || {},
            type = Number(query.type),
            state = query.state || "*",
            actionData = require("../../actions.json"),
            stateNavs = [
                {state: "*", text: "全部" + (type === 1 ? "订单" : "团单"), style: "order-all"},
                {state: "0", text: "待付款", style: "order-nonpay"},
                {state: "2", text: "待发货", style: "order-nonsend"},
                {state: "3", text: "待收货", style: "order-nonreceive"},
                {state: "10", text: "已完成", style: "order-completed"}
            ],
            stateConfig = {
                "0": "待付款",
                "2": "待发货",
                "3": "待收货",
                "10": "已完成",
                "-10": "已取消"
            }, title, result, actions;
        if (type === 1) {
            title = "商品订单列表";
            result = yield new OrderService().getOrders(userId, state);
            actions = actionData["commodity"];
        } else if (type === 2) {
            stateNavs.splice(2, 0, {state: "1", text: "待拼团", style: "order-nongroupon"});
            stateConfig["1"] = "待拼团";
            stateConfig["-1"] = "拼团失败";
            title = "团购订单列表";
            result = yield new GrouponOrderService().getGrouponOrders(userId, state);
            actions = actionData["groupon"];
        } else return Promise.reject(new Error("不支持的订单类型！"));

        return res.render("order", {
            title: title,
            type: type,
            state: state,
            stateNavs: stateNavs,
            stateConfig: stateConfig,
            data: result.data,
            actions: actions
        });
    }).catch(err => next(err));
}

function confirm(req, res, next) {
    return co(function *() {
        let userId = req.session.SUSER.userId,
            type = Number(req.query.type),
            title, data;
        if (type === 1) {
            title = "确认商品订单";
            data = yield new CartService().getConfirmCarts(userId);
        } else if (type === 2) {
            title = "确认团购订单";
            data = yield new CartService().getConfirmGrouponCart(userId);
        } else return Promise.reject(new Error("不支持的订单类型！"));

        return res.render("confirm", {
            title: title,
            type: type,
            data: data
        });
    }).catch(err => next(err));
}

function add(req, res, next) {
    if (!req.xhr) return next(new Error("不支持的访问方式！"));

    return co(function *() {
        let type = Number(req.query.type),
            userId = req.session.SUSER.userId,
            body = req.body || {};
        if (type === 1) {
            let result = yield new OrderService().addOrder(userId, body.addressId, body.carts);
            return res.json(result);
        } else if (type === 2) {
            let result = yield new GrouponOrderService().addGrouponOrder(userId, body.addressId, body.grouponId, body.openGrouponId, body.quantity);
            return res.json(result);
        } else return Promise.reject(new Error("不支持的订单类型！"));
    }).catch(err => res.json({state: 0, msg: err.message}));
}

function pay(req, res, next) {
    let query = req.query || {},
        type = Number(query.type),
        id = query.id;
    if (type === 1) {
        new OrderService().getOrder(id)
            .then(data => res.render("pay", {
                title: "商品订单支付",
                type: type,
                data: data
            }))
            .catch(err => next(err));
    } else if (type === 2) {
        new GrouponOrderService().getGrouponOrder(id)
            .then(data => res.render("pay", {
                title: "团购订单支付",
                type: type,
                data: data
            }))
            .catch(err => next(err));
    } else next(new Error("不支持的订单类型！"));
}

function setState(req, res, next) {
    let params = req.params || {},
        type = Number(params.type),
        state = params.state,
        id = params.id,
        action = Number(params.action),
        args = {
            type: type,
            state: state
        };
    if (type === 1) {
        new OrderService().setState(id, action)
            .then(data => {
                if (!data) {
                    args["msg"] = "订单状态更新失败！";
                }
                return res.redirect("/order/index?" + querystring.stringify(args));
            })
            .catch(err => next(err));
    } else if (type === 2) {
        new GrouponOrderService().setState(id, action)
            .then(data => {
                if (!data) {
                    args["msg"] = "团单状态更新失败！";
                }
                return res.redirect("/order/index?" + querystring.stringify(args));
            })
            .catch(err => next(err));
    } else next(new Error("不支持的订单类型！"));
}

module.exports = {
    index: index,
    confirm: confirm,
    add: add,
    pay: pay,
    setState: setState
};
