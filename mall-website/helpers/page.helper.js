"use strict";

function handleIndexAndSize(params) {
    if (!params || typeof params !== "object") {
        return {pageIndex: 1, pageSize: DEFAULT_PAGE_SIZE};
    }
    let pageIndex = parseFloat(params.pageIndex),
        pageSize = parseFloat(params.pageSize);
    if (isNaN(pageIndex) || pageIndex <= 0) {
        pageIndex = 1;
    }
    if (isNaN(pageSize) || pageSize <= 0) {
        pageSize = DEFAULT_PAGE_SIZE;
    }
    delete params.pageIndex;
    delete  params.pageSize;
    return {pageIndex: pageIndex, pageSize: pageSize};
}

function timeConvert(num) {
    if (num < 0) {
        return null;
    }
    let time = new Date().addDays(-(num - 1));
    time.setHours(0, 0, 0, 0);
    return {$gte: time};
}

function handleConditions(conditions, config) {
    let result = {};
    for (let key in conditions) {
        let value = conditions[key],
            ckey = key,
            cvalue = config[key];
        if (!cvalue) continue;

        let type = cvalue;
        if (Object.prototype.toString.call(cvalue) === "[object Object]") {
            type = cvalue.type;
            ckey = cvalue.alias;
        }

        switch (type) {
            case "string_equal":
                if (value) {
                    result[ckey] = value;
                }
                break;
            case "number_equal":
                value = Number(value);
                if (!isNaN(value)) {
                    result[ckey] = value;
                }
                break;
            case "string_like":
                if (value) {
                    result[ckey] = {$regex: value, $options: "$i"};
                }
                break;
            case "number_time":
                value = Number(value);
                if (!isNaN(value)) {
                    let time = timeConvert(value);
                    if (time) {
                        conditions["createTime"] = time;
                    }
                }
                break;
            case "exist_equal":
                if (value === "0") {
                    result[ckey] = {$exists: false};
                } else if (value === "1") {
                    result[ckey] = {$exists: true, $ne: null};
                }
                break;
            default:
                break;
        }
    }
    return result;
}

module.exports = {
    handleIndexAndSize: handleIndexAndSize,
    handleConditions: handleConditions
};