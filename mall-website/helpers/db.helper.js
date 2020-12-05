"use strict";

let mongoose = require("mongoose"),
    config = require("../config.json");

module.exports = function () {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongodb, {useMongoClient: true});
    let db = mongoose.connection;
    db.on("error", function (err) {
        console.log("Mongoose connect error!", err);
    });
    db.once("open", function () {
        console.log("Mongoose connect success!");
    });
    require("../app/models/user.model.js");
    require("../app/models/category.model.js");
    require("../app/models/commodity.model.js");
    require("../app/models/order.model.js");
    require("../app/models/groupon.model.js");
    require("../app/models/open-groupon.model.js");
    require("../app/models/groupon-order.model.js");
    require("../app/models/manager.model.js");
};
