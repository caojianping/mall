"use strict";

let mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    //微信openId
    openId: {
        type: "String",
        required: true
    },
    //微信昵称
    nickname: {
        type: "String",
        required: true
    },
    //微信头像
    avatar: {
        type: "String",
        required: true
    },
    //地址
    addresses: [new mongoose.Schema({
        linkman: {
            type: "String",
            required: true
        },
        contact: {
            type: "String",
            required: true
        },
        location: {
            type: "String",
            required: true
        },
        mark: {
            type: "String",
            enum: ["家", "公司", "学校"],
            validate: [
                function (value) {
                    return ["家", "公司", "学校"].isExist(null, value);
                },
                "无效的地址标记！"
            ],
            required: false
        },
        isDefault: {
            type: "Boolean",
            default: false
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
    }, {_id: true})],
    //购物车
    carts: [new mongoose.Schema({
        commodity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "commodity",
            required: true
        },
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        quantity: {
            type: "Number",
            min: 1,
            required: true
        },
        flag: {
            type: "Boolean",
            default: false
        }
    }), {_id: true}],
    //团购购物车
    grouponCart: new mongoose.Schema({
        openGrouponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "openGroupon"
        },
        quantity: {
            type: "Number",
            min: 1,
        }
    }),
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

UserSchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

mongoose.model("user", UserSchema, "user");