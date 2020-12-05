"use strict";

let mongoose = require("mongoose");

function BaseService(modelName) {
    this.Model = mongoose.model(modelName);
}

module.exports = BaseService;