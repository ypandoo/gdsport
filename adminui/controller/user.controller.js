var express = require("express");
var router = new express.Router();
var Features = require("../config/features");

var PasswordTool = require("../tools/password");

var UserInfos = Parse.Object.extend("admininfos");


router.get("/", function (req, res) {
    res.render("user/index");
});

router.get("/index/:url", function (req, res) {
    var reqUrl = "user/" + req.params.url;
    console.log(req.params.url);
    var featureOptions = "";
    for (var fKey in Features) {
        featureOptions += "<option value=\"";
        featureOptions += fKey;
        featureOptions += "\">";
        featureOptions += Features[fKey];
        featureOptions += "</option>";
    }
    var renderOptions = {};
    renderOptions.features = JSON.stringify(Features);
    renderOptions.featureOptions = featureOptions;
    res.render(reqUrl, renderOptions);
});

router.post("/getAll", function (req, res) {
    Parse.Cloud.useMasterKey();
    var userInfosQuery = new Parse.Query(UserInfos);
    userInfosQuery.find({useMasterKey: true}).then(function (users) {
        var retUsers = [];
        if (!users || users.length === 0) {
        } else {
            for (var i = 0; i < users.length; i++) {
                var item = {};
                item.id = users[i].id;
                item.name = users[i].get("name");
                item.realName = users[i].get("realName");
                item.group = users[i].get("group");
                item.createAt = users[i].get("createdAt");
                /*var usedFeatures = [];
                 if (typeof users[i].get("features") !== "undefined") {
                 usedFeatures = users[i].features;
                 }
                 var dispFeature = "";
                 if (usedFeatures && usedFeatures.length > 0) {
                 for (var j = 0; j < usedFeatures.length; i++) {
                 var fKey = usedFeatures[j];
                 dispFeature += Features[fKey] + " ";
                 }
                 }*/
                item.features = users[i].get("features");
                item.isAvail = users[i].get("isAvail");
                retUsers.push(item);
            }
        }
        res.status(200).jsonp({"code": "0", "data": retUsers});
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        return;
    });
});

router.post("/modify", function (req, res) {
    var data = req.body.sendData;
    var type = data.type;
    var id = data.id;
    var value = data.val;
    var initValPromise = new Promise(function (resolve, reject) {
        if (type === "isAvail") {
            if (value === "true") {
                value = true;
            } else {
                value = false;
            }
            resolve(value);
        }
        else if (type === "password") {
            PasswordTool.hash(value).then(function (hashedPassword) {
                resolve(hashedPassword);
            }, function (err) {
                res.status(200).jsonp({"code": "-2", "msg": err});
                return;
            });
        }
        else {
            resolve(value);
        }
    });
    initValPromise.then(function (initVal) {
        value = initVal;
        Parse.Cloud.useMasterKey();
        var userInfosQuery = new Parse.Query(UserInfos);
        return userInfosQuery.get(id, {useMasterKey: true});
    })
        .then(function (user) {
            if (!user) {
                res.status(200).jsonp({"code": "-2", "msg": "Cannot find the user"});
            }
            user.set(type, value);
            user.save().then(function () {
                res.status(200).jsonp({"code": "0", "msg": ""});
            }, function (err) {
                res.status(200).jsonp({"code": "-2", "msg": err});
            })
        }, function (err) {
            res.status(200).jsonp({"code": "-2", "msg": err});
        });
});

router.post("/add", function (req, res) {
    var sendData = req.body.sendData;
    var name = sendData.name;
    var password = sendData.password;
    var realName = sendData.realName;
    var group = sendData.group;
    var features = sendData.features;
    var isUniq = false;
    Parse.Cloud.useMasterKey();
    var adminInfos = new Parse.Query(UserInfos);
    adminInfos.equalTo("name", name);
    adminInfos.first({useMasterKey: true}).then(function (user) {
        if (user) {
            res.status(200).jsonp({"code": "-2", "msg": "用户名已经存在，请更换用户名"});
            return Parse.Promise.as(-1);
        }
        isUniq = true;
        return Parse.Promise.as(1);
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        return parse.Promise.as(-1);
    }).then(function (uniqCheck) {
        if (uniqCheck === 1) {
            return PasswordTool.hash(password);
        }
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
    }).then(function (hashedPassword) {
        if (isUniq) {
            var newUser = new UserInfos();
            newUser.set("name", name);
            newUser.set("password", hashedPassword);
            newUser.set("realName", realName);
            newUser.set("group", group);
            newUser.set("isAvail", true);
            newUser.set("features", features);
            newUser.save();
            res.status(200).jsonp({"code": "0", "msg": ""});
        }
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
    });
});

module.exports = router;