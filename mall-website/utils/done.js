"use strict";

module.exports = function (resolve, reject) {
    return function (err, data) {
        if (err) reject(err);
        else resolve(data);
    };
};