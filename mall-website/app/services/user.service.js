"use strict";

let co = require("co"),
    BaseService = require("./base.service.js");

function UserService() {
    BaseService.call(this, "user");
}

UserService.prototype = {
    getUser: function (id, populate) {
        if (!id) return Promise.reject("无效的用户编号！");
        return this.querySingle({_id: id, isDelete: false}, null, null, populate);
    },
    setUser: function (openId, nickname, avatar) {
        if (!openId) return Promise.reject(new Error("无效的微信openId！"));
        if (!nickname) return Promise.reject(new Error("无效的微信昵称！"));
        avatar = avatar || "";

        let that = this;
        return co(function *() {
            let result = yield that.isExistWithData({openId: openId, isDelete: false});
            if (result.state) {
                //更新
                let data = result.data;
                if (data.nickname !== nickname || data.avatar !== avatar) {
                    let updateData = yield that.updateSingle({
                        _id: data._id,
                        isDelete: false
                    }, {
                        $set: {
                            nickname: nickname,
                            avatar: avatar,
                            updateTime: new Date()
                        }
                    });
                    return updateData ? {state: 1, data: updateData} : {state: -1, msg: "更新失败"};
                } else return {state: 1, data: data};
            } else {
                //添加
                let data = yield that.Model.create({openId: openId, nickname: nickname, avatar: avatar});
                return data ? {state: 1, data: data} : {state: -2, msg: "添加失败"};
            }
        });
    },
    setGrouponCart: function (id, openGrouponId, quantity) {
        if (!id) return Promise.reject(new Error("无效的用户编号！"));
        if (!openGrouponId) return Promise.reject(new Error("无效的开团编号！"));
        if (isNaN(quantity) || quantity <= 0) return Promise.reject(new Error("无效的团购数量！"));

        return this.updateSingle({
            _id: id,
            isDelete: false
        }, {
            $set: {
                grouponCart: {
                    openGrouponId: openGrouponId,
                    quantity: quantity
                },
                updateTime: new Date()
            }
        });
    },
    removeGrouponCart: function (id) {
        if (!id) return Promise.reject("无效的用户编号！");
        return this.updateSingle({_id: id, isDelete: false}, {$set: {grouponCart: null, updateTime: new Date()}});
    }
};

module.exports = UserService;