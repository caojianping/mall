"use strict";

let mongoose = require("mongoose");

let CommoditySchema = new mongoose.Schema({
    //商品名称
    name: {
        type: "String",
        required: true
    },
    //商品简介
    intro: "String",
    //商品产地
    origin: "String",
    //商品价格单位
    units: [new mongoose.Schema({
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
        //描述
        desc: "String",
        //折扣
        discount: {
            type: "Number",
            default: 1
        },
        //库存
        stock: {
            type: "Number",
            default: 9999
        },
        createTime: {
            type: "Date",
            default: new Date()
        },
        updateTime: {
            type: "Date",
            required: false
        },
        isDelete: {
            type: "Boolean",
            default: false
        }
    })],
    //商品图片
    imgs: [String],
    //关联分类
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    //关联团购
    groupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groupon"
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

CommoditySchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

mongoose.model("commodity", CommoditySchema, "commodity");