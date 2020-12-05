"use strict";

let co = require("co"),
    OrderService = require("../services/order.service.js"),
    GrouponOrderService = require("../services/groupon-order.service.js"),
    OpenGrouponService = require("../services/open-groupon.service.js"),
    wxPay = require("../../wx/weixinPay.js"),
    payCallback = require("../../wx/paycallback.js");

function create(req, res, next) {
    if (!req.xhr) return next(new Error("不支持的请求方式！"));

    return co(function *() {
        let query = req.query || {},
            type = Number(query.type),
            id = query.id,
            order = null;
        if (type === 1) {
            order = yield new OrderService().getOrder(id);
        } else if (type === 2) {
            order = yield new GrouponOrderService().getGrouponOrder(id);
        } else return Promise.reject(new Error("不支持的订单类型！"));

        if (!order) return Promise.reject(new Error("订单数据不存在！"));

        let data = yield wxPay.jsapiPay(req.session.SUSER.openId, "七彩空间-" + order._id, order.total * 100, order._id);
        return res.json({state: 1, data: data});
    }).catch(err => res.json({state: 0, msg: err.message}));
}

module.exports = {
    create: create,
    callback: payCallback(function (data) {
        co(function *() {
            console.log("/pay/callback:", data);
            let id = data.out_trade_no,
                type = 1;
            if (type === 1) {
                let order = yield new OrderService().setState(id, OrderStateEnum.NonSend);
                console.log("OrderService.setState order:", order);
            } else if (type === 2) {
                let order = yield new GrouponOrderService().setState(id, GrouponOrderStateEnum.NonGroupon);
                console.log("GrouponOrderService.setState order:", order);
                yield new OpenGrouponService().setPayBack(order.openGroupon, order.orderer);
            } else return Promise.reject(new Error("不支持的订单类型！"));
        });
    }, "wx")
};