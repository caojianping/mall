"use strict";

require("../utils/extension.js");
require("../helpers/db.helper.js")();

let ManagerService = require("../app/services/manager.service.js");

new ManagerService().addManager("admin", "admin")
    .then(result => console.log("result:", result))
    .catch(err => console.log("err:", err));