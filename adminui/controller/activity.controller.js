var express = require("express");
var router = express.Router();
var ActivityModel = require("../model/activity.model");
var ParseUtilFile = require("../tools/parseUtil");

var ActivityInfos = Parse.Object.extend("activityinfos");

router.get("/", function (req, res) {
    res.render("activity/index");
});

router.get("/index/:url", function (req, res) {
    var destUrl = "activity/" + req.params.url;
    console.log("[/activity/index/url] " + new Date() + "requrl:" + destUrl);
    res.render(destUrl);
});

router.post("/add", function (req, res) {
    var sendData = req.body.sendData;
    var uiData = sendData.ui;
    var srcList = sendData.src;
    var replList = sendData.rep;

    var parseUtil = new ParseUtilFile();
    parseUtil.handle(srcList, function (retList) {
        var i = 0;
        if (typeof uiData.tile1 !== "undefined") {
            uiData.tile1 = retList[i].url();
            i++;
        }
        if (typeof uiData.tile2 !== "undefined") {
            uiData.tile2 = retList[i].url();
            i++;
        }
        var origContent = unescape(uiData.content);
        for (var j = 0, k = i; j < replList.length; j++, k++) {
            origContent = origContent.replace(replList[j], retList[k].url());
        }
        console.log(origContent);
        uiData.content = escape(origContent);
        Parse.Cloud.useMasterKey();
        var activityInfos = new ActivityInfos();

        activityInfos.set("title", uiData.title);
        activityInfos.set("duration", uiData.duration);
        activityInfos.set("isAvail", uiData.isAvail);
        activityInfos.set("tile1", uiData.tile1);
        activityInfos.set("tile2", uiData.tile2);
        activityInfos.set("content", uiData.content);
        activityInfos.set("files", retList);

        console.log("step1");
        activityInfos.set("crtAt", new Date());

        try {
            var theStartAfter = new Date(uiData.startAfter);
            activityInfos.set("sttAfter", theStartAfter);
            console.log(theStartAfter);
        } catch (e) {
            console.log(e);
        }

        try {
            var theEndBefore = new Date(uiData.endBefore);
            activityInfos.set("eddBefore", theEndBefore);
            console.log(theEndBefore);
        } catch (e) {
            console.log(e);
        }
        console.log("step2");
        activityInfos.save({useMasterKey: true}).then(function () {
            console.log("step3");
            res.status(200).jsonp({"code": "0", "msg": "ok"});
        });

    });


    /*
     var newItem = {};
     newItem.title = sendData.title;
     newItem.duration = sendData.duration;
     newItem.isAvail = sendData.isAvail;
     newItem.tile1 = sendData.tile1;
     newItem.tile2 = sendData.tile2;
     newItem.content = sendData.content;
     newItem.createAt = new Date();
     newItem.startAfter = Date.parse(sendData.startAfter, "yyyy/MM/dd HH:mm:ss");
     newItem.endBefore = Date.parse(sendData.endBefore, "yyyy/MM/dd HH:mm:ss");
     var activityModel = new ActivityModel(newItem);
     activityModel.save();
     res.status(200).jsonp({"code": "0", "msg": "ok"});
     */
});

router.post("/getAll", function (req, res) {
    Parse.Cloud.useMasterKey();
    var activityInfosQuery = new Parse.Query(ActivityInfos);
    activityInfosQuery.descending("crtAt");
    activityInfosQuery.find({useMasterKey: true}).then(function (docs) {
        if (!docs || docs.length < 1) {
            res.status(200).jsonp({"code": "-3", "msg": "No more data"});
            return;
        }
        var sendData = [];
        for (var key in docs) {
            var item = {};
            var doc = docs[key];

            item.id = doc.id;
            item.title = doc.get("title");
            item.duration = doc.get("duration");
            item.startAfter = doc.get("sttAfter");
            item.endBefore = doc.get("eddBefore");
            item.createAt = doc.get("crtAt");
            item.isAvail = doc.get("isAvail");
            sendData.push(item);
        }

        res.status(200).jsonp({
            "code": "0", "data": sendData
        });
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        return;
    });

    /*
     var condition = {};
     var selection = "_id title duration startAfter endBefore isAvail createAt";
     var options = {
     sort: {
     createAt: -1
     }
     };
     ActivityModel.find(condition, selection, options, function (err, docs) {
     if (err) {
     res.status(200).jsonp({"code": "-2", "msg": err});
     return;
     }
     if (docs.length === 0) {
     res.status(200).jsonp({"code": "-3", "msg": "no more data"});
     return;
     }
     res.status(200).jsonp({
     "code": "0", "data": docs
     });
     });

     */
});

