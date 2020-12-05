"use strict";

let fs = require("fs"),
    path = require("path"),
    uploadHelper = require("../../../helpers/upload.helper.js"),
    pageHelper = require("../../../helpers/page.helper.js"),
    CategoryService = require("../../services/category.service.js"),
    config = require("../../../config.json");

function index(req, res, next) {
    return res.render("admin/category", {title: "分类管理"});
}

function page(req, res, next) {
    let query = req.query || {},
        obj = pageHelper.handleIndexAndSize(query),
        conditions = pageHelper.handleConditions(query, {name: "string_like", parent: "string_equal"});
    conditions["level"] = 2;
    conditions["isDelete"] = false;
    new CategoryService().queryPage(conditions, null, null, {
        path: "parent",
        select: "_id name",
        match: {isDelete: false}
    }, null, obj.pageIndex, obj.pageSize)
        .then(result => res.json({state: 1, data: result.data, count: result.count}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function add(req, res, next) {
    let filePath = path.join(config.dataPath, "cates");
    uploadHelper(filePath, FILE_MAX_SIZE).array("img", 1)(req, res, function (err) {
        let img = req.files[0].filename;
        if (err) {
            deleteImg(img);
            return res.json({state: 0, msg: err.message});
        } else {
            console.log("/category/add body:", req.query, req.body);
            console.log("/category/add files:", req.files);
            let category = req.body || {};
            category["img"] = img;
            category["level"] = 2;

            new CategoryService().addCategory(category)
                .then(result => {
                    if (result.state !== 1) {
                        deleteImg(img);
                    }
                    return res.json(result);
                })
                .catch(err => {
                    deleteImg(img);
                    return res.json({state: 0, msg: err.message});
                });
        }
    });
}

function update(req, res, next) {
    let category = req.body || {};
    delete category.img;
    new CategoryService().updateCategory(category)
        .then(data => res.json(data ? {state: 1, data: data} : {state: -1}))
        .catch(err => res.json({state: 0, msg: err.message}));
}

function remove(req, res, next) {
    new CategoryService().removeCategory(req.query.id)
        .then(data => {
            if (!data) return res.json({state: -1});
            try {
                deleteImg(data.img);
                return res.json({state: 1});
            } catch (e) {
                return res.json({state: 0, msg: e.message});
            }
        })
        .catch(err => res.json({state: 0, msg: err.message}));
}

function addImg(req, res, next) {
    let filePath = path.join(config.dataPath, "cates");
    uploadHelper(filePath, FILE_MAX_SIZE).array("img", 1)(req, res, function (err) {
        let img = req.files[0].filename;
        if (err) {
            deleteImg(img);
            return res.json({state: 0, msg: err.message});
        } else {
            let body = req.body || {},
                id = body.id;
            new CategoryService().addImg(id, img)
                .then(data => res.json(data ? {state: 1, data: {id: id, img: img}} : {state: -1}))
                .catch(err => {
                    deleteImg(img);
                    return res.json({state: 0, msg: err.message});
                });
        }
    });
}

function removeImg(req, res, next) {
    let query = req.query || {},
        id = query.id,
        img = query.img;
    new CategoryService().removeImg(id)
        .then(data => {
            if (!data) return res.json({state: -1});
            deleteImg(img);
            return res.json({state: 1});
        })
        .catch(err => res.json({state: 0, msg: err.message}));
}

function list(req, res, next) {
    new CategoryService().getCategories()
        .then(data => {
            if (!Array.isArray(data)) return res.json({state: -1, msg: "错误的数据类型！"});

            let arrs = data.map(function (item) {
                return {name: item.name, value: item._id};
            });
            return res.json({state: 1, data: arrs});
        })
        .catch(err => res.json({state: 0, msg: err.message}));
}

function deleteImg(img) {
    if (!img) return;
    fs.unlinkSync(path.join(config.dataPath, "cates", img));
}

module.exports = {
    index: index,
    page: page,
    add: add,
    update: update,
    remove: remove,
    addImg: addImg,
    removeImg: removeImg,
    list: list
};