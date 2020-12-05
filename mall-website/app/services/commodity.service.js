"use strict";

let co = require("co"),
    done = require("../../utils/done.js"),
    BaseService = require("./base.service.js");

function CommodityService() {
    BaseService.call(this, "commodity");
}

CommodityService.prototype = {
    //for common
    getUnit: function (id, unitId) {
        if (!id) return Promise.reject(new Error("无效的商品编号！"));
        if (!unitId) return Promise.reject(new Error("无效的单位编号！"));

        return this.querySingle({_id: id, isDelete: false}).then(data => {
            if (!data) return Promise.reject(new Error("商品不存在！"));

            let units = Array.isArray(data.units) ? data.units : [];
            return units.filter(function (item) {
                    return unitId.toString() === item._id.toString();
                })[0] || null;
        });
    },
    //for wechat
    getHotCommodities: function () {
        return this.queryList({isDelete: false}, null, {sort: {createTime: -1}, limit: 5}, null);
    },
    getDiscountCommodities: function () {
        let that = this;
        return co(function *() {
            let result = [],
                data = yield that.queryList({}, null, {limit: 10});
            for (let i = 0; i < data.length; i++) {
                let item = data[i],
                    units = Array.isArray(item.units) ? item.units : [],
                    hasDiscount = units.some(function (uitem) {
                        return uitem.discount < 1;
                    });
                if (hasDiscount) {
                    item["units"] = units.sort(function (a, b) {
                        return a.discount - b.discount;
                    });
                    result.push(item);
                }
            }
            return result;
        });
    },
    getCommoditiesByCategory: function (category) {
        if (!category) return Promise.reject(new Error("无效的商品分类！"));
        return this.queryList({isDelete: false, category: category});
    },
    getCommoditiesByName: function (name) {
        if (!name) return Promise.reject(new Error("无效的商品名称！"));

        let that = this,
            conditions = {
                name: {
                    $regex: name,
                    $options: "$i"
                },
                isDelete: false
            };
        if (name.length <= 2) return that.queryList(conditions, null, {limit: 5});
        else return that.queryList(conditions);
    },
    getCommodity: function (id) {
        if (!id) return Promise.reject(new Error("无效的商品编号！"));
        return this.querySingle({_id: id, isDelete: false});
    },
    //for admin
    addCommodity: function (commodity) {
        if (!commodity) return Promise.reject(new Error("无效的商品数据！"));
        if (!commodity.name) return Promise.reject(new Error("无效的商品名称！"));
        if (!Array.isArray(commodity.units)) return Promise.reject(new Error("无效的商品价格单位类型！"));

        delete commodity._id;
        let that = this;
        return co(function *() {
            let result = yield that.isExist({name: commodity.name, isDelete: false});
            if (result) return {state: -1, msg: "商品已经存在！"};

            let data = yield that.Model.create({
                name: commodity.name,
                intro: commodity.intro || null,
                origin: commodity.origin || null,
                units: commodity.units,
                category: commodity.category,
                imgs: commodity.imgs,
                createTime: new Date()
            });
            return data ? {state: 1, data: data} : {state: -2, msg: "添加失败！"};
        });
    },
    updateCommodity: function (commodity) {
        if (!commodity) return Promise.reject(new Error("无效的商品数据！"));

        return this.updateSingle({
            _id: commodity._id,
            isDelete: false
        }, {
            $set: {
                name: commodity.name,
                intro: commodity.intro,
                origin: commodity.origin,
                units: commodity.units,
                category: commodity.category,
                imgs: commodity.imgs,
                updateTime: new Date()
            }
        });
    },
    removeCommodity: function (id) {
        if (!id) return Promise.reject(new Error("无效的商品编号！"));
        return this.removeSingle({_id: id, isDelete: false});
    },
    addImg: function (id, img) {
        if (!id) return Promise.reject(new Error("无效的商品编号！"));
        if (!img) return Promise.reject(new Error("无效的商品图片！"));

        return this.updateSingle({
            _id: id,
            isDelete: false
        }, {
            $addToSet: {imgs: img},
            $set: {updateTime: new Date()}
        });
    },
    removeImg: function (id, img) {
        if (!id) return Promise.reject(new Error("无效的商品编号！"));
        if (!img) return Promise.reject(new Error("无效的商品图片！"));

        return this.updateSingle({
            _id: id,
            isDelete: false
        }, {
            $pull: {imgs: img},
            $set: {updateTime: new Date()}
        });
    },
    setGroupon: function (id, grouponId) {
        if (!id) return Promise.reject(new Error("无效的商品编号！"));
        if (!grouponId) return Promise.reject(new Error("无效的团购商品编号！"));

        return this.updateSingle({
            _id: id,
            isDelete: false
        }, {
            $set: {
                groupon: grouponId,
                updateTime: new Date()
            }
        });
    },
    cancelGroupon: function (id) {
        if (!id) return Promise.reject(new Error("无效的商品编号！"));

        return this.updateSingle({
            _id: id,
            isDelete: false
        }, {
            $set: {
                groupon: null,
                updateTime: new Date()
            }
        });
    }
};

module.exports = CommodityService;
