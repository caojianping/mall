"use strict";

let co = require("co"),
    BaseService = require("./base.service.js");

function CategoryService() {
    BaseService.call(this, "category");
}

CategoryService.prototype = {
    getCategoriesById: function (id) {
        if (!id) return Promise.reject(new Error("无效的分类编号！"));
        return this.queryList({parent: id, level: 2, isDelete: false});
    },
    //for admin
    getMenus: function () {
        return this.queryList({level: 1, isDelete: false});
    },
    getCategories: function () {
        return this.queryList({level: 2, isDelete: false});
    },
    addCategory: function (category) {
        if (!category) return Promise.reject(new Error("无效的分类数据！"));
        if (!category.name) return Promise.reject(new Error("无效的分类名称！"));

        delete category._id;
        let that = this;
        return co(function*() {
            let result = yield that.isExist({name: category.name, level: category.level, isDelete: false});
            if (result) return {state: -1, msg: "分类已经存在！"};

            let data = yield that.Model.create({
                name: category.name,
                img: category.img || null,
                parent: category.parent || null,
                level: category.level,
                createTime: new Date()
            });
            return data ? {state: 1, data: data} : {state: -2, msg: "添加失败！"};
        });
    },
    updateCategory: function (category) {
        if (!category) return Promise.reject(new Error("无效的分类数据！"));

        let updates = {
            name: category.name,
            updateTime: new Date()
        };
        if (category.hasOwnProperty("parent")) {
            updates["parent"] = category.parent || null;
        }
        return this.updateSingle({_id: category._id, isDelete: false}, {$set: updates});
    },
    removeCategory: function (id) {
        if (!id) return Promise.reject(new Error("无效的分类编号！"));
        return this.removeSingle({_id: id, isDelete: false});
    },
    addImg: function (id, img) {
        if (!id) return Promise.reject(new Error("无效的分类编号！"));
        if (!img) return Promise.reject(new Error("无效的分类图片！"));
        return this.updateSingle({_id: id, isDelete: false}, {$set: {img: img, updateTime: new Date()}});
    },
    removeImg: function (id) {
        if (!id) return Promise.reject(new Error("无效的分类编号！"));
        return this.updateSingle({_id: id, isDelete: false}, {$set: {img: null, updateTime: new Date()}});
    }
};

module.exports = CategoryService;