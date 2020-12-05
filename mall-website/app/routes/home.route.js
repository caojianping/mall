"use strict";

let express = require("express"),
    router = express.Router(),
    commodityCtrl = require("../controllers/commodity.controller.js"),
    grouponCtrl = require("../controllers/groupon.controller.js"),
    orderCtrl = require("../controllers/order.controller.js"),
    payCtrl = require("../controllers/pay.controller.js"),
    userCtrl = require("../controllers/user.controller.js"),
    addressCtrl = require("../controllers/address.controller.js"),
    cartCtrl = require("../controllers/cart.controller.js"),
    wxCtrl = require("../controllers/wx.controller.js");

router.get("/", function (req, res, next) {
    res.redirect("/commodity/index");
});
router.get("/commodity/index", commodityCtrl.index);
router.get("/commodity/category", commodityCtrl.category);
router.get("/commodity/list", commodityCtrl.list);
router.get("/commodity/detail", commodityCtrl.detail);
router.get("/commodity/search", commodityCtrl.search);
router.post("/commodity/search", commodityCtrl.search);
router.get("/commodity/suggest", commodityCtrl.suggest);

router.get("/groupon/openList", grouponCtrl.openList);
router.post("/groupon/open", grouponCtrl.open);
router.post("/groupon/join", grouponCtrl.join);

router.get("/order/index", orderCtrl.index);
router.get("/order/confirm", orderCtrl.confirm);
router.get("/order/pay", orderCtrl.pay);
router.post("/order/add", orderCtrl.add);
router.get("/order/setState/:type/:state/:id/:action", orderCtrl.setState);

router.get("/pay/create", payCtrl.create);
router.get("/pay/callback", payCtrl.callback);

router.get("/user/index", userCtrl.index);

router.get("/address/index", addressCtrl.index);
router.post("/address/add", addressCtrl.add);
router.post("/address/update", addressCtrl.update);
router.get("/address/remove", addressCtrl.remove);
router.get("/address/setDefault", addressCtrl.setDefault);

router.get("/cart/index", cartCtrl.index);
router.post("/cart/add", cartCtrl.add);
router.post("/cart/settle", cartCtrl.settle);
router.post("/cart/remove", cartCtrl.remove);

router.post("/wx/getSignature", wxCtrl.getSignature);

module.exports = router;