"use strict";

let fs = require("fs"),
    path = require("path"),
    uploadHelper = require("../../../helpers/upload.helper.js"),
    pageHelper = require("../../../helpers/page.helper.js"),
    CommodityService = require("../../services/commodity.service.js"),
    config = require("../../../config.json");

function index(req, res, next) {
    return res.render("admin/index", {title: "商品管理"});
}

function page(req, res, next) {
    let query = req.query || {},
        obj = pageHelper.handleIndexAndSize(query),
        conditions = pageHelper.handleConditions(query, {
            name: "string_like",
            origin: "string_like",
            category: "string_equal",
            groupon: "exist_equal"
        });
    conditions["isDelete"] = false;
    new CommodityService().queryPage(conditions, null, null, [
        {path: "category", select: "_id name", match: {isDelete: false}},
        {path: "groupon"}
    ], {createTime: -1}, obj.pageIndex, obj.pageSize)
        .then(result => res.json({state: 1, data: result.data, count: result.count}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function add(req, res, next) {
    let filePath = path.join(config.dataPath, "imgs");
    uploadHelper(filePath, FILE_MAX_SIZE).array("imgs", 5)(req, res, function (err) {
        let imgs = req.files.map(function (item) {
            return item.filename;
        });
        if (err) {
            deleteImgs(imgs);
            return res.json({state: 0, msg: err.message});
        } else {
            let commodity = req.body || {},
                units = null;
            try {
                units = JSON.parse(req.body.units);
            } catch (e) {
                units = [];
            }
            commodity["units"] = units;
            commodity["imgs"] = imgs;
            new CommodityService().addCommodity(commodity)
                .then(result => {
                    if (result.state !== 1) {
                        deleteImgs(imgs);
                    }
                    return res.json(result);
                })
                .catch(err => {
                    deleteImgs(imgs);
                    return res.json({state: 0, msg: err.message});
                });
        }
    });
}

function update(req, res, next) {
    let commodity = req.body || {};
    delete commodity.img;
    new CommodityService().updateCommodity(commodity)
        .then(data => res.json(data ? {state: 1, data: data} : {state: -1}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function remove(req, res, next) {
    new CommodityService().removeCommodity(req.query._id)
        .then(data => {
            if (!data) return res.json({state: -1});
            try {
                deleteImgs(data.imgs);
                return res.json({state: 1});
            } catch (e) {
                return res.json({state: 0, msg: e.message});
            }
        })
        .catch(err => res.json({state: 0, msg: err.message}));
}

function addImg(req, res, next) {
    let filePath = path.join(config.dataPath, "imgs");
    uploadHelper(filePath, FILE_MAX_SIZE).array("img", 1)(req, res, function (err) {
        if (err) return res.json({state: 0, msg: err.message});
        let id = req.body.id,
            img = req.files[0].filename;
        new CommodityService().addImg(id, img)
            .then(data => {
                let tdata = {id: id, img: img};
                return res.json(data ? {state: 1, data: tdata} : {state: -1});
            })
            .catch(err => {
                try {
                    deleteImgs([img]);
                    return res.json({state: 0, msg: err.message});
                } catch (e) {
                    return res.json({state: 0, msg: e.message});
                }
            });
    });
}

function removeImg(req, res, next) {
    let query = req.query || {},
        id = query.id,
        img = query.img;
    new CommodityService().removeImg(id, img)
        .then(data => {
            if (!data) return res.json({state: -1});
            fs.unlink(path.join(config.dataPath, "imgs", img), function (err) {
                if (err) res.json({state: 0, msg: err.message});
                else res.json({state: 1});
            });
        })
        .catch(err => res.json({state: 0, msg: err.message}));
}

function deleteImgs(imgs) {
    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i];
        fs.unlinkSync(path.join(config.dataPath, "imgs", img));
    }
}

module.exports = {
    index: index,
    page: page,
    add: add,
    update: update,
    remove: remove,
    addImg: addImg,
    removeImg: removeImg
};