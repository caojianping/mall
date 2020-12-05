"use strict";

let multer = require("multer"),
    uuid = require("node-uuid");

let MIMETYPE_CONFIG = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "text/plain": ".txt"
};

module.exports = function (filePath, fileSize) {
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, filePath);
        },
        filename: function (req, file, cb) {
            cb(null, uuid.v1() + MIMETYPE_CONFIG[file.mimetype]);
        }
    });
    return multer({storage: storage, limits: {fileSize: fileSize}});
};