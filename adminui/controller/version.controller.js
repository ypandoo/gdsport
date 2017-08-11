var express = require("express");
var router = express.Router();
var VersionModel = require("../model/version.model");

var VersionInfos = Parse.Object.extend("versioninfos");

var isInArray = function (needle, arr) {
    if (arr.length < 1) {
        return false;
    }
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === needle) {
            return true;
        }
    }
    return false;
};

router.get("/", function (req, res) {
    res.render("version/index");
});

router.get("/index/:url", function (req, res) {
    var reqUrl = "version/" + req.params.url;
    console.log(req.params.url);
    if (req.params.url === "List") {
        Parse.Cloud.useMasterKey();
        var versionInfosQuery = new Parse.Query(VersionInfos);
        versionInfosQuery.find({useMasterKey: true})
            .then(function (list) {
                if (!list || list.length < 1) {
                    res.render(reqUrl, {"names": []});
                    return;
                }
                var names = [];
                for (var i = 0; i < list.length; i++) {
                    if (isInArray(list[i].get("name"), names)) {
                        continue;
                    }
                    names.push(list[i].get("name"));
                }
                console.log(JSON.stringify(names));
                res.render(reqUrl, {"names": names});
            }, function (err) {
                res.render(reqUrl, {"names": []});

                return;
            });
        /*        
         VersionModel.distinct("name", function (err, names) {
         if (err) {
         res.render(reqUrl);
         return;
         }
         console.log(JSON.stringify(names));
         res.render(reqUrl, {"names": names});
         });
         */
    } else {
        res.render(reqUrl);
    }
});

router.post("/add", function (req, res) {
    var sendData = req.body.sendData;
    console.log(JSON.stringify(sendData));
    if (sendData.length > 0) {
        Parse.Cloud.useMasterKey();
        for (var i = 0; i < sendData.length; i++) {
            var versionInfos = new VersionInfos();
            for (var key in sendData[i]) {
                versionInfos.set(key, sendData[i][key]);
            }
            versionInfos.set("releaseDate", new Date(Date.parse(sendData[i]['releaseDate'])));
            versionInfos.save();
            /*
             var item = sendData[i];
             item.updatedAt = new Date();
             item.releaseDate = new Date(Date.parse(item.releaseDate));
             item.createdAt = new Date();
             var versionModel = new VersionModel(item);
             versionModel.save();
             */
        }
    }
    res.status(200).jsonp({"code": "0", "msg": "ok"});
});

router.post("/update", function (req, res) {
    var sendData = req.body.sendData;
    console.log(JSON.stringify(sendData));
    Parse.Cloud.useMasterKey();
    if (sendData.length > 0) {
        for (var i = 0; i < sendData.length; i++) {
            var item = sendData[i];
            var versionInfosQuery = new Parse.Query(VersionInfos);
            versionInfosQuery.equalTo("name", item.name);
            versionInfosQuery.equalTo("type", item.type);
            versionInfosQuery.first({useMasterKey: true}).then(function (v) {
                if (v) {
                    v.set("url", item.url);
                    v.set("releaseDate", new Date(Date.parse(item.releaseDate)));
                    v.set("memo", item.memo);
                    v.set("forceUpdate", item.forceUpdate);
                    v.set("current", item.current);
                    v.set("size", item.size);
                    v.set("code", item.code);
                    v.save();
                }
            }, function (err) {

            });
            /*
             VersionModel.update(
             {"name": item.name, "type": item.type},
             {$set: {
             "url": item.url,
             "releaseDate": new Date(Date.parse(item.releaseDate)),
             "memo": item.memo,
             "forceUpdate": item.forceUpdate,
             "current": item.current,
             "updatedAt": new Date()
             }},
             function (err) {
             if (err) {
             //respData = {"code": "-2", "msg": err};
             }
             });*/
        }
    }
    var respData = {};
    respData = {"code": "0", "msg": "ok"};
    res.status(200).jsonp(respData);
});

router.post("/getSome", function (req, res) {
    var versionName = req.body.name;
    Parse.Cloud.useMasterKey();
    var versionInfosQuery = new Parse.Query(VersionInfos);
    versionInfosQuery.equalTo("name", versionName);
    versionInfosQuery.find({useMasterKey: true}).then(function (docs) {
        if (!docs || docs.length < 1) {
            res.status(200).jsonp({"code": "-2", "msg": "No more message"});
            return;
        }
        var retData = [];
        for (var i = 0; i < docs.length; i++) {
            var item = {};
            item.name = docs[i].get("name");
            item.type = docs[i].get("type");
            item.url = docs[i].get("url");
            var dateVal = docs[i].get("releaseDate");
            console.log(dateVal.toString());
            var month = ("0" + (dateVal.getMonth() + 1)).slice(-2);
            var date = ("0" + (dateVal.getDate())).slice(-2);
            item.releaseDate = dateVal.getFullYear() + "/" + month + "/" + date;
            console.log(item.releaseDate);
            item.memo = docs[i].get("memo");
            item.forceUpdate = docs[i].get("forceUpdate");
            item.current = docs[i].get("current");
            item.size = docs[i].get("size");
            item.code = docs[i].get("code");
            retData.push(item);
        }
        res.status(200).jsonp({"code": "0", "data": retData});
        return;
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        return;
    });
    /*
     VersionModel.find({"name": versionName}, function (err, docs) {
     if (err) {
     res.status(200).jsonp({"code": "-2", "msg": err});
     return;
     }
     if (docs.length === 0) {
     res.status(200).jsonp({"code": "-3", "msg": "没有查到对应的数据"});
     return;
     }
     var retData = [];
     for (var i = 0; i < docs.length; i++) {
     var item = {};
     item.name = docs[i].name;
     item.type = docs[i].type;
     item.url = docs[i].url;
     var dateVal = docs[i].releaseDate;
     console.log(dateVal.toString());
     var month = ("0" + (dateVal.getMonth() + 1)).slice(-2);
     var date = ("0" + (dateVal.getDate())).slice(-2);
     item.releaseDate = dateVal.getFullYear() + "/" + month + "/" + date;
     console.log(item.releaseDate);
     item.memo = docs[i].memo;
     item.forceUpdate = docs[i].forceUpdate;
     item.current = docs[i].current;
     retData.push(item);
     }
     res.status(200).jsonp({"code": "0", "data": retData});
     });
     */
});

router.post("/search", function (req, res) {
    var sendData = req.body.sendData;
    console.log(JSON.stringify(sendData));
    var isForceUpdate = sendData.forceUpdate;
    var isCurrent = sendData.current;
    var from = sendData.from;
    var to = sendData.to;

    Parse.Cloud.useMasterKey();
    var versionInfosQuery = new Parse.Query(VersionInfos);
    versionInfosQuery.equalTo("forceUpdate", isForceUpdate);
    versionInfosQuery.equalTo("current", isCurrent);
    if (typeof from !== "undefined" && from.length > 0) {
        try {
            var fromDate = new Date(Date.parse(from));
            versionInfosQuery.greaterThanOrEqualTo(fromDate);
        } catch (e) {
            // format the date string error;
        }
    }
    if (typeof to !== "undefined" && to.length > 0) {
        try {
            var toDate = new Date(Date.parse(to));
            versionInfosQuery.lessThanOrEqualTo(toDate);
        } catch (e) {
            //format the date string error;
        }
    }
    versionInfosQuery.find({useMasterKey: true}).then(function (docs) {
        if (!docs || docs.length < 1) {
            res.status(200).jsonp({"code": "-3", "msg": "no data"});
            return;
        }
        var retData = [];
        for (var i = 0; i < docs.length; i++) {
            var item = {};
            item.name = docs[i].get("name");
            item.url = docs[i].get("url");
            item.type = docs[i].get("type");
            item.forceUpdate = docs[i].get("forceUpdate");
            item.current = docs[i].get("current");
            var dateVal = docs[i].get("releaseDate");
            console.log(dateVal.toString());
            var month = ("0" + (dateVal.getMonth() + 1)).slice(-2);
            var date = ("0" + (dateVal.getDate())).slice(-2);
            item.releaseDate = dateVal.getFullYear() + "/" + month + "/" + date;
            item.memo = docs[i].get("memo");
            item.size = docs[i].get("size");
            item.code = docs[i].get("code");
            retData.push(item);
        }
        res.status(200).jsonp({"code": "0", "data": retData});
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        return;
    });


    /*
     var condition = {};
     condition.forceUpdate = isForceUpdate;
     condition.current = isCurrent;
     if (typeof from !== "undefined" && from.length > 0) {
     try {
     var fromDate = new Date(Date.parse(from));
     condition.releaseDate = {};
     condition.releaseDate.$gte = fromDate;
     } catch (e) {
     // format the date string error;
     }
     }
     if (typeof to !== "undefined" && to.length > 0) {
     try {
     var toDate = new Date(Date.parse(to));
     if (typeof condition.releaseDate === "undefined")
     {
     condition.releaseDate = {};
     }
     condition.releaseDate.$lte = toDate;
     } catch (e) {
     //format the date string error;
     }
     }
     var selection = 'name url type forceUpdate current releaseDate memo';
     //var selection = ['name', 'url', 'type', 'forceUpdate', 'current', 'releaseDate', 'memo'];
     var options = {
     sort: {
     name: 1
     }
     };
     console.log(JSON.stringify(condition));
     VersionModel.find(condition, selection, options, function (err, docs) {
     if (err) {
     res.status(200).jsonp({"code": "-2", "msg": err});
     return;
     }
     if (docs.length === 0) {
     res.status(200).jsonp({"code": "-3", "msg": "no data"});
     return;
     }
     var retData = [];
     for (var i = 0; i < docs.length; i++) {
     var item = {};
     item.name = docs[i].name;
     item.url = docs[i].url;
     item.type = docs[i].type;
     item.forceUpdate = docs[i].forceUpdate;
     item.current = docs[i].current;
     var dateVal = docs[i].releaseDate;
     console.log(dateVal.toString());
     var month = ("0" + (dateVal.getMonth() + 1)).slice(-2);
     var date = ("0" + (dateVal.getDate())).slice(-2);
     item.releaseDate = dateVal.getFullYear() + "/" + month + "/" + date;
     item.memo = docs[i].memo;
     retData.push(item);
     }
     res.status(200).jsonp({"code": "0", "data": retData});
     });*/
});

router.post("/testPromise", function (req, res) {
    var reqType = req.body.type;
    var promise = VersionModel.find({
        type: reqType
    }).exec();
    promise.then(function (versions) {
        res.status(200).jsonp({
            "code": "0", "data": versions
        });
    });
});


module.exports = router;
