"use strict";

let mongoose = require("mongoose");

let ManagerSchema = new mongoose.Schema({
    //用户名
    username: {
        type: "String",
        required: true
    },
    //密码
    password: {
        type: "String",
        required: true
    },
    //创建时间
    createTime: {
        type: "Date",
        default: new Date()
    },
    //更新时间
    updateTime: "Date",
    //是否删除
    isDelete: {
        type: "Boolean",
        default: false
    }
}, {_id: true});

ManagerSchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

mongoose.model("manager", ManagerSchema, "manager");