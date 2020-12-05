"use strict";

function buildImgSrc(data, path) {
    path = path || "/imgs/";
    let result = "/images/empty.png";
    if (data) {
        if (Array.isArray(data)) {
            if (data.length > 0 && data[0]) {
                result = path + data[0];
            }
        } else if (typeof data === "string") {
            result = path + data;
        }
    }
    return result;
}

exports.use = function (app) {
    app.locals.htmlHelper = {
        buildImgSrc: buildImgSrc
    };
};