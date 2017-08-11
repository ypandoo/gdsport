// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('./parse-server').ParseServer;
const logger = require('./parse-server').logger;
const ParseDashboard = require('./parse-dashboard');

const path = require('path');
var AppAnalyticsAdapter = require("./adapter/AppAnalyticsAdapter");

var RebootCntTool = require("./gd-spec/InitRebootCnt");

const cfg = require('./config/index');


var rebootCnt = 0;

RebootCntTool.initRebootCnt("" + "RebootCounter.json", function (cnt) {
    rebootCnt = cnt;
});


// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();


app.use("/", addUniqId);

var api = new ParseServer({
        databaseURI: cfg.db,
        cloud: "./cloud/main.js",
        appId: cfg.app_id,
        masterKey: cfg.master_key,
        serverURL: cfg.server_url, // Don't forget to change to https if needed
      
        logsFolder: "./logs",
        analyticsAdapter: new AppAnalyticsAdapter(),
        verbose: true
    })
    ;

var dashboard = new ParseDashboard({
    "apps": [{
        "serverURL": cfg.server_url,
        appId: cfg.app_id,
        masterKey: cfg.master_key,
        "appName": "Appworld"
    }

    ],
    "users": cfg.dashboard_users
}, true);


var ReqCounter = {
    counter: 0,
    get: function () {
        if (this.counter >= 99999999) {
            this.counter = 0;
        }
        this.counter++;
        return this.counter;
    }
};


function addUniqId(req, res, next) {
    var reg = /^\/parse\/function+/;
    if (reg.test(req.originalUrl)) {
        var pid = ("00000" + process.pid).slice(-5);
        var now = new Date();
        var date = (now.getFullYear() + "").slice(-2) + "" + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "";
        var counter = ("00000000" + ReqCounter.get()).slice(-8);
        var theRebootCnt = ("00" + rebootCnt).slice(-2);
        var uniqId = "" + cfg.server_id + "" + date + "" + pid + "" + theRebootCnt + "" + counter;
        req.headers["X-GD-uniqId"] = uniqId;
    }
    next();
};


// // Serve static assets from the /public folder
// app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
if(!cfg.disable_apiservice){
    app.use(cfg.mount_path, api);
}
if(!cfg.disable_dashboard){
    app.use('/dashboard', dashboard);
}

//TODO tianxin 2017-08-01   remove this ,and change adminui auth settings
app.all("*", function (req, res, next) {
    req.cibParse = {};
    req.cibParse.appId = cfg.app_id;
    req.cibParse.masterKey = cfg.master_key;
    req.cibParse.serverURL = cfg.server_url;
    next();
});
if(!cfg.disable_adminui){
    app.use("/adminui", require("./adminui/main"));
}
app.get('/', function (req, res) {
    res.sendStatus(404);
});
var httpServer = require('http').createServer(app);


httpServer.listen(cfg.port, function () {
    logger.info('appworld-gdsport v2 running on port ' + cfg.port + '.');
});


