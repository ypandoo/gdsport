var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var resolve = require("path").resolve;
var currentPath = resolve(__dirname, "./");

//var dbPath = "mongodb://127.0.0.1/gdsportAdmin";
const cfg = require('../config/index');
var bodyParser = require("body-parser");
var session = require("express-session");
var flash = require("connect-flash");
var cookieParser = require("cookie-parser");
var fileUpload = require("express-fileupload");

var conn = mongoose.connect(cfg.db).connection;
conn.on("error", console.error.bind(console, "Connection error"));

var sessConf = {
    secret: 'gdsport admin',
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
        maxAge: 86400 * 1000,
        secure: false
    },
    rolling: true
};

var app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(currentPath + "/public"));
app.engine(".html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("trust proxy", 1);
app.set("views", currentPath + "/views");
app.use(cookieParser());
app.use(session(sessConf));
app.use(flash());
app.use(fileUpload());
app.all("*", function (req, res, next) {
    //console.log(req.session);    
    //console.log(app.mountpath);
    console.log(req.path);
    //console.log(req.url);
    console.log(req.originalUrl);
    //console.log(req.url);
    req.mountPath = app.mountpath;
    if (typeof req.session.username === "undefined") {
        console.log("step1");
        if (typeof req.path === "undefined" || req.path.length === 0) {
            console.log("step2");
            res.redirect(app.mountpath + "/login");
            return;
        }
        if (req.path !== "/index" && req.path !== "/login/doLogin" && req.path !== "/login") {
            console.log("step3");
            res.redirect(app.mountpath + "/login");
            return;
        }
    }
    next();
});
app.use(require("./controller/index.controller"));
app.on("mount", function (parent) {
    console.log("Succeed to load the adminui from the mountpath:  " + app.mountpath);
});
module.exports = app;
//var port = 9988;
//app.listen(port);
//console.log("Start listening on the port 9988...");
    