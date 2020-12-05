"use strict";

let co = require("co"),
    CommodityService = require("../services/commodity.service.js"),
    GrouponService = require("../services/groupon.service.js");

function index(req, res, next) {
    return co(function *() {
        let grouponService = new GrouponService(),
            commodityService = new CommodityService(),
            grouponList = yield grouponService.getGroupons(),
            discountList = yield commodityService.getDiscountCommodities(),
            hotList = yield commodityService.getHotCommodities(),
            result = yield commodityService.queryPage(null, null, null, null, {createTime: -1}, 1, 10);
        return res.render("index", {
            title: "七彩空间生活馆",
            grouponList: grouponList,//团购商品
            discountList: discountList,//折扣商品
            hotList: hotList,//热销商品
            data: result.data
        });
    }).catch(err => next(err));
}

function category(req, res, next) {
    return co(function *() {
        let CategoryService = require("../services/category.service.js"),
            categoryService = new CategoryService(),
            menus = yield categoryService.getMenus(),
            id = req.query.id || null,
            data = null;
        if (Array.isArray(menus) && menus.length > 0) {
            if (!id) {
                id = menus[0]._id;
            }
            data = yield categoryService.getCategoriesById(id);
        }
        return res.render("category", {
            title: "商品分类",
            id: id,
            menus: menus,
            data: data
        });
    }).catch(err => next(err));
}

function list(req, res, next) {
    let query = req.query || {},
        categoryId = query.id,
        categoryName = query.name;
    new CommodityService().getCommoditiesByCategory(categoryId)
        .then(data => res.render("list", {
            title: categoryName + "商品列表",
            data: data
        }))
        .catch(err => next(err));
}

function detail(req, res, next) {
    return co(function *() {
        let id = req.query.id,
            commodity = yield new CommodityService().getCommodity(id);
        if (!commodity) return Promise.reject(new Error("无效的commodity"));

        let userId = req.session.SUSER.userId,
            CartService = require("../services/cart.service.js"),
            OpenGrouponService = require("../services/open-groupon.service.js"),
            cartService = new CartService(),
            commodityQuantity = yield cartService.getQuantityByCommodityId(userId, id, commodity.units[0]._id),
            cartQuantity = yield cartService.getQuantityByUserId(userId),
            groupon = commodity ? yield new GrouponService().getGrouponByCommodityId(commodity._id) : null,
            openGroupons = groupon ? yield new OpenGrouponService().getOpenGroupons(groupon._id) : null;
        return res.render("detail", {
            title: "商品详情",
            commodityQuantity: commodityQuantity,
            cartQuantity: cartQuantity,
            commodity: commodity,
            groupon: groupon,
            openGroupons: openGroupons,
            msg: req.query.msg || ""
        });
    }).catch(err => next(err));
}

function search(req, res, next) {
    return co(function *() {
        let commodityService = new CommodityService(),
            keyword = null,
            hotList = yield commodityService.getHotCommodities(),
            data = null,
            method = req.method.toLowerCase();
        if (method === "post") {
            keyword = req.body.keyword;
            data = yield commodityService.getCommoditiesByName(keyword);
        }
        return res.render("search", {
            title: "商品搜索",
            keyword: keyword,
            hotList: hotList,
            data: data
        });
    }).catch(err => next(err));
}

function suggest(req, res, next) {
    if (!req.xhr) return next(new Error("不支持的请求方式！"));
    new CommodityService().getCommoditiesByName(req.query.keyword)
        .then(data => res.json({state: 1, data: data}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

module.exports = {
    index: index,
    category: category,
    list: list,
    detail: detail,
    search: search,
    suggest: suggest
};