router.post("/modify", function (req, res) {
    var sendData = req.body.sendData;
    var id = sendData.data;

    Parse.Cloud.useMasterKey();
    var activityInfosQuery = new Parse.Query(ActivityInfos);
    activityInfosQuery.get(id, {useMasterKey: true}).then(function (doc) {
        if (!doc) {
            res.status(200).jsonp({"code": "-3", "msg": "NO more data"});
            return;
        }
        if (sendData.type === "start") {
            console.log("start");
            doc.set("isAvail", "1");
            doc.save({useMasterKey: true}).then(function () {
                res.status(200).jsonp({"code": "0", "data": ""});
            }, function (err) {
                res.status(200).jsonp({"code": "0", "data": "failed"});

            });
        } else if (sendData.type === "stop") {
            console.log("stop");
            doc.set("isAvail", "0");
            doc.save({useMasterKey: true}).then(function () {
                res.status(200).jsonp({"code": "0", "data": ""});
            }, function (err) {
                res.status(200).jsonp({"code": "0", "data": "failed"});
            });
        } else if (sendData.type === "remove") {
            var parseFiles = doc.get("files");
            if (typeof parseFiles !== "undefined") {
                var destFileNames = [];
                for (var i = 0; i < parseFiles.length; i++) {
                    destFileNames.push(parseFiles[i].name());
                }
                removeParseFile(destFileNames, req.cibParse.appId, req.cibParse.masterKey, req.cibParse.serverURL);
            }
            doc.destroy().then(function () {
                res.status(200).jsonp({"code": "0", "data": ""});
            }, function (err) {
                res.status(200).jsonp({"code": "0", "data": "failed"});
            });
        }
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        return;
    });


    /*
     ActivityModel.find({_id: id}, function (err, docs) {
     if (err) {
     res.status(200).jsonp({"code": "-2", "msg": err});
     return;
     }
     if (docs.length < 1) {
     res.status(200).jsonp({"code": "-3", "msg": "NO more data"});
     return;
     }
     var doc = docs[0];
     if (sendData.type === "start") {
     doc.isAvail = true;
     doc.save(function (err) {
     if (!err) {
     res.status(200).jsonp({"code": "0", "data": ""});
     }
     });
     } else if (sendData.type === "stop") {
     doc.isAvail = false;
     doc.save(function (err) {
     if (!err) {
     res.status(200).jsonp({"code": "0", "data": ""});
     }
     });
     } else if (sendData.type === "remove") {
     doc.remove(function (err) {
     if (!err) {
     res.status(200).jsonp({"code": "0", "data": ""});
     }
     });
     }

     });*/

});

router.post("/search", function (req, res) {
    var condition = {};
    var sendData = req.body.sendData;
    var from = sendData.from;
    var to = sendData.to;
    var title = sendData.title;
    if (typeof from !== "undefined") {
        try {
            var fromDate = new Date(Date.parse(from));
            condition.createAt = {};
            condition.createAt.$gte = fromDate;
        } catch (e) {

        }
    }
    if (typeof to !== "undefined") {
        try {
            var toDate = new Date(Date.parse(to));
            if (typeof condition.createAt === "undefined") {
                condition.createAt = {};
            }
            condition.createAt.$lte = toDate;
        } catch (e) {

        }
    }
    if (typeof title !== "undefined") {
        var regEx = new RegExp(title, "i");
        condition.title = {};
        condition.title.$regex = regEx;
    }
    var selection = "_id title duration startAfter endBefore isAvail createAt";
    var options = {
        sort: {
            createAt: -1
        }
    };
    ActivityModel.find(condition, selection, options, function (err, docs) {
        if (err) {
            res.status(200).jsonp({"code": "-2", "msg": err});
        }
        if (docs.length === 0) {
            res.status(200).jsonp({"code": "-3", "msg": "no more data"});
        }
        res.status(200).jsonp({
            "code": "0", "data": docs
        });
    });
});

router.post("/getAvail", function (req, res) {
    var condition = {};
    condition.startAfter = {};
    condition.endBefore = {};
    var now = new Date();
    condition.startAfter.$lte = now;
    condition.endBefore.$gte = now;
    var selection = "_id title duration startFrom endBefore isAvail createAt";
    var options = {
        sort: {
            createAt: -1
        }
    };
    ActivityModel.find(condition, selection, options, function (err, docs) {
        if (err) {
            res.status(200).jsonp({"code": "-2", "msg": err});
        }
        if (docs.length === 0) {
            res.status(200).jsonp({"code": "-3", "msg": "no more data"});
        }
        res.status(200).jsonp({
            "code": "0", "data": docs
        });
    });
});


router.get("/remove", function (req, res) {
    //console.dir(req.cibParse);
    // var headers = {
    //     "X-Parse-Application-Id": "appworld-cibxdl",
    //     "X-Parse-Master-Key": "XXXXXX"
    // };
    // var method = "DELETE";
    // var url = "http://localhost:20371/parse/files/5c4909722ada350e5e71b3e65e51c7ba_tmp_9655.jpeg";
    // var options = {
    //     "headers": headers,
    //     "method": method,
    //     "url": url
    // };
    // Parse.Cloud.useMasterKey();
    // Parse.Cloud.httpRequest(options).then(function () {
    //     console.log("sendDeleteOk");
    // }, function (err) {
    //     console.log("SendDeleteFailed:" + err);
    // });
    res.status(200).jsonp({"code": "0", "msg": ""});
});

/**
 *
 * @param destUrls String array, used for the parse files names
 * @param appId String, used for the app id
 * @param masterKey String, the master key
 * @param serverURL String, the server url
 */
var removeParseFile = function (destUrls, appId, masterKey, serverURL) {
    var headers = {
        "X-Parse-Application-Id": appId,
        "X-Parse-Master-Key": masterKey
    };

    var method = "DELETE";
    var baseUrl = serverURL + "/files/";

    var options = {
        "headers": headers,
        "method": method,
        "url": ""
    };

    var cnt = 0;

    var removeSingleFile = function (httpOptions) {
        console.log(cnt);
        var finalUrl = baseUrl + destUrls[cnt];
        var finalOptions = httpOptions;
        finalOptions.url = finalUrl;
        Parse.Cloud.httpRequest(finalOptions).then(function () {
            cnt++;
            if (cnt >= destUrls.length) {
                return;
            } else {
                removeSingleFile(httpOptions);
            }
        }, function (err) {
            cnt++;
            if (cnt >= destUrls.length) {
                return;
            } else {
                removeSingleFile(httpOptions);
            }
        });
    };
    removeSingleFile(options);
}


module.exports = router;