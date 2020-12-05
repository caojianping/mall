"use strict";

let done = require("../utils/done.js"),
    BaseService = require("./base.service.js");

function GrouponService() {
    BaseService.call(this, "groupon");
}

GrouponService.prototype = {
    setStart: function () {
        let that = this;
        return new Promise((resolve, reject) => {
            let now = new Date();
            that.Model.updateMany({
                state: GrouponStateEnum.Initial,
                startTime: {$lte: now},
                endTime: {$gt: now},
                isDelete: false
            }, {
                $set: {
                    state: GrouponStateEnum.Started,
                    updateTime: now
                }
            }, done(resolve, reject));
        });
    },
    setExpired: function () {
        let that = this;
        return new Promise((resolve, reject) => {
            let now = new Date();
            that.Model.updateMany({
                state: {$ne: GrouponStateEnum.Expired},
                endTime: {$lte: now},
                isDelete: false
            }, {
                $set: {
                    state: GrouponStateEnum.Expired,
                    updateTime: now
                }
            }, done(resolve, reject));
        });
    }
};

module.exports = GrouponService;