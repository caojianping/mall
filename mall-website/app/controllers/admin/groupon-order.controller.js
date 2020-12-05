"use strict";

let pageHelper = require("../../../helpers/page.helper.js"),
    GrouponOrderService = require("../../services/groupon-order.service.js");

function index(req, res, next) {
    return res.render("admin/groupon-order", {title: "团单管理"});
}

function page(req, res, next) {
    let query = req.query || {},
        obj = pageHelper.handleIndexAndSize(query),
        conditions = pageHelper.handleConditions(query, {state: "number_equal", time: "number_time"});
    conditions["isDelete"] = false;
    new GrouponOrderService().getPageGrouponOrders(conditions, [
        {path: "orderer", select: "_id nickname"},
        {
            path: "groupon",
            populate: {
                path: "commodity",
                select: "_id imgs"
            }
        },
        {path: "openGroupon"}
    ], null, obj.pageIndex, obj.pageSize)
        .then(result => res.json({state: 1, data: result.data, count: result.count}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function send(req, res, next) {
    new GrouponOrderService.send(req.query.id)
        .then(data => res.json(data ? {state: 1} : {status: 0, msg: "发货失败！"}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

module.exports = {
    index: index,
    page: page,
    send: send,
};