"use strict";

let mongoose = require("mongoose");

let GrouponOrderSchema = new mongoose.Schema({
    //下单人
    orderer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    //地址编号
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    //关联的团购商品
    groupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groupon",
        required: true
    },
    //关联的开团
    openGroupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "openGroupon",
        required: true
    },
    //团单数量
    quantity: {
        type: "Number",
        required: true
    },
    //总金额
    total: {
        type: "Number",
        required: true
    },
    //团单状态
    state: {
        type: "Number",
        enum: [-10, -1, 0, 1, 2, 3, 10],//-10表示已取消；-1表示拼团失败；0表示待付款；1表示待拼团；2表示待发货；3表示待收货；10表示已完成；
        default: 0,
        validate: [
            function (value) {
                return [-10, -1, 0, 1, 2, 3, 10].isExist(null, value);
            },
            "无效的团单状态！"
        ]
    },
    //退款状态
    refundState: {
        type: "Number",
        enum: [-10, 0, 10],//-1表示退款失败；0表示受理中；1表示退款成功。
        validate: [
            function (value) {
                return [-10, 0, 10].isExist(null, value);
            },
            "无效的团单退款状态！"
        ]
    },
    //退款原因
    refundReason: new mongoose.Schema({
        type: {
            type: "Number",
            enum: [1, 2],//1表示系统退款；2表示消费退款。
            validate: [
                function (value) {
                    return [1, 2].isExist(null, value);
                },
                "无效的退款原因类型！"
            ]
        },
        desc: {
            type: "String",
            required: false
        }
    }, {_id: false}),
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

GrouponOrderSchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

mongoose.model("grouponOrder", GrouponOrderSchema, "grouponOrder");
