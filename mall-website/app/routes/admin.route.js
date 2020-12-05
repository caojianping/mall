"use strict";

let express = require("express"),
    router = express.Router(),
    accountCtrl = require("../controllers/admin/account.controller.js"),
    menuCtrl = require("../controllers/admin/menu.controller.js"),
    categoryCtrl = require("../controllers/admin/category.controller.js"),
    commodityCtrl = require("../controllers/admin/commodity.controller.js"),
    grouponCtrl = require("../controllers/admin/groupon.controller.js"),
    orderCtrl = require("../controllers/admin/order.controller.js"),
    grouponOrderCtrl = require("../controllers/admin/groupon-order.controller.js");

router.get("/admin", function (req, res, next) {
    res.redirect("/admin/account/login");
});
router.get("/admin/account/login", accountCtrl.login);
router.post("/admin/account/login", accountCtrl.login);
router.get("/admin/account/logout", accountCtrl.logout);
router.get("/admin/account/secure", accountCtrl.secure);
router.post("/admin/account/password", accountCtrl.password);

router.get("/admin/menu/index", menuCtrl.index);
router.get("/admin/menu/page", menuCtrl.page);
router.post("/admin/menu/add", menuCtrl.add);
router.post("/admin/menu/update", menuCtrl.update);
router.get("/admin/menu/remove", menuCtrl.remove);
router.get("/admin/menu/list", menuCtrl.list);

router.get("/admin/category/index", categoryCtrl.index);
router.get("/admin/category/page", categoryCtrl.page);
router.post("/admin/category/add", categoryCtrl.add);
router.post("/admin/category/update", categoryCtrl.update);
router.get("/admin/category/remove", categoryCtrl.remove);
router.post("/admin/category/addImg", categoryCtrl.addImg);
router.get("/admin/category/removeImg", categoryCtrl.removeImg);
router.get("/admin/category/list", categoryCtrl.list);

router.get("/admin/commodity/index", commodityCtrl.index);
router.get("/admin/commodity/page", commodityCtrl.page);
router.post("/admin/commodity/add", commodityCtrl.add);
router.post("/admin/commodity/update", commodityCtrl.update);
router.get("/admin/commodity/remove", commodityCtrl.remove);
router.post("/admin/commodity/addImg", commodityCtrl.addImg);
router.get("/admin/commodity/removeImg", commodityCtrl.removeImg);

router.post("/admin/groupon/add", grouponCtrl.add);
router.post("/admin/groupon/update", grouponCtrl.update);
router.get("/admin/groupon/remove", grouponCtrl.remove);

router.get("/admin/order/index", orderCtrl.index);
router.get("/admin/order/page", orderCtrl.page);
router.get("/admin/order/send", orderCtrl.send);

router.get("/admin/grouponOrder/index", grouponOrderCtrl.index);
router.get("/admin/grouponOrder/page", grouponOrderCtrl.page);
router.get("/admin/grouponOrder/send", grouponOrderCtrl.send);

module.exports = router;