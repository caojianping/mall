"use strict";

let mongoose = require("mongoose");

let GrouponSchema = new mongoose.Schema({
    //关联商品
    commodity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "commodity",
        required: true
    },
    //名称
    name: {
        type: "String",
        required: true
    },
    //简介
    intro: "String",
    //单价
    price: {
        type: "Number",
        required: true
    },
    //规格
    standard: {
        type: "String",
        required: true
    },
    //团购人数
    population: {
        type: "Number",
        min: 1,
        required: true
    },
    //开始时间
    startTime: {
        type: "Date",
        required: true
    },
    //结束时间
    endTime: {
        type: "Date",
        required: true
    },
    //团购商品状态：-10表示已过期；0表示初始化；1表示已开始。
    state: {
        type: "Number",
        enum: [-10, 0, 10],
        default: 0,
        validate: [
            function (value) {
                return [-10, 0, 10].isExist(null, value);
            },
            "无效的团购商品状态！"
        ]
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

GrouponSchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

mongoose.model("groupon", GrouponSchema, "groupon");