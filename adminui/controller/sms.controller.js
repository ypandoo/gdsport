var express = require("express");
var router = express.Router();
var EventBus = require('vertx3-eventbus-client');
var SmsService = require('../tools/alisms_service-proxy');
var MathUtil = require('../tools/mathUtil');
var SmsModel = require('../model/sms.model');

var ConfigInfos = Parse.Object.extend("configinfos");
var SmsInfos = Parse.Object.extend("smsinfos");


/**
 * req:{
 *      phoneno: "13810616786" // the telephone number
 *      }
 */
router.get("/sendSms", function (req, res) {
    var random = MathUtil.getRandom(999999, 100000).toString();
    var phoneNo = req.query.phoneno.toString();
    var eb = new EventBus('http://localhost:8080/eventbus/');
    eb.onopen = function () {
        var processorService = new SmsService(eb, "service.alisms");
        processorService.sendCode(phoneNo, random, function (err, resp) {
            if (err) {
                console.error(err);
                res.status(200).jsonp({"code": "-2", "msg": err});
                return;
            }
            console.log(resp);
            Parse.Cloud.useMasterKey();
            var configInfosQuery = new Parse.Query(ConfigInfos);
            configInfosQuery.equalTo("alias", "SmsExpiration");
            configInfosQuery.first({useMasterKey: true}).then(function (doc) {
                var smsExpiration = 300;
                if (!doc) {
                    smsExpiration = 300;
                }
                smsExpiration = parseInt(doc.get("value"));
                var now = new Date();
                var timeStamp = Date.parse(now);
                var destExpiration = timeStamp + smsExpiration * 1000;
                var expireTime = new Date(destExpiration);
                var smsInfos = new SmsInfos();
                smsInfos.set("phoneNo", phoneNo);
                smsInfos.set("data", random);
                smsInfos.set("sendTime", now);
                smsInfos.set("expireTime", expireTime);
                smsInfos.save({useMasterKey: true}).then(function (doc) {
                    res.status(200).jsonp({"code": "0", "msg": "0"});
                    return;
                }, function (err1) {
                    res.status(200).jsonp({"code": "-2", "msg": err1});
                    return;
                })
            }, function (err) {
                res.status(200).jsonp({"code": "-2", "msg": err});
            });
        });
    };
});

/**
 * req:{
 *          phoneno:    "13810616786"   //telephone number
 *          code:       "123456"        //the validating code
 *      }
 */
router.get("/validate", function (req, res) {
    var phoneno = req.query.phoneno.toString();
    var code = req.query.code.toString();
    var now = new Date();
    Parse.Cloud.useMasterKey();
    var smsInfosQuery = new Parse.Query(SmsInfos);
    smsInfosQuery.equalTo("phoneNo", phoneno);
    smsInfosQuery.equalTo("data", code);
    smsInfosQuery.greaterThan("expireTime", now);
    smsInfosQuery.first({useMasterKey: true}).then(function (doc) {
        if (!doc) {
            res.status(200).jsonp({"code": "-2", "msg": "Not valid"});
            return;
        }
        res.status(200).jsonp({"code": "0", "msg": "ok"});
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        return;
    });
});

module.exports = router;


