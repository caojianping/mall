"use strict";

let co = require("co"),
    BaseService = require("./base.service.js");

function GrouponOrderService() {
    BaseService.call(this, "grouponOrder");
}

GrouponOrderService.prototype = {
    getGrouponOrders: function (userId, state) {
        if (!userId) return Promise.reject("无效的用户编号！");

        let that = this,
            conditions = {orderer: userId};
        if (state !== "*") {
            conditions["state"] = Number(state);
        }
        return co(function *() {
            let result = yield that.queryPage(conditions, null, null, [
                    {path: "orderer", model: "user", select: "_id nickname"},
                    {
                        path: "groupon",
                        model: "groupon",
                        populate: {
                            path: "commodity",
                            model: "commodity",
                            select: "_id name imgs"
                        }
                    },
                    {path: "openGroupon", model: "openGroupon"}
                ], {createTime: -1}, 1, 10),
                data = result.data,
                AddressService = require("./address.service.js"),
                addressService = new AddressService();
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                item["address"] = yield addressService.getAddress(item.orderer._id, item.addressId);
            }
            return result;
        });
    },
    getGrouponOrder: function (id) {
        if (!id) return Promise.reject("无效的编号！");
        return this.querySingle({_id: id, isDelete: false});
    },
    addGrouponOrder: function (userId, addressId, grouponId, openGrouponId, quantity) {
        if (!userId) return Promise.reject("无效的用户编号！");
        if (!addressId) return Promise.reject("无效的地址编号！");
        if (!grouponId) return Promise.reject("无效的团购编号！");
        if (!openGrouponId) return Promise.reject("无效的开团编号！");
        if (isNaN(quantity) || quantity < 0) return Promise.reject("无效的数量！");

        let that = this;
        return co(function *() {
            let GrouponService = require("./groupon.service.js"),
                groupon = yield new GrouponService().getGroupon(grouponId);
            if (!groupon) return Promise.reject(new Error("团购商品不存在！"));

            let total = groupon.price * quantity,
                data = yield that.Model.create({
                    orderer: userId,
                    addressId: addressId,
                    groupon: grouponId,
                    openGroupon: openGrouponId,
                    quantity: quantity,
                    total: total.toFixed(2),
                    state: GrouponOrderStateEnum.NonPay,
                    createTime: new Date()
                });
            if (!data) return {state: -2, msg: "订单添加失败！"};

            let UserService = require("./user.service.js"),
                userData = yield new UserService().removeGrouponCart(userId);
            if (!userData) return {state: -3, msg: "用户数据更新失败！"};
            else return {state: 1, data: data};
        });
    },
    setState: function (id, action) {
        if (!id) return Promise.reject("无效的订单编号！");

        let that = this,
            conditions = {_id: id, isDelete: false};
        if (action === -100) return that.removeSingle(conditions, {$set: {isDelete: true, updateTime: new Date()}});
        else return that.updateSingle(conditions, {$set: {state: action, updateTime: new Date()}});
    },
    setPayBack: function (openGrouponId, joinList) {
        if (!openGrouponId) return Promise.reject(new Error("无效的开团编号！"));

        let that = this;
        return co(function *() {
            yield that.Model.updateMany({
                openGroupon: openGrouponId,
                state: GrouponOrderStateEnum.NonGroupon,
                orderer: {$in: joinList}
            }, {state: GrouponOrderStateEnum.NonSend});
            yield that.Model.updateMany({
                openGroupon: openGrouponId,
                state: GrouponOrderStateEnum.NonPay
            }, {state: GrouponOrderStateEnum.Failed});
            return true;
        });
    },
    //for admin
    getPageGrouponOrders: function (conditions, populate, sort, pageIndex, pageSize) {
        let that = this;
        return co(function *() {
            let result = yield that.queryPage(conditions, null, null, populate, sort, pageIndex, pageSize),
                data = result.data,
                AddressService = require("./address.service.js"),
                addressService = new AddressService();
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                item["address"] = yield addressService.getAddress(item.orderer._id, item.addressId);
            }
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
                state: GrouponOrderStateEnum.NonReceive,
                updateTime: new Date()
            }
        });
    }
};

module.exports = GrouponOrderService;