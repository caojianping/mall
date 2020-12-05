"use strict";

let co = require("co"),
    done = require("../../utils/done.js"),
    BaseService = require("./base.service.js");

function AddressService() {
    BaseService.call(this, "user");
}

AddressService.prototype = {
    getAddresses: function (userId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));

        return this.querySingle({_id: userId, isDelete: false}).then(data => {
            if (!data) return Promise.reject(new Error("用户不存在！"));

            let addresses = Array.isArray(data.addresses) ? data.addresses : [];
            return addresses.filter(function (item) {
                return !item.isDelete;
            });
        });
    },
    addAddress: function (userId, address) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!address) return Promise.reject(new Error("无效的地址数据！"));

        let that = this;
        return co(function *() {
            let userData = yield that.querySingle({_id: userId, isDelete: false});
            if (!userData) return {state: -1, msg: "用户不存在！"};

            let result = yield that.isExist({
                _id: userId,
                isDelete: false,
                "addresses.isDelete": false,
                "addresses.linkman": address.linkman,
                "addresses.contact": address.contact,
                "addresses.location": address.location,
                "addresses.mark": address.mark
            });
            if (result) return {state: -2, msg: "地址已经存在！"};

            let entity = {
                linkman: address.linkman || "",
                contact: address.contact || "",
                location: address.location || "",
                mark: address.mark || "",
                isDefault: false,
                createTime: new Date(),
                isDelete: false
            };
            if (Array.isArray(userData.addresses) && userData.addresses.length <= 0) {
                entity["isDefault"] = true;
            }
            let updateData = yield that.updateSingle({
                _id: userId,
                isDelete: false
            }, {
                $addToSet: {addresses: entity},
                $set: {updateTime: new Date()}
            }, null);
            return updateData ? {state: 1, data: updateData} : {state: -3, msg: "添加失败！"};
        });
    },
    updateAddress: function (userId, address) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!address) return Promise.reject(new Error("无效的地址数据！"));

        return this.updateSingle({
            _id: userId,
            isDelete: false,
            "addresses._id": address._id
        }, {
            $set: {
                "addresses.$.linkman": address.linkman,
                "addresses.$.contact": address.contact,
                "addresses.$.location": address.location,
                "addresses.$.mark": address.mark,
                "addresses.$.updateTime": new Date(),
                updateTime: new Date()
            }
        }, null);
    },
    removeAddress: function (userId, addressId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!addressId) return Promise.reject(new Error("无效的地址编号！"));

        return this.updateSingle({
            _id: userId,
            isDelete: false,
            "addresses._id": address._id
        }, {
            $set: {
                "addresses.$.updateTime": new Date(),
                "addresses.$.isDelete": true
            }
        }, null);
    },
    setDefault: function (userId, addressId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!addressId) return Promise.reject(new Error("无效的地址编号！"));

        let that = this;
        return co(function *() {
            let userData = yield that.querySingle({_id: userId, isDelete: false});
            if (!userData) return {state: -1, msg: "用户不存在！"};

            let addresses = Array.isArray(userData.addresses) ? userData.addresses : [];
            addresses.forEach(function (item) {
                if (!item.isDelete) {
                    item.isDefault = item._id.toString() === addressId.toString();
                }
            });
            let updateData = yield that.updateSingle({
                _id: userId,
                isDelete: false
            }, {
                $set: {
                    addresses: addresses,
                    updateTime: new Date()
                }
            });
            return updateData ? {state: 1, data: updateData} : {state: -2, msg: "设置失败！"};
        });
    },
    //for admin
    getAddress: function (userId, addressId) {
        if (!userId) return Promise.reject(new Error("无效的用户编号！"));
        if (!addressId) return Promise.reject(new Error("无效的地址编号！"));

        return this.querySingle({_id: userId, isDelete: false}).then(data => {
            if (!data) return Promise.reject(new Error("用户不存在！"));

            let addresses = Array.isArray(data.addresses) ? data.addresses : [],
                filters = addresses.filter(function (item) {
                    return !item.isDelete && item._id.toString() === addressId.toString();
                });
            return filters[0] || null;
        });
    }
};

module.exports = AddressService;