"use strict";

let mongoose = require("mongoose");

let OpenGrouponSchema = new mongoose.Schema({
    //开团人
    opener: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    //关联团购商品
    groupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groupon",
        required: true
    },
    //参团列表
    joinList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    //开团状态：-10表示开团失败；0表示初始化；1表示处理中；10表示开团成功。
    state: {
        type: "Number",
        enum: [-10, 0, 1, 10],
        default: 0,
        validate: [
            function (value) {
                return [-10, 0, 1, 10].isExist(null, value);
            },
            "无效的开团状态！"
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

OpenGrouponSchema.pre("findOneAndUpdate", function (next) {
    this.options.runValidators = true;
    next();
});

mongoose.model("openGroupon", OpenGrouponSchema, "openGroupon");