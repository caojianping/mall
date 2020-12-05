"use strict";

let co = require("co"),
    done = require("../../utils/done.js"),
    BaseService = require("./base.service.js");

function OpenGrouponService() {
    BaseService.call(this, "openGroupon");
}

OpenGrouponService.prototype = {
    getOpenGroupons: function (grouponId) {
        if (!grouponId) return Promise.reject("无效的团购商品编号！");

        return this.queryList({
            groupon: grouponId,
            state: OpenGrouponStateEnum.Processing,
            isDelete: false
        }, null, null, {path: "opener", model: "user"});
    },
    getOpenGroupon: function (id) {
        if (!id) return Promise.reject("无效的开团编号！");

        return this.querySingle({_id: id, isDelete: false}, null, null, [
            {path: "opener", model: "user"},
            {path: "joinList", model: "user"},
            {
                path: "groupon",
                model: "groupon",
                populate: {
                    path: "commodity",
                    model: "commodity",
                    select: "_id name imgs"
                }
            }
        ]);
    },
    setOpen: function (userId, grouponId, quantity) {
        if (!userId) return Promise.reject("无效的用户编号！");
        if (!grouponId) return Promise.reject("无效的团购商品编号！");
        if (isNaN(quantity) || quantity <= 0) return Promise.reject(new Error("无效的团购商品数量！"));

        let that = this;
        return co(function *() {
            let result = yield that.isExist({
                opener: userId,
                groupon: grouponId,
                isDelete: false,
                state: OpenGrouponStateEnum.Processing
            });
            if (result) return {state: -1, msg: "您已经开过团啦！"};

            let data = yield that.Model.create({
                opener: userId,
                groupon: grouponId,
                state: OpenGrouponStateEnum.Initial,
                joinList: [],
                createTime: new Date()
            });
            if (!data) return {state: -2, msg: "开团失败！"};

            let UserService = require("./user.service.js"),
                userData = yield new UserService().setGrouponCart(userId, data._id, quantity);
            if (!userData) return {state: -3, msg: "用户数据更新失败！"};
            else return {state: 1};
        });
    },
    setJoin: function (id, userId, quantity) {
        if (!id) return Promise.reject("无效的开团编号！");
        if (!userId) return Promise.reject("无效的参团人！");
        if (isNaN(quantity) || quantity <= 0) return Promise.reject(new Error("无效的团购商品数量！"));

        let that = this;
        return co(function *() {
            let openGroupon = yield that.querySingle({_id: id, isDelete: false}, null, null, {path: "groupon"});
            if (!openGroupon) return {state: -1, msg: "开团数据不存在！"};

            let groupon = openGroupon.groupon;
            if (!groupon) return {state: -2, msg: "团购商品不存在！"};

            let joinList = openGroupon.joinList || [],
                joinCount = joinList.length,
                population = groupon.population;
            if (joinList.isExist(userId)) return {state: -3, msg: "您已经参过团啦！"};
            if (joinCount === population) return {state: -4, msg: "开团人数已经满啦！"};

            let UserService = require("./user.service.js"),
                data = yield new UserService().setGrouponCart(userId, id, quantity);
            if (!data) return {state: -5, msg: "用户数据更新失败！"};
            else return {state: 1};
        });
    },
    setPayBack: function (id, userId) {
        if (!id) return Promise.reject("无效的开团编号！");
        if (!userId) return Promise.reject("无效的用户编号！");

        let that = this;
        return co(function *() {
            let openGroupon = yield that.querySingle({_id: id, isDelete: false}, null, null, {path: "groupon"});
            if (!openGroupon) return Promise.reject("开团数据不存在！");

            let groupon = openGroupon.groupon;
            if (!groupon) return Promise.reject("团购商品不存在！");

            let joinList = openGroupon.joinList || [],
                joinCount = joinList.length,
                population = groupon.population;
            if (joinList.isExist(userId)) return Promise.reject("您已经参过团啦！");
            if (joinCount === population) return Promise.reject("开团人数已经满啦！");
            if (joinCount > population) return Promise.reject("异常的参团人数！");

            if (joinCount = population - 1) {//人数正好
                yield that.updateSingle({_id: id, isDelete: false}, {
                    $addToSet: {joinList: userId},
                    $set: {
                        state: OpenGrouponStateEnum.Successed,
                        updateTime: new Date()
                    }
                });
                let GrouponOrderService = require("./groupon-order.service.js");
                yield new GrouponOrderService().setPayBack(id, joinList);
                return true;
            } else if (joinCount > 0 && joinCount < population - 1) {//人数不够
                yield that.updateSingle({_id: id, isDelete: false}, {
                    $addToSet: {joinList: userId},
                    $set: {
                        state: OpenGrouponStateEnum.Processing,
                        updateTime: new Date()
                    }
                });
                return true;
            } else return Promise.reject(new Error("异常的处理情况！"));
        });
    }
};

module.exports = OpenGrouponService;