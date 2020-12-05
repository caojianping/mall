"use strict";

let co = require("co"),
    done = require("../../utils/done.js"),
    BaseService = require("./base.service.js"),
    console = require("../../helpers/log.helper.js").console;

function GrouponService() {
    BaseService.call(this, "groupon");

    this._setState = function (startTime, endTime) {
        let state = GrouponStateEnum.Initial,
            now = new Date();
        if (now < startTime) {
            state = GrouponStateEnum.Initial;
        } else if (now >= startTime && now < endTime) {
            state = GrouponStateEnum.Started;
        } else if (now >= endTime) {
            state = GrouponStateEnum.Expired;
        }
        return state;
    };
}

GrouponService.prototype = {
    getGroupons: function () {
        return this.queryList({
            state: GrouponStateEnum.Started,
            isDelete: false
        }, null, {
            sort: {createTime: -1},
            limit: 6
        }, {path: "commodity", select: "_id name imgs"});
    },
    getGroupon: function (id) {
        if (!id) return Promise.reject(new Error("无效的编号！"));

        return this.querySingle({
            _id: id,
            state: GrouponStateEnum.Started,
            isDelete: false
        }, null, null, {path: "commodity"});
    },
    getGrouponByCommodityId: function (commodityId) {
        if (!commodityId) return Promise.reject(new Error("无效的商品编号！"));

        let that = this;
        return co(function *() {
            let groupon = yield that.querySingle({
                commodity: commodityId,
                isDelete: false
            }, null, null, {path: "commodity"});
            if (!groupon) return null;

            let oldState = groupon.state;
            switch (oldState) {
                case GrouponStateEnum.Started:
                    return groupon;
                    break;
                case GrouponStateEnum.Expired:
                    return null;
                    break;
                case GrouponStateEnum.Initial:
                    let newState = that._setState(groupon.startTime, groupon.endTime);
                    console.log("/getGroupon newState:", newState);
                    if (newState === GrouponStateEnum.Started) {
                        yield that.updateSingle({commodity: commodityId, isDelete: false}, {
                            $set: {
                                state: GrouponStateEnum.Started,
                                updateTime: new Date()
                            }
                        }, null);
                        groupon["state"] = newState;
                        return groupon;
                    } else if (newState === GrouponStateEnum.Expired) {
                        yield that.updateSingle({commodity: commodityId, isDelete: false}, {
                            $set: {
                                state: GrouponStateEnum.Expired,
                                updateTime: new Date()
                            }
                        }, null);
                        return null;
                    } else if (newState === GrouponStateEnum.Initial) return null;
                    else return Promise.reject(new Error("无效的状态！"));
                    break;
                default:
                    return Promise.reject(new Error("无效的状态！"));
                    break;
            }
        });
    },
    //for admin
    addGroupon: function (groupon) {
        if (!groupon) return Promise.reject(new Error("无效的团购商品数据！"));
        if (!groupon.commodity) return Promise.reject(new Error("无效的关联商品！"));
        if (!groupon.name) return Promise.reject(new Error("无效的团购商品名称！"));
        if (!groupon.price) return Promise.reject(new Error("无效的团购商品价格！"));
        if (!groupon.standard) return Promise.reject(new Error("无效的团购商品规格！"));
        if (!groupon.startTime) return Promise.reject(new Error("无效的开始时间！"));
        if (!groupon.endTime) return Promise.reject(new Error("无效的结束时间！"));

        let that = this,
            startTime = new Date(groupon.startTime),
            endTime = new Date(groupon.endTime);
        if (startTime >= endTime) return Promise.reject("团购商品开始时间不可以大于等于结束时间！");

        return co(function *() {
            let result = yield that.isExist({commodity: groupon.commodity, isDelete: false});
            if (result) return {state: -1, msg: "团购商品已经存在！"};

            let data = yield that.Model.create({
                commodity: groupon.commodity,
                name: groupon.name,
                intro: groupon.intro || "",
                price: groupon.price,
                standard: groupon.standard,
                population: groupon.population,
                startTime: startTime,
                endTime: endTime,
                state: that._setState(startTime, endTime),
                createTime: new Date()
            });
            if (data) {
                let CommodityService = require("./commodity.service.js"),
                    result = yield new CommodityService().setGroupon(groupon.commodity, data._id);
                return result ? {state: 1, data: data} : {state: -3, msg: "更新商品团购信息失败！"};
            } else return {state: -2, msg: "添加失败！"};
        });
    },
    updateGroupon: function (groupon) {
        if (!groupon) return Promise.reject(new Error("无效的团购商品数据！"));

        let that = this,
            startTime = new Date(groupon.startTime),
            endTime = new Date(groupon.endTime);
        if (startTime >= endTime) return Promise.reject("团购商品开始时间不可以大于等于结束时间！");

        return that.updateSingle({
            _id: groupon._id,
            isDelete: false
        }, {
            $set: {
                commodity: groupon.commodity,
                name: groupon.name,
                intro: groupon.intro,
                price: groupon.price,
                standard: groupon.standard,
                population: groupon.population,
                startTime: startTime,
                endTime: endTime,
                state: that._setState(startTime, endTime),
                updateTime: new Date()
            }
        });
    },
    removeGroupon: function (id) {
        if (!id) return Promise.reject(new Error("无效的团购商品编号！"));

        let that = this;
        return co(function *() {
            let data = yield that.removeSingle({_id: id, isDelete: false});
            if (data) {
                let CommodityService = require("./commodity.service.js"),
                    result = yield new CommodityService().cancelGroupon(data.commodity);
                return result ? {state: 1, data: data} : {state: -2, msg: "商品是否团购状态更新失败！"};
            } else return {state: -1, msg: "团购商品删除失败！"};
        });
    }
};

module.exports = GrouponService;