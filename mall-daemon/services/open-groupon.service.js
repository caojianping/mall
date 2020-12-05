"use strict";

let done = require("../utils/done.js"),
    BaseService = require("./base.service.js");

function OpenGrouponService() {
    BaseService.call(this, "openGroupon");
}

OpenGrouponService.prototype = {
    setFailed: function (grouponId) {
        if (!grouponId) return Promise.reject("无效的团购商品编号！");

        let that = this;
        return new Promise((resolve, reject) => {
            that.Model.updateMany({
                groupon: grouponId,
                isDelete: false,
                $or: [
                    {state: OpenGrouponStateEnum.Initial},
                    {state: OpenGrouponStateEnum.Processing}
                ]
            }, {
                $set: {
                    state: OpenGrouponStateEnum.Failed,
                    updateTime: new Date()
                }
            }, done(resolve, reject));
        });
    }
};

module.exports = OpenGrouponService;