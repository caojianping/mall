"use strict";

let UserService = require("../services/user.service.js");

function index(req, res, next) {
    new UserService().getUser(req.session.SUSER.userId)
        .then(data => res.render("user", {title: "个人中心", data: data}))
        .catch(err => next(err));
}

module.exports = {
    index: index
};
