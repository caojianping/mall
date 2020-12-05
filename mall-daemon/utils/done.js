"use strict";

module.exports = function (resolve, reject) {
    return function (err, data) {
        if (err) {
            return reject(err);
        } else {
            return resolve(data);
        }
    };
};