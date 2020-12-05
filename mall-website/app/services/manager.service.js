"use strict";

let co = require("co"),
    sha1 = require("../../utils/sha1.js"),
    BaseService = require("./base.service.js");

function ManagerService() {
    BaseService.call(this, "manager");
}

ManagerService.prototype = {
    addManager: function (username, password) {
        if (!username) return Promise.reject(new Error("用户名不能为空！"));
        if (!password) return Promise.reject(new Error("密码不能为空！"));

        let that = this;
        return co(function *() {
            let result = yield that.isExist({username: username, isDelete: false});
            if (result) return {state: -1, msg: "管理员已经存在！"};

            let data = yield that.Model.create({
                username: username,
                password: sha1.hex_sha1(password),
                createTime: new Date()
            });
            return data ? {state: 1, data: data} : {state: -2, msg: "添加失败！"};
        });
    },
    login: function (username, password) {
        if (!username) return Promise.reject(new Error("用户名不可以为空！"));
        if (!password) return Promise.reject(new Error("密码不可以为空！"));

        let that = this;
        return new Promise((resolve, reject) => {
            that.Model.findOne({username: username}, function (err, manager) {
                if (err) return reject(err);
                if (!manager) return resolve({state: -1, msg: "用户不存在！"});
                if (sha1.hex_sha1(password) !== manager.password) return resolve({state: -2, msg: "密码错误！"});
                return resolve({state: 1, data: manager});
            });
        });
    },
    password: function (id, oldPwd, newPwd, confirmPwd) {
        if (!id) return Promise.reject(new Error("用户编号不可以为空！"));
        if (!oldPwd) return Promise.reject(new Error("原密码不可以为空！"));
        if (!newPwd) return Promise.reject(new Error("新密码不可以空！"));
        if (!confirmPwd) return Promise.reject(new Error("确认密码不可以空！"));

        let that = this;
        return co(function *() {
            let manager = yield that.querySingle({_id: id, isDelete: false});
            if (!manager) return {state: -1, msg: "用户不存在！"};

            if (sha1.hex_sha1(oldPwd) !== manager.password) return {state: -2, msg: "原密码输入不正确！"};
            if (newPwd !== confirmPwd) return {state: -3, msg: "两次密码输入不一致！"};

            let data = yield that.updateSingle({_id: id, isDelete: false}, {
                $set: {
                    password: sha1.hex_sha1(newPwd),
                    updateTime: new Date()
                }
            });
            return data ? {state: 1, data: data} : {state: -4, msg: "新密码修改失败！"};
        });
    }
};

module.exports = ManagerService;