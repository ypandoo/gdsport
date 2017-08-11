var express = require("express");
var path = require("path");
var fs = require("fs");
var router = express.Router();
var ParseUtilFile = require("../tools/parseUtil");
var MathUtil = require("../tools/mathUtil");

var GuideInfos = Parse.Object.extend("guideinfos");

router.get("/", function (req, res) {
    res.render("guide/index");
});

router.get("/index/:url", function (req, res) {
    var destUrl = "guide/" + req.params.url;
    console.log("[/guide/index/url] " + new Date() + "requrl:" + destUrl);
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
        var origContent = unescape(uiData.content);
        for (var j = 0, k = i; j < replList.length; j++, k++) {
            origContent = origContent.replace(replList[j], retList[k].url());
        }
        console.log(origContent);
        uiData.content = escape(origContent);
        Parse.Cloud.useMasterKey();
        var guideInfos = new GuideInfos();

        guideInfos.set("title", uiData.title);
        guideInfos.set("content", uiData.content);
        guideInfos.set("files", retList);
        var formerInfo = null;
        var htmlCode = generateHtmlContent(uiData.title, unescape(uiData.content));
        console.log("step1");
        console.log("step2");
        guideInfos.save({useMasterKey: true}).then(function (gInfo) {
            console.log("step3");
            formerInfo = gInfo;
            return writeToFile(MathUtil.getUniqNumber(), htmlCode);
            //res.status(200).jsonp({"code": "0", "msg": "ok"});
        }, function (err) {
            res.status(200).jsonp({"code": "-2", "msg": err.getMessage()});
        }).then(function (url) {
            formerInfo.set("url", url);
            formerInfo.save();
            res.status(200).jsonp({"code": "0", "msg": ""});
        }, function (err) {
            res.status(200).jsonp({"code": "-2", "msg": err.getMessage()});
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
    var guideInfoQuery = new Parse.Query(GuideInfos);
    guideInfoQuery.descending("createdAt");
    guideInfoQuery.find({useMasterKey: true}).then(function (docs) {
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
            item.url = doc.get("url");
            item.createdAt = doc.get("createdAt");
            item.updatedAt = doc.get("updatedAt");
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
    var guideInfosQuery = new Parse.Query(GuideInfos);
    guideInfosQuery.get(id, {useMasterKey: true}).then(function (doc) {
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
            if (typeof parseFiles !== "undefined" && parseFiles !== null) {
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


router.get("/testWrite", function (req, res) {
    var value = "This is a test";
    writeToFile("123", value, function (param) {
        res.status(200).jsonp({"data": param});
    })
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

/**
 * Write the content to the file , it will return one promise; reject is the error object
 * resolve is the URL WITHOUT [HOSTNAME + ROOTPATH + /]
 * @param fileName
 * @param content
 * @returns {Promise}
 */
var writeToFile = function (fileName, content) {

    var destPath = path.join(__dirname, "../../", "public", "bandguide", fileName + ".html");
    var promise = new Promise(function (resolve, reject) {
        fs.open(destPath, "w+", function (err, fd) {
            if (!err) {
                fs.write(fd, content, function (err, written, theString) {
                    if (!err) {
                        fs.close(fd, function (err) {
                            if (!err) {
                                resolve("public/bandguide/" + fileName + ".html");
                            } else {
                                reject(err);
                            }
                        });
                    } else {
                        reject(err);
                    }
                })
            } else {
                reject(err);
            }
        });
    });
    return promise;

};

var generateHtmlContent = function (title, content) {
    var html = "";
    html += "<!DOCTYPE html>";
    html += "<html><head>";
    html += "<link rel=\"stylesheet\" href=\"css/jquery.mobile-1.4.5.min.css\" />";
    html += "<link href=\"css/quill.snow.css\" rel=\"stylesheet\">";
    html += "<link href=\"css/quill.bubble.css\" rel=\"stylesheet\">";
    html += "<link href=\"css/quill.core.css\" rel=\"stylesheet\">";
    html += "<title>" + title + "</title>";
    html += "<meta charset=\"UTF-8\">";
    html += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">";
    html += "<meta http-equiv=\"Content-Security-Policy\">";
    html += "</head><body>";
    html += "<div data-role=\"page\" id=\"page1\" class=\"page\" style=\"margin-left: 0; padding-left: 0\">";
    html += "<div data-role=\"content\" class=\"content\" id=\"content\">";
    html += content;
    html += "</div></div>";
    html += "<script src=\"js/jquery.js\"></script>";
    html += "<script src=\"js/jquery.mobile-1.4.5.min.js\"></script>";
    html += "<script src=\"js/quill.js\"></script>";
    html += "<script src=\"js/guide.js\"></script>";
    html += "</body></html>";
    return html;
}

module.exports = router;