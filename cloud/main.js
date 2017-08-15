"use strict";

const _ = require('lodash');
const UserService = require("./service/UserService.js");
const DeviceService = require("./service/DeviceService.js");
const HealthService = require("./service/HealthService.js");
const BasicService = require("./service/BasicService.js");



const logger = require('../parse-server').logger;
const i18n = require('i18n');

i18n.configure({
    directory: __dirname + "/locale"
});

var externalGatewayAddr = "http://localhost:20081/eventbus/";
var EventBus = require('vertx3-eventbus-client');


// var language = "zh";
// var languages = ["en", "es", "ja", "kr", "zh"];



// var BandTokenRequest = Parse.Object.extend("BandTokenRequest");
// var PreloadBand = Parse.Object.extend("PreloadBand");
// var BandUser = Parse.Object.extend("BandUser");
// var UserProfile = Parse.Object.extend("UserProfile");
// var BandSettings = Parse.Object.extend("BandSettings");
// var PhoneUser = Parse.Object.extend("PhoneUser");
// var RegisterLogs = Parse.Object.extend("registerlogs");


/**
 * Create a Parse ACL which prohibits public access.  This will be used
 *   in several places throughout the application, to explicitly protect
 *   Parse User, TokenRequest, and TokenStorage objects.
 */
var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

Parse.Cloud.define("sendSMSCode", BasicService.sendSMSCode);
Parse.Cloud.define("getSettings", BasicService.getSettings);
Parse.Cloud.define("getAppVersions", BasicService.getAppVersions);
Parse.Cloud.define("uploadEvents", BasicService.uploadEvents);
Parse.Cloud.define("instantiateApp", BasicService.instantiateApp);
Parse.Cloud.define("updateInstance", BasicService.updateInstance);

Parse.Cloud.define("signup", UserService.signup);
Parse.Cloud.define("signin", UserService.signin);
Parse.Cloud.define("signout", UserService.signout);
Parse.Cloud.define("resetPassword", UserService.resetPassword);
Parse.Cloud.define("updateUserProfile", UserService.updateUserProfile);
Parse.Cloud.define("getUserProfile", UserService.getUserProfile);

Parse.Cloud.define("bindDevice", DeviceService.bindDevice);
Parse.Cloud.define("unbindDevice", DeviceService.unbindDevice);
Parse.Cloud.define("updateDevSettings", DeviceService.updateDevSettings);
Parse.Cloud.define("getDevSettings", DeviceService.getDevSettings);
Parse.Cloud.define("bindDevice", DeviceService.bindDevice);

//Parse.Cloud.define("getHealthData", HealthService.getHealthData);
Parse.Cloud.define("uploadHealthData", HealthService.uploadHealthData);
Parse.Cloud.define("uploadSportData", HealthService.uploadSportData);
Parse.Cloud.define("uploadSleepData", HealthService.uploadSleepData);
Parse.Cloud.define("getSportDataOfDay", HealthService.getSportDataOfDay);
Parse.Cloud.define("getSportDataOfHour", HealthService.getSportDataOfHour);
Parse.Cloud.define("getSleepData", HealthService.getSleepData);

Parse.Cloud.define("testLog", function (req, res) {
    var message = {
        "a": "a",
        "b": "b",
        "c": "c",
        "d": "d",
        "e": "e",
        "f": "f",
        "g": "g",
        "h": "h",
        "i": "i",
        "j": "j",
        "k": "k"
    };
    logger.info("msg:%j", message,{req:req});
    res.success({});
});

Parse.Cloud.define("testPromise", function (req, res) {
    var pushIds = ["da0d2cd7-01b3-4db1-979a-7cc8bde3c034"];
    sendLogoutPushMsg(pushIds);
    res.success({});
    /*
     var code = req.params.code.toString();
     var phoneNo = "13810616786";
     hiddenPhoneNo(phoneNo).then(function (finalNo) {
     res.success({"phoneNo": finalNo});
     return;
     }, function (err) {
     res.error(err);
     })*/
    /*Parse.Promise.as(code).then(function (recv) {
     if (recv === "A") {
     console.log("A");
     res.success({});
     reject();
     } else {
     console.log("Not A");
     return Parse.Promise.as("B");
     }
     }).then(function (recv1) {
     console.log("In the B");
     res.success({"code": "ok"});
     });*/
});


Parse.Cloud.define("testSession", function (req, res) {
    isSessionLegal(req).then(function (sessionInfo) {
        if (sessionInfo) {
            res.success({"session": "ok"});
        } else {
            res.error("session is illegal");
        }
    }, function (errMsg) {
        res.error(errMsg);
    });
});


Parse.Cloud.define("testI18n", function (req, res) {
    /*console.log(req.params.locale);
     console.log(req.params.i18nkey)
     i18n.setLocale(req.params.locale);
     res.success({"msg": i18n.__(req.params.i18nkey)}); */
    var ids = req.params.ids;
    Parse.Cloud.useMasterKey();
    var smsLogQuery = new Parse.Query(RegisterLogs);
    if (typeof ids !== "undefined" && ids !== null && ids.length > 0) {
        smsLogQuery.notContainedIn("sessionToken", ids);
    }
    //smsLogQuery.notEqualTo("id","972ekBRCFN");
    smsLogQuery.find({useMasterKey: true}).then(function (docs) {
        res.success(docs.length);
    }, function (err) {
        res.error(err.message);
    })
});


/**
 * initialize the I18N param, the param from the req.params.locale
 * @param req
 */
var setI18n = function (req) {
    if (typeof req.params !== "undefined" && typeof req.params.locale !== "undefined") {
        i18n.setLocale(req.params.locale);
    } else {
        i18n.setLocale("en");
    }
}


