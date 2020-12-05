"use strict";

let mongoose = require("mongoose");

let CategorySchema = new mongoose.Schema({
    //分类名称
    name: {
        type: "String",
        required: true
    },
    //分类图片
    img: "String",
    //关联菜单
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    //级别
    level: {
        type: "Number",
        default: 1
    },
    // //路径
    // path: "String",
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

CategorySchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

mongoose.model("category", CategorySchema, "category");