"use strict";

let co = require("co"),
    done = require("../../utils/done.js"),
    BaseService = require("./base.service.js");

function CartService() {
    BaseService.call(this, "user");

    this._addCart = function (userId, commodityId, unitId, quantity, flag) {
        return this.updateSingle({
            _id: userId,
            isDelete: false
        }, {
            $set: {
                updateTime: new Date()
            },
            $addToSet: {
                carts: {
                    commodity: commodityId,
                    unitId: unitId,
                    quantity: quantity,
                    flag: flag
                }
            }
        });
    };
}

CartService.prototype = {
    getCarts: function (userId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));

        let that = this;
        return co(function *() {
            let data = yield that.querySingle({_id: userId, isDelete: false}, null, null, {path: "carts.commodity"});
            if (!data) return Promise.reject(new Error("用户不存在！"));

            let carts = Array.isArray(data.carts) ? data.carts : [],
                CommodityService = require("./commodity.service.js"),
                commodityService = new CommodityService();
            for (let i = 0; i < carts.length; i++) {
                let item = carts[i];
                item["unit"] = yield commodityService.getUnit(item.commodity._id, item.unitId);
            }
            return carts;
        });
    },
    getConfirmCarts: function (userId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));

        let that = this;
        return co(function *() {
            let data = yield that.querySingle({_id: userId, isDelete: false}, null, null, {path: "carts.commodity"});
            if (!data) return Promise.reject(new Error("用户不存在！"));

            let addresses = Array.isArray(data.addresses) ? data.addresses.filter(function (item) {
                    return !item.isDelete;
                }) : [],
                carts = Array.isArray(data.carts) ? data.carts.filter(function (item) {
                    return item.flag;
                }) : [];

            let CommodityService = require("./commodity.service.js"),
                commodityService = new CommodityService();
            for (let i = 0; i < carts.length; i++) {
                let item = carts[i];
                item["unit"] = yield commodityService.getUnit(item.commodity._id, item.unitId);
            }
            return {
                addresses: addresses,
                carts: carts
            };
        });
    },
    getConfirmGrouponCart: function (userId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));

        let that = this;
        return co(function *() {
            let data = yield that.querySingle({_id: userId, isDelete: false});
            if (!data) return Promise.reject(new Error("用户不存在！"));

            let addresses = Array.isArray(data.addresses) ? data.addresses.filter(function (item) {
                    return !item.isDelete;
                }) : [],
                openGroupon = null,
                quantity = 0,
                grouponCart = data.grouponCart;
            if (grouponCart) {
                let OpenGrouponService = require("./open-groupon.service.js");
                openGroupon = yield new OpenGrouponService().getOpenGroupon(grouponCart.openGrouponId);
                quantity = grouponCart.quantity;
            }
            return {
                addresses: addresses,
                openGroupon: openGroupon,
                quantity: quantity
            };
        });
    },
    getQuantityByCommodityId: function (userId, commodityId, unitId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!commodityId) return Promise.reject(new Error("无效的商品编号！"));
        if (!unitId) return Promise.reject(new Error("无效的单位编号！"));

        return this.querySingle({_id: userId, isDelete: false}).then(data => {
            if (!data) return Promise.reject(new Error("用户不存在！"));

            let quantity = 0,
                carts = Array.isArray(data.carts) ? data.carts : [];
            for (let i = 0; i < carts.length; i++) {
                let item = carts[i];
                if (commodityId.toString() === item.commodity.toString() && unitId.toString() === item.unitId.toString()) {
                    quantity = item.quantity;
                    break;
                }
            }
            return quantity;
        });
    },
    getQuantityByUserId: function (userId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));

        return this.querySingle({_id: userId, isDelete: false}).then(data => {
            if (!data) return Promise.reject(new Error("用户不存在！"));
            return Array.isArray(data.carts) ? data.carts.length : 0;
        });
    },
    addCart: function (userId, commodityId, unitId, quantity, immediate) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!commodityId) return Promise.reject(new Error("无效的商品编号！"));
        if (!unitId) return Promise.reject(new Error("无效的单位编号！"));
        if (!quantity || isNaN(quantity) || quantity <= 0) return Promise.reject(new Error("无效的商品数量！"));
        immediate = !!immediate;

        let that = this;
        return co(function *() {
            let userData = yield that.querySingle({_id: userId, isDelete: false});
            if (!userData) return {state: -1, msg: "用户不存在！"};

            //判断购物车是否已经存在
            let conditions = {
                    _id: userId,
                    isDelete: false,
                    "carts.commodity": commodityId,
                    "carts.unitId": unitId
                },
                result = yield that.isExist(conditions);
            if (result) {
                //更新购物车数据
                let updateData = yield that.updateSingle(conditions, {
                    $inc: {"carts.$.quantity": quantity,},
                    $set: {
                        "carts.$.flag": true,
                        updateTime: new Date()
                    }
                });
                return updateData ? {state: 1, data: updateData} : {state: -2, msg: "更新购物车失败！"};
            } else {
                //添加购物车数据
                let carts = Array.isArray(userData.carts) ? userData.carts : [];
                if (carts.length > 0 && immediate) {//立即支付
                    carts.forEach(function (item) {
                        item.flag = false;
                    });
                    yield that.updateCarts(userId, carts);
                }
                let cartData = yield that._addCart(userId, commodityId, unitId, quantity, true);
                return cartData ? {state: 1, data: cartData} : {state: -3, msg: "添加购物车失败！"};
            }
        });
    },
    updateCarts: function (userId, carts) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!Array.isArray(carts)) return Promise.reject(new Error("无效的购物车数据！"));

        return this.updateSingle({
            _id: userId,
            isDelete: false
        }, {
            $set: {
                carts: carts,
                updateTime: new Date()
            }
        });
    },
    settleCarts: function (userId, carts) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!Array.isArray(carts)) return Promise.reject(new Error("无效的购物车数据！"));

        let that = this;
        return co(function *() {
            let userData = yield that.querySingle({_id: userId, isDelete: false});
            if (!userData) return {state: -1, msg: "用户不存在！"};

            let arrs = Array.isArray(userData.carts) ? userData.carts : [];
            arrs.forEach(function (item) {
                item["flag"] = false;
                carts.forEach(function (jitem) {
                    if (jitem.id.toString() === item._id.toString()) {
                        item["quantity"] = jitem.quantity;
                        item["flag"] = true;
                    }
                });
            });
            let updateData = yield that.updateCarts(userId, arrs);
            return updateData ? {state: 1, data: updateData} : {state: -2, msg: "结算失败！"};
        });
    },
    removeCarts: function (userId, ids) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!Array.isArray(ids)) return Promise.reject(new Error("无效的购物车编号数据！"));

        return this.updateSingle({
            _id: userId,
            isDelete: false
        }, {
            $set: {updateTime: new Date()},
            $pull: {carts: {_id: {$in: ids}}}
        });
    }
};

module.exports = CartService;