"use strict";

require("./constant.js");
require("./helpers/db.helper.js")();

let schedule = require("node-schedule"),
    co = require("co"),
    GrouponService = require("./services/groupon.service.js"),
    OpenGrouponService = require("./services/open-groupon.service.js"),
    GrouponOrderService = require("./services/groupon-order.service.js");

(function main() {
    let job = schedule.scheduleJob("0 0 0 * * ? *", function () {
        co(function *() {
            let grouponService = new GrouponService(),
                sdata = yield grouponService.setStart();
            console.log(new Date().toLocaleString() + "：本次启动了" + sdata.length + "个团购商品！");

            let edata = yield grouponService.setExpired();
            if (Array.isArray(edata)) {
                for (let i = 0; i < edata.length; i++) {
                    let eitem = edata[i],
                        odata = yield new OpenGrouponService().setFailed(eitem._id);
                    for (let j = 0; j < odata.length; j++) {
                        let oitem = odata[j];
                        yield new GrouponOrderService().setExpiredBack(oitem._id, oitem.joinList);
                    }
                }
            }
        }).catch(err => {
            console.log(new Date().toLocaleString() + "：发生处理错误异常！" + err.message + "！");
        });
    });
})();
