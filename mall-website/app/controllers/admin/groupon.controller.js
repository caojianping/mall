"use strict";

let GrouponService = require("../../services/groupon.service.js");

function add(req, res, next) {
    let groupon = req.body || {};
    new GrouponService().addGroupon(groupon)
        .then(result => res.json(result))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function update(req, res, next) {
    let groupon = req.body || {};
    new GrouponService().updateGroupon(groupon)
        .then(data => res.json(data ? {state: 1, data: data} : {state: -1}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function remove(req, res, next) {
    new GrouponService().removeGroupon(req.query.id)
        .then(result => res.json(result))
        .catch(err => res.json({state: 0, msg: err.message}));
}

module.exports = {
    add: add,
    update: update,
    remove: remove
};