"use strict";

let express = require("express"),
    session = require("express-session"),
    path = require("path"),
    favicon = require("serve-favicon"),
    logger = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    config = require("./config.json"),
    app = express();

require("./constant.js");
require("./utils/locals.js").use(app);
require("./helpers/log.helper.js").use(app);
require("./helpers/db.helper.js")();
require("./utils/extension.js");
require("./wutils/index.js");

// view engine setup
app.engine("html", require("ejs-mate"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/bower_components", express.static(path.join(__dirname, "bower_components")));
app.use("/cates", express.static(path.join(config.dataPath, "cates")));
app.use("/imgs", express.static(path.join(config.dataPath, "imgs")));

let SessionStore = require("connect-mongo")(session);
app.use(session({
    name: "mall.website",
    secret: "mall",
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({url: config.mongodb})
}));

app.use("/wx/callback", require("./wx/callback.js"));
let terminalParser = require("./middleware/terminal.parser.js"),
    adminParser = require("./middleware/admin.parser.js");
app.use(terminalParser());
app.use("/admin/*", adminParser());

let homeRoute = require("./app/routes/home.route.js"),
    adminRoute = require("./app/routes/admin.route.js");
app.use([homeRoute, adminRoute]);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
