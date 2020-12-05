"use strict";

let co = require("co"),
    BaseService = require("./base.service.js");

function GrouponOrderService() {
    BaseService.call(this, "grouponOrder");
}

GrouponOrderService.prototype = {
    setExpiredBack: function (openGrouponId, joinList) {
        if (!openGrouponId) return Promise.reject(new Error("无效的开团编号！"));
        if (!Array.isArray(joinList)) return Promise.reject(new Error("无效的参团类型！"));

        let that = this;
        return co(function *() {
            //已付款的团单
            yield that.Model.updateMany({
                openGroupon: openGrouponId,
                state: GrouponOrderStateEnum.NonGroupon,
                isDelete: false,
                orderer: {$in: joinList}
            }, {
                $set: {
                    state: GrouponOrderStateEnum.Failed,
                    refundState: RefundStateEnum.Accepted,
                    refundReason: {
                        type: RefundReasonTypeEnum.System,
                        desc: "拼团失败，退款受理。"
                    },
                    updateTime: new Date()
                }
            });
            //未付款的团单
            yield that.Model.updateMany({
                openGroupon: openGrouponId,
                state: GrouponOrderStateEnum.NonPay,
                isDelete: false,
                orderer: {$nin: joinList}
            });
            return true;
        });
    }
};

module.exports = GrouponOrderService;