"use strict";

let co = require("co"),
    BaseService = require("./base.service.js");

function OrderService() {
    BaseService.call(this, "order");
}

OrderService.prototype = {
    getOrders: function (userId, state) {
        if (!userId) return Promise.reject("无效的用户编号！");

        let that = this,
            conditions = {orderer: userId};
        if (state !== "*") {
            conditions["state"] = Number(state);
        }
        return co(function *() {
            let result = yield that.queryPage(conditions, null, null, [
                    {path: "orderer", model: "user", select: "_id nickname"},
                    {path: "details.commodity", model: "commodity", select: "_id name imgs"}
                ], {createTime: -1}, 1, 10),
                data = result.data,
                AddressService = require("./address.service.js"),
                CommodityService = require("./commodity.service.js"),
                addressService = new AddressService(),
                commodityService = new CommodityService();
            for (let i = 0; i < data.length; i++) {
                let item = data[i],
                    details = item.details;
                item["address"] = yield addressService.getAddress(item.orderer._id, item.addressId);
                for (let j = 0; j < details.length; j++) {
                    let ditem = details[j];
                    ditem["unit"] = yield commodityService.getUnit(ditem.commodity._id, ditem.unitId);
                }
            }
            return result;
        });
    },
    getOrder: function (id) {
        if (!id) return Promise.reject("无效的订单编号！");

        let that = this;
        return co(function *() {
            let data = yield that.querySingle({_id: id, isDelete: false}, null, null, [
                {path: "orderer", select: "nickname"},
                {path: "details.commodity", select: "_id name"}
            ]);
            if (!data) return null;

            let AddressService = require("./address.service.js"),
                CommodityService = require("./commodity.service.js");
            data["address"] = yield new AddressService().getAddress(data.orderer._id, data.addressId);
            for (let i = 0; i < data.details.length; i++) {
                let item = data.details[i];
                item["unit"] = yield new CommodityService().getUnit(item.commodity._id, item.unitId);
            }
            return data;
        });
    },
    addOrder: function (userId, addressId, data) {
        if (!userId) return Promise.reject("无效的用户编号！");
        if (!addressId) return Promise.reject("无效的地址编号！");
        if (!Array.isArray(data)) return Promise.reject("无效的订单数据！");

        let that = this;
        return co(function *() {
            //第一步：获取用户数据
            let UserService = require("./user.service.js"),
                userData = yield new UserService().getUser(userId);
            if (!userData) return {state: -1, msg: "用户不存在"};

            //第二步：更新购物车数据
            let carts = Array.isArray(userData.carts) ? userData.carts : [],
                ids = data.map(function (item) {
                    return item._id.toString();
                });
            let filters = carts.filter(function (item) {
                item.flag = false;
                return !ids.isExist(null, item._id.toString());
            });
            let CartService = require("./cart.service.js"),
                cartData = yield new CartService().updateCarts(userId, filters);
            if (!cartData) return {state: -2, msg: "购物车更新失败"};

            //第三步添加订单数据
            let total = 0;
            data.forEach(function (item) {
                total += item.unit.price * item.unit.discount * item.quantity;
            });
            let details = data.map(function (item) {
                delete item._id;
                delete item.unit;
                return item;
            });
            let orderData = yield that.Model.create({
                orderer: userData._id,
                addressId: addressId,
                details: details,
                total: total.toFixed(2),
                state: OrderStateEnum.NonPay
            });
            return orderData ? {state: 1, data: orderData} : {state: -3, msg: "订单添加失败"};
        });
    },
    setState: function (id, action) {
        if (!id) return Promise.reject("无效的订单编号！");

        let that = this,
            conditions = {_id: id, isDelete: false};
        if (action === -100) return that.removeSingle(conditions, {$set: {isDelete: true, updateTime: new Date()}});
        else return that.updateSingle(conditions, {$set: {state: action, updateTime: new Date()}});
    },
    //for admin
    getPageOrders: function (conditions, populate, sort, pageIndex, pageSize) {
        let that = this;
        return co(function *() {
            let result = yield that.queryPage(conditions, null, null, populate, sort, pageIndex, pageSize),
                data = result.data,
                AddressService = require("./address.service.js"),
                CommodityService = require("./commodity.service.js"),
                addressService = new AddressService(),
                commodityService = new CommodityService();
            for (let i = 0; i < data.length; i++) {
                let item = data[i],
                    details = item.details;
                item["address"] = yield addressService.getAddress(item.orderer._id, item.addressId);
                for (let j = 0; j < details.length; j++) {
                    let ditem = details[j];
                    ditem["unit"] = yield commodityService.getUnit(ditem.commodity._id, ditem.unitId);
                }
            }
            console.log("/getPageOrders result:", result);
            return result;
        });
    },
    send: function (id) {
        if (!id) return Promise.reject(new Error("无效的订单编号！"));

        return this.updateSingle({
            _id: id,
            isDelete: false
        }, {
            $set: {
                state: OrderStateEnum.NonReceive,
                updateTime: new Date()
            }
        });
    }
};

module.exports = OrderService;