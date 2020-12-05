"use strict";

let mongoose = require("mongoose"),
    co = require("co"),
    done = require("../../utils/done.js");

function BaseService(modelName) {
    this.Model = mongoose.model(modelName);

    this.querySingle = function (conditions, projection, options, populate) {
        conditions = conditions || {};
        projection = projection || null;
        options = options || null;

        let that = this;
        return new Promise((resolve, reject) => {
            if (populate) that.Model.findOne(conditions, projection, options).populate(populate).lean().exec(done(resolve, reject));
            else that.Model.findOne(conditions, projection, options).lean().exec(done(resolve, reject));
        });
    };

    this.queryList = function (conditions, projection, options, populate) {
        conditions = conditions || {};
        projection = projection || null;
        options = options || null;

        let that = this;
        return new Promise((resolve, reject) => {
            if (populate) that.Model.find(conditions, projection, options).populate(populate).lean().exec(done(resolve, reject));
            else that.Model.find(conditions, projection, options).lean().exec(done(resolve, reject));
        });
    };

    this.queryPage = function (conditions, projection, options, populate, sort, pageIndex, pageSize) {
        conditions = conditions || {};
        projection = projection || null;
        options = options || {};
        sort = sort || {createTime: -1};
        pageIndex = pageIndex || 1;
        pageSize = pageSize || 10;

        let that = this;
        options["sort"] = sort;
        options["skip"] = (pageIndex - 1) * pageSize;
        options["limit"] = pageSize;
        return co(function *() {
            let data = null;
            if (populate) data = yield that.Model.find(conditions, projection, options).populate(populate).lean().exec();
            else data = yield that.Model.find(conditions, projection, options).lean().exec();
            return {
                count: yield that.Model.count(conditions).exec(),
                data: data
            };
        });
    };

    this.updateSingle = function (conditions, update, options) {
        if (!conditions) return Promise.reject(new Error("无效的更新条件！"));
        if (!update) return Promise.reject(new Error("无效的更新数据！"));
        options = options || {upsert: false, multi: false};

        let that = this;
        return new Promise((resolve, reject) => {
            that.Model.findOneAndUpdate(conditions, update, options, done(resolve, reject));
        });
    };

    this.removeSingle = function (conditions, update, options) {
        if (!conditions) return Promise.reject(new Error("无效的删除条件！"));
        update = update || {$set: {isDelete: true, updateTime: new Date()}};
        options = options || {upsert: false, multi: false};

        let that = this;
        return new Promise((resolve, reject) => {
            that.Model.findOneAndUpdate(conditions, update, options, done(resolve, reject));
        });
    };

    this.isExist = function (conditions) {
        if (!conditions) return Promise.reject(new Error("无效的查询条件！"));

        let that = this;
        return new Promise((resolve, reject) => {
            that.Model.findOne(conditions, function (err, data) {
                if (err) return reject(err);
                else return resolve(!!data);
            });
        });
    };

    this.isExistWithData = function (conditions) {
        if (!conditions) return Promise.reject(new Error("无效的查询条件！"));

        let that = this;
        return new Promise((resolve, reject) => {
            that.Model.findOne(conditions, function (err, data) {
                if (err) return reject(err);
                else return resolve(!!data ? {state: true, data: data} : {state: false});
            });
        });
    };
}

module.exports = BaseService;