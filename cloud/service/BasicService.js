var _ = require('lodash');
var i18n = require('i18n');
i18n.configure({
    directory: __dirname + "/../locale"
});
var errors = require("../errcode.js");
const ParseLogger = require('../../parse-server').logger;
const commonFunc = require("./CommonFuncs");
var ConfigInfos = Parse.Object.extend("configinfos");
var AppVersions = Parse.Object.extend("versioninfos");
var Events = Parse.Object.extend("events");

const cfg = require('../../config/index');
var request = require('request');
const uuidV4 = require('uuid/v4');

exports.getAppVersions = function (req, res) {
    commonFunc.setI18n(req, i18n);
    Parse.User.enableUnsafeCurrentUser();
    var query = new Parse.Query(AppVersions);
    query.equalTo('current', true);
    query.equalTo('type', 'android')
    query.descending('createdAt');

    query.first({
        useMasterKey: true
    }).then(function (v) {
        // If not, create a new user.
        if (!v) {
            ParseLogger.log("warn", "Cannot find the version data", { "req": req });
            return res.error(errors["noData"], i18n.__("noData"));
        }
        res.success({
            "name": v.get("name"),
            "code": v.get("code"),
            "releasedate": v.get("releaseDate"),
            "memo": v.get("memo"),
            "forceupdate": v.get("forceUpdate") ? 1 : 0,
            "url": v.get("url"),
            "size": v.get("size")
        })
        var b = true;

    }, function (err) {
        ParseLogger.log("error", err, { "req": req });
        res.error(errors["internalError"], i18n.__("internalError"));
    });
};

exports.uploadEvents = function (req, res) {
    //
    commonFunc.setI18n(req, i18n);

    const dimensions = req.params.dimensions;
    const event = req.params.event;
    const at = req.params.at;

    if (!dimensions || !event || !at) {
        ParseLogger.log("warn", "Not provide enough parameters.Please check", { "req": req });
        return res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }

    var events = new Events();
    events.set("at", new Date(at));
    events.set("event", event);
    events.set("dimensions", dimensions);
    events.save().then(function (saved) {
            if (saved) {
                var ret = {};
                return res.success(ret);
            } else {
                ParseLogger.log("warn", "internalError", { "req": req });
                return res.error(errors["internalError"], i18n.__("internalError"));
            }
        },
        function (error) {
            ParseLogger.log("error", error, { "req": req });
            return res.error(errors["internalError"], i18n.__("internalError"));
        })

 };


exports.instantiateApp = function (req, res) { 
    
    //
    commonFunc.setI18n(req, i18n);
    
    // appversion:    string 必须
    // devicetype: enum [android ios]  必须
    // appIdentifier: string 包名 bundleid 必须
    // appname：  string 必须
    // osversion: string 必须
    // devicename: string 必须
    // pushtype: string
    // devicetoken: string  

    const devicetype = req.params.devicetype;
    const appversion = req.params.appversion;
    const appidentifier = req.params.appidentifier;
    const appname = req.params.appname;
    const osversion = req.params.osversion;
    const device = req.params.device;

    //optional
    const pushtype = req.params.pushtype;
    const devicetoken = req.params.devicetoken;

    if (!appversion || !appidentifier || !appname || !osversion || !device || !devicetype ) {
        ParseLogger.log("warn", "Not provide enough parameters.Please check", { "req": req });
        return res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }

    //request from parseserver
    var url = cfg.server_url + '/installations';
    const uuid = uuidV4();
    var options = {
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'User-Agent': 'request',
            'x-gdsport-api-key': req.headers['x-gdsport-api-key'],
            'x-gdsport-application-id': req.headers['x-gdsport-application-id'],
            'Content-Type':"application/json"
        },
        body:{
            "deviceType": req.params.devicetype,
            "appversion": req.params.appversion,
            "appidentifier": req.params.appidentifier,
            "appname": req.params.appname,
            "osversion": req.params.osversion,
            "device": req.params.device,
            "installationId": uuid,
            "devicetoken": devicetoken,
            "pushtype": pushtype
        }
    };

    request.post(options, function (error, response, body) {
        
        if(!error && body && body.objectId)
        {
            var ret = {};
            ret.installationId = uuid;
            return res.success(ret);        
        }else{
            ParseLogger.log("error", error, { "req": req });
            return res.error(errors["internalError"], i18n.__("internalError"));
        }
    })
};


exports.updateInstance = function (req, res) { 
    //
    commonFunc.setI18n(req, i18n);
    const installationId = req.installationId;
    const pushtype = req.params.pushtype;
    const devicetoken = req.params.devicetoken;

    if (!installationId || !pushtype || !devicetoken) {
        ParseLogger.log("warn", "Not provide installationId, pushtype or devicetoken", { "req": req });
        return res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }

    var query = new Parse.Query(Parse.Installation);
    query.equalTo('installationId', installationId);
    query.descending('createdAt');
    query.first({
        useMasterKey: true
    }).then(function (singleInstallation) {
        if(singleInstallation)
        {
            var storedDeviceType = singleInstallation.get('pushtype');
            var storedDeviceToken = singleInstallation.get('devicetoken');
            if(storedDeviceToken || storedDeviceType)
            {
                ParseLogger.log("warn", "NoPermissionUpdateInstallationInfo", { "req": req });
                return res.error(errors["internalError"], i18n.__("NoPermissionUpdateInstallationInfo"));
            }

            singleInstallation.set("pushtype", pushtype);
            singleInstallation.set("devicetoken", devicetoken);
            singleInstallation.save().then(function(saved){
                if(saved)
                {
                    var ret = {};
                    ret.installationId = installationId;
                    return res.success(ret);  
                }else{
                    ParseLogger.log("warn", "internalError", { "req": req });
                    return res.error(errors["internalError"], i18n.__("internalError"));
                }
            },
            function(err){
                ParseLogger.log("warn", "internalError", { "req": req });
                return res.error(errors["internalError"], i18n.__("internalError"));
            })

        }else{
            ParseLogger.log("warn", "noDeviceFound", { "req": req });
            return res.error(errors["noDeviceFound"], i18n.__("noDeviceFound"));        
        }
    });
  

};


exports.sendSMSCode = function (req, res) {
    commonFunc.setI18n(req, i18n);
    const phoneNumber = req.params.phonenum;

    if (typeof phoneNumber === "undefined") {
        res.error(errors["noPhoneNb"], i18n.__("noPhoneNb"));
        ParseLogger.error(i18n.__("noPhoneNb"), { "req": req });
        return;
    }

    const reg = /^1[0-9]{10}$/;
    if (!reg.test(phoneNumber)) {
        ParseLogger.error(i18n.__("invalidPhoneFormat"), { "req": req });
        return res.error(errors["invalidPhoneFormat"], i18n.__("invalidPhoneFormat"));
    }

    commonFunc.hasSmsSendAuth(phoneNumber).
    then(function (ret) {
        return commonFunc.sendSmsCode(phoneNumber);
    }, function (err) {
        ParseLogger.error(err, { "req": req });
        res.error(errors[err], i18n.__(err));
        Parse.reject(err);
        return;
    })
    .then(function (doc) {
        return commonFunc.hiddenPhoneNo(phoneNumber);
    }, function (err) {
        ParseLogger.error( err, { "req": req });
        res.error(errors["smsCodeFrequent"], i18n.__("smsCodeFrequent"));
        Parse.reject(err);
        return;
    }).then(function (finalNo) {
        let smsLogs = new SmsLogs();
        smsLogs.set("phoneNo", phoneNumber);
        return smsLogs.save(null, { useMasterKey: true });
    }).then(function(){
        let ret = {};
        ret.phoneNumber = finalNo;
        return res.success(ret);
    }, function (err) {
        ParseLogger.error( err, { "req": req });
        return res.error(errors["internalError"], i18n.__("internalError"));
    });

};

exports.getSettings = function (req, res) {
    commonFunc.setI18n(req, i18n);
    if (typeof req.params === "undefined" || typeof req.params.alias === "undefined") {
        ParseLogger.log("warn", "Not provide the params or params.alias", { "req": req });
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    var alias = req.params.alias;
    if (alias === null) {
        ParseLogger.log("warn", "The alias is null", { "req": req });
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    Parse.Cloud.useMasterKey();
    var configInfosQuery = new Parse.Query(ConfigInfos);

    if (alias.length === 0) {
        configInfosQuery.find({ useMasterKey: true }).then(function (docs) {
            var ret = {};
            if (docs && docs.length > 0) {
                for (var i = 0; i < docs.length; i++) {
                    var itemAlias = docs[i].get("alias");
                    var itemValue = docs[i].get("value");
                    try {
                        var jsonValue = JSON.parse(itemValue);
                        ret[itemAlias] = jsonValue;
                    }
                    catch (e) {
                        ret[itemAlias] = itemValue;
                    }

                }
            }
            res.success(ret);
        }, function (err) {
            ParseLogger.log("error", err, { "req": req });
            res.error(errors["internalError"], i18n.__("internalError"));
        });
    } else {
        configInfosQuery.find({ useMasterKey: true }).then(function (docs) {
            var ret = {};
            if (docs && docs.length > 0) {
                for (var i = 0; i < docs.length; i++) {
                    var itemAlias = docs[i].get("alias");
                    for (var k = 0; k < alias.length; k++) {
                        if (alias[k] === itemAlias) {
                            var itemValue = docs[i].get("value");
                            try {
                                var jsonValue = JSON.parse(itemValue);
                                ret[itemAlias] = jsonValue;
                            }
                            catch (e) {
                                ret[itemAlias] = itemValue;
                            }
                            break;
                        }
                    }
                }
            }
            res.success(ret);
        }, function (err) {
            ParseLogger.log("error", err, { "req": req });
            res.error(errors["internalError"], i18n.__("internalError"));
        });
    }

};

// exports."validSmsCode", function (req, res) {
//     commonFunc.setI18n(req, i18n);
//     if (typeof req.params === "undefined" || typeof req.params.phoneno === "undefined") {
//         ParseLogger.log("warn", "Not provide the params or params.phoneno", {"req": req});
//         res.error(errors["noPhoneNb"], i18n.__("noPhoneNb"));
//         return;
//     }
//     if (typeof req.params === "undefined" || typeof req.params.code === "undefined") {
//         ParseLogger.log("warn", "Not provide the params.code", {"req": req});
//         res.error(errors["noSmsCode"], i18n.__("noSmsCode"));
//         return;
//     }
//     var phoneno = req.params.phoneno;
//     var code = req.params.code;
//     commonFunc.validSmsCode(phoneno, code).then(function (doc) {
//         if (!doc) {
//             ParseLogger.log("warn", "The SMS code is invalid", {"req": req});
//             res.error(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
//             return;
//         }
//         var ret = {};
//         ret.valid = "1";
//         res.success(ret);
//         return;
//     }, function (err) {
//         ParseLogger.log("error", err, {"req": req});
//         res.error(errors[err], i18n.__(err));
//     });
// });

