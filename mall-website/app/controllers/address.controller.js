"use strict";

let co = require("co"),
    querystring = require("querystring"),
    AddressService = require("../services/address.service.js");

function index(req, res, next) {
    let query = req.query || {};
    new AddressService().getAddresses(req.session.SUSER.userId)
        .then(data => res.render("address", {
            title: "收货地址",
            data: data,
            from: query.from || "",
            type: query.type || "",
            msg: query.msg || ""
        }))
        .catch(err => next(err));
}

function handle(mode) {
    return function (req, res, next) {
        return co(function *() {
            let url = "/address/index?",
                query = req.query || {},
                args = {
                    from: query.from || "",
                    type: query.type || ""
                };
            if (args.from === "confirm") {
                url = "/order/confirm?";
            }
            let userId = req.session.SUSER.userId,
                addressService = new AddressService(),
                body = req.body || {},
                id = query.id,
                result = null;
            switch (mode) {
                case "add":
                    result = yield addressService.addAddress(userId, body);
                    if (result.state !== 1) {
                        args["msg"] = result.msg;
                    }
                    break;
                case "update":
                    result = yield addressService.updateAddress(userId, body);
                    if (!result) {
                        args["msg"] = "更新失败！";
                    }
                    break;
                case "remove":
                    result = yield addressService.removeAddress(userId, id);
                    if (!result) {
                        args["msg"] = "删除失败！";
                    }
                    break;
                case "setDefault":
                    result = yield addressService.setDefault(userId, id);
                    if (result.state !== 1) {
                        args["msg"] = result.msg;
                    }
                    break;
                default:
                    return Promise.reject(new Error("无法识别的操作类型！"));
                    break;
            }
            return res.redirect(url + querystring.stringify(args));
        }).catch(err => next(err));
    }
}

module.exports = {
    index: index,
    add: handle("add"),
    update: handle("update"),
    remove: handle("remove"),
    setDefault: handle("setDefault"),
};
