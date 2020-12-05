"use strict";

let pageHelper = require("../../../helpers/page.helper.js"),
    CategoryService = require("../../services/category.service.js");

function index(req, res, next) {
    return res.render("admin/menu", {title: "菜单管理"});
}

function page(req, res, next) {
    let query = req.query || {},
        obj = pageHelper.handleIndexAndSize(query),
        conditions = pageHelper.handleConditions(query, {name: "string_like"});
    conditions["level"] = 1;
    conditions["isDelete"] = false;
    new CategoryService().queryPage(conditions, null, null, null, {createTime: -1}, obj.pageIndex, obj.pageSize)
        .then(result => res.json({state: 1, data: result.data, count: result.count}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function add(req, res, next) {
    let body = req.body || {},
        menu = {name: body.name, level: 1};
    new CategoryService().addCategory(menu)
        .then(result => res.json(result))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function update(req, res, next) {
    let body = req.body || {};
    new CategoryService().updateCategory(body)
        .then(data => res.json(data ? {state: 1, data: data} : {state: -1}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function remove(req, res, next) {
    new CategoryService().removeCategory(req.query.id)
        .then(data => res.json(data ? {state: 1, data: data} : {state: -1}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function list(req, res, next) {
    new CategoryService().getMenus()
        .then(data => {
            if (!Array.isArray(data)) return res.json({state: -1, msg: "错误的数据类型！"});

            let arrs = data.map(function (item) {
                return {name: item.name, value: item._id};
            });
            return res.json({state: 1, data: arrs});
        })
        .catch(err => res.json({state: 0, msg: err.message}));
}

module.exports = {
    index: index,
    page: page,
    add: add,
    update: update,
    remove: remove,
    list: list
};