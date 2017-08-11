/**
 * Created by yuhailong on 27/03/2017.
 */
var express = require("express");
var router = express.Router();
var passwordTool = require("../tools/password");

var AdminInfos = Parse.Object.extend("admininfos");

router.get("/", function (req, res) {
    if (!req.session.username) {
        res.status(401).send("请不要非法访问本功能");
    }
    Parse.Cloud.useMasterKey();
    console.dir(req.session);
    var adminInfosQuery = new Parse.Query(AdminInfos);
    adminInfosQuery.equalTo("name", req.session.username);
    adminInfosQuery.first({useMasterKey: true}).then(function (userInfo) {
        var renderOptions = {};
        renderOptions.name = userInfo.get("name");
        renderOptions.realName = userInfo.get("realName");
        res.render("personalinfo/index", renderOptions);
    }, function (err) {
        res.status(500).send("抱歉，发生内部错误，请联系管理员<br/>" + err);
    });
})

router.post("/modify", function (req, res) {
    var sendData = req.body.sendData;
    Parse.Cloud.useMasterKey();
    var uHashedPassword = "-1";
    var userName = req.session.username;
    Parse.Promise.as("").then(function () {
        if (typeof sendData.password !== "undefined") {
            return passwordTool.hash(sendData.password);
        } else {
            return Parse.Promise.as(-1);
        }
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
    }).then(function (hashedPassword) {
        uHashedPassword = hashedPassword;
        var adminInfosQuery = new Parse.Query(AdminInfos);
        adminInfosQuery.equalTo("name", userName);
        return adminInfosQuery.first({useMasterKey: true});
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
    }).then(function (userInfo) {
        if (typeof sendData.realName !== "undefined") {
            userInfo.set("realName", sendData.realName);
        }
        if (uHashedPassword !== -1) {
            userInfo.set("password", uHashedPassword);
        }
        userInfo.save();
        res.status(200).jsonp({"code": "0", "msg": ""});
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
    })
});

module.exports = router;