"use strict";

let log4js = require("log4js"),
    config = require("../config.json");

log4js.configure({
    appenders: {
        console: {type: "console"},
        file: {type: "file", filename: config.logPath + "logger.log"},
        dateFile: {
            type: "dateFile",
            filename: config.logPath,
            pattern: "yyyy-MM-dd.log",
            alwaysIncludePattern: true,
            absolute: false
        }
    },
    categories: {
        default: {appenders: ["dateFile"], level: "INFO"},
        console: {appenders: ["console"], level: "INFO"},
        logger: {appenders: ["file"], level: "INFO"},
        loggers: {appenders: ["dateFile"], level: "INFO"}
    }
});

let console = log4js.getLogger("console"),
    logger = log4js.getLogger("logger"),
    loggers = log4js.getLogger("loggers");

exports.console = console;
exports.logger = logger;
exports.loggers = loggers;

exports.use = function (app) {
    app.use(log4js.connectLogger(loggers, {level: "INFO", format: ":method :url"}));
};