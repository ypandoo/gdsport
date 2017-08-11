/**
 * Created by yuhailong on 06/04/2017.
 */
var i18n = require('i18n');
var _ = require('lodash');
i18n.configure({
    directory: __dirname + "/../locale"
});
var errors = require("../errcode.js");
const commonFunc = require("./CommonFuncs");
var ConfigInfos = Parse.Object.extend("configinfos");
var BindLogs = Parse.Object.extend("bindlogs");
var BandUser = Parse.Object.extend("BandUser");
var MacTool = require("../tools/macUtil");
var RegisterLogs = Parse.Object.extend("registerlogs");
var BandSettings = Parse.Object.extend("BandSettings");
var UserProfile = Parse.Object.extend("UserProfile");


/**
 * Sending the SMS code according the band name.
 */
// Parse.Cloud.define("sendSMSCodeBand", function (req, res) {
//     commonFunc.setI18n(req, i18n);
//     if (typeof req.params === "undefined") {
//         ParseLogger.log("warn", i18n.__("invalidParameter"), {"req": req});
//         res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
//         return;
//     }
//     if (typeof req.params.bandname === "undefined") {
//         ParseLogger.log("warn", i18n.__("noBandName"), {"req": req});
//         res.error(errors["noBandName"], i18n.__("noBandName"));
//         return;
//     }
//     if (typeof req.params.phonenumber === "undefined") {
//         ParseLogger.log("warn", i18n.__("noPhoneNb"), {"req": req});
//         res.error(errors["noPhoneNb"], i18n.__("noPhoneNb"));
//         return;
//     }
//     var bandName = req.params.bandname;
//     var phoneNo = req.params.phonenumber;
//     //var phoneNo = "";
//     Parse.Cloud.useMasterKey();
//     //var preloadBandQuery = new Parse.Query(PreloadBand);
//     // preloadBandQuery.equalTo("bandName", bandName);
//     // preloadBandQuery.first({useMasterKey: true}).then(function (preloadBand) {
//     //     if (!preloadBand) {
//     //         res.error("The band name is invalid");
//     //         reject("The band name is invalid");
//     //         return;
//     //     } else {
//     //         phoneNo = preloadBand.get("phoneNo").toString();
//     //         return sendSmsCode(phoneNo);
//     //     }
//     // })
//     commonFunc.hasSmsSendAuth(phoneNo).then(function (ret) {
//         return sendSmsCode(phoneNo);
//     }, function (err) {
//         ParseLogger.log("error", err, {"req": req});
//         res.error(errors[err], i18n.__(err));
//         Parse.Promise.reject(err);
//         return;
//     }).then(function (doc) {
//         return commonFunc.hiddenPhoneNo(phoneNo);
//     }, function (err) {
//         ParseLogger.log("error", err, {"req": req});
//         res.error(errors["smsCodeFrequent"], i18n.__("smsCodeFrequent"));
//     }).then(function (finalNo) {
//         var smsLogs = new SmsLogs();
//         smsLogs.set("phoneNo", phoneNo);
//         smsLogs.save(null, {useMasterKey: true});
//         var ret = {};
//         ret.phoneNumber = finalNo;
//         res.success(ret);
//     }, function (err) {
//         ParseLogger.log("error", err, {"req": req});
//         res.error(errors["internalError"], i18n.__("internalError"));
//     });
// });


/**
 * just band user can bind the band
 */
exports.bindBand = function (req, res) {
    commonFunc.setI18n(req, i18n);
    Parse.Cloud.useMasterKey();
    if (typeof req.params === "undefined") {
        ParseLogger.log("warn", "No req.params", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    if (typeof req.params.bandname === "undefined") {
        ParseLogger.log("warn", "No req.params.bandname", {"req": req});
        res.error(errors["noBandName"], i18n.__("noBandName"));
        return;
    }
    if (typeof req.params.address === "undefined") {
        ParseLogger.log("warn", "No req.params.address", {"req": req});
        res.error(errors["noBandAddr"], i18n.__("noBandAddr"));
        return;
    }
    if (typeof req.params.code === "undefined") {
        ParseLogger.log("warn", "No req.params.code", {"req": req});
        res.error(errors["noSmsCode"], i18n.__("noSmsCode"));
        return;
    }
    if (typeof req.params.pushid === "undefined") {
        ParseLogger.log("warn", "No req.params.pushid", {"req": req});
        res.error(errors["noPushId"], i18n.__("noPushId"));
        return;
    }
    if (typeof req.params.phonenumber === "undefined") {
        ParseLogger.log("warn", "No req.params.phonenumber", {"req": req});
        res.error(errors["noPhoneNb"], i18n.__("noPhoneNb"));
        return;
    }
    if (typeof req.params.localtime === "undefined") {
        ParseLogger.log("warn", "No req.params.localtime", {"req": req});
        res.error(errors["noLocalTime"], i18n.__("noLocalTime"));
        return;
    }
    var bandName = req.params.bandname;
    var bandAddr = req.params.address;
    var code = req.params.code;
    var pushId = req.params.pushid;
    var userName = commonFunc.getRandomStr();
    var passWord = commonFunc.getRandomStr();
    var phoneNo = req.params.phonenumber;
    var installationId = req.installationId;
    var localTime = req.params.localtime;
    var tLoginUser = null;
    var sessionToken = "";
    var retUserName = "";
    var retObjectId = "";
    var retCreatedAt = "";
    var formerBandUser = null;
    if (!bandName || !bandAddr) {
        ParseLogger.log("warn", "No bandName or bandAddr", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    if (typeof req.installationId === "undefined" || !req.installationId) {
        ParseLogger.log("warn", "No installationid provided", {"req": req});
        res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
        return;
    }

    hasBindBandAuth(req.installationId).then(function (ret) {
        return commonFunc.validSmsCode(phoneNo, code);
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        Parse.Promise.reject(err);
        return;
    }).then(function (smsCodeInfo) {
        if (!smsCodeInfo) {
            ParseLogger.log("error", "Invalid SMS code", {"req": req});
            res.error(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
            Parse.Promise.reject("The SMS code is incorrect");
            return;
        } else {
            if (typeof req.installationId === "undefined") {
                ParseLogger.log("error", "No installationId provided", {"req": req});
                res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
                Parse.Promise.reject("No installationId in the request");
                return;
            }
            var configInfosQuery = new Parse.Query(ConfigInfos);
            configInfosQuery.equalTo("alias", "AppTimeThreshold");
            return configInfosQuery.first({useMasterKey: true});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        Parse.Promise.reject(errMsg);
        return;
    }).then(function (configInfo) {
        var appTimeThreshold = 600;
        if (configInfo) {
            appTimeThreshold = parseInt(configInfo.get("value"));
        }
        var serverTimeStamp = new Date().getTime();
        var appLocalTime = parseInt(localTime);
        if (appLocalTime < (serverTimeStamp + appTimeThreshold * 1000)
            &&
            appLocalTime > (serverTimeStamp - appTimeThreshold * 1000)
        ) {
            var bandUserQuery = new Parse.Query(BandUser);
            bandUserQuery.equalTo("bandName", bandName);
            return bandUserQuery.first({useMasterKey: true});
        } else {
            ParseLogger.log("error", "AppTimeThreshold is expired", {"req": req});
            res.error(errors["invalidTimestamp"], i18n.__("invalidTimestamp"));
            Parse.Promise.reject(errMsg);
            return;
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        Parse.Promise.reject(errMsg);
        return;
    })
        .then(function (fBandUser) {
            if (!fBandUser) {
                // todo the all new band user
                signUpAllNewBandUser(req, res, bandName, bandAddr, userName, passWord, phoneNo);
                //return;
                //Promise.reject("Sign up a new user for new band");
                return;
            } else {
                formerBandUser = fBandUser;
                if (formerBandUser.get("username")) {
                    var userQuery = new Parse.Query(Parse.User);
                    userQuery.equalTo("username", formerBandUser.get("username"));
                    return bindExistBand(userQuery.first({useMasterKey: true}),
                        req, res, installationId, pushId, bandName, bandAddr, phoneNo);
                }
            }
        }, function (err) {
            // res.error(errors["internalError"], i18n.__("internalError"));
            // reject(err.message);
            ParseLogger.log("error", err, {"req": req});
            return;
        })


    //
    // Parse.User.enableUnsafeCurrentUser();
    // // if (!Parse.User.current()) {
    //
    // // 	return;
    // // }
    // var queryPreloadBand = new Parse.Query(PreloadBand);
    // queryPreloadBand.equalTo('bandName', bandName);
    // queryPreloadBand.ascending('createdAt');
    //
    // Parse.Promise.as().then(function () {
    //     return queryPreloadBand.first({
    //         useMasterKey: true
    //     });
    // }).then(function (preloadBandObj) {
    //     return upsertBandUser(null, {
    //         bandName,
    //         bandAddr
    //     });
    // }).then(function (user) {
    //         res.success(user.getSessionToken());
    //     },
    //     // 		return Parse.Promise.as();
    //     // }).then(function(){
    //     // 	 return Parse.User.current().fetch()
    //
    //     //  }).then(function(user) {
    //     // 	    var bands = user.get("bands")|| [];
    //     // 		user.set("bands", bands.append(bandName));
    //     // 		return user.save();
    //     //   }).then(function(user){
    //     // 		res.success({});
    //
    //     //   },
    //     function (error) {
    //         res.error(error);
    //     });
    //

};


/**
 * Used to bind the registered bands
 * @param promiseUser Promise Band User
 */

var bindExistBand = function (promiseUser, req, res, installationId, pushId, bandName, bandAddr, phoneNo) {
    var userName = "";
    var passWord = commonFunc.getRandomStr();
    var sessionToken = null;
    var retUserName = null;
    var retObjectId = null;
    var retCreatedAt = null;
    var tLoginUser = null;
    var sessionMacKey = MacTool.getRandomKey();
    console.log("sessionMacKey:" + sessionMacKey);
    var funcName = "bindBand";
    promiseUser
        .then(function (pUser) {
            if (pUser) {
                userName = pUser.getUsername();
            } else {
                pUser = new Parse.User();
                pUser.setUsername(userName, {useMasterKey: true});
            }
            pUser.setPassword(passWord, {useMasterKey: true});
            return pUser.save(null, {useMasterKey: true});
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            Promise.reject(err.message);
            return;
        }).then(function (pUser) {
        var registerLogsQuery = new Parse.Query(RegisterLogs);
        registerLogsQuery.equalTo("installationId", installationId);
        return registerLogsQuery.first({useMasterKey: true});
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
        Promise.reject(err.message);
        return;
    }).then(function (registerLog) {
        if (!registerLog) {
            // todo the band need to rebind, so need to handle the rebind request
            registerLog = new RegisterLogs();
        }
        registerLog.set("username", userName);
        registerLog.set("password", commonFunc.doEncrypt(passWord));
        registerLog.set("pushId", pushId);
        registerLog.set("installationId", req.installationId);
        registerLog.save(null, {useMasterKey: true});
        return Parse.User.logIn(userName, passWord);
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
        Promise.reject(err.message);
        return;
    }).then(function (loginUser) {
        if (!loginUser) {
            ParseLogger.log("error", "Failed to login the user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            Promise.reject("login failed");
            return;
        } else {
            sessionToken = loginUser.getSessionToken();
            retUserName = loginUser.getUsername();
            retObjectId = loginUser.id;
            retCreatedAt = loginUser.createdAt;
            tLoginUser = loginUser;
            commonFunc.storeAfterLogin(req, loginUser);
            var bandUserQuery = new Parse.Query(BandUser);
            bandUserQuery.equalTo("bandName", bandName);
            return bandUserQuery.first({useMasterKey: true});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
        Promise.reject(i18n.__("internalError"));
        return;
    }).then(function (bandUser) {
        if (!bandUser) {
            var bandUser = new BandUser();
        }
        bandUser.set("user", tLoginUser);
        bandUser.set("bandName", bandName);
        bandUser.set("bandAddress", bandAddr);
        bandUser.set("phoneNo", phoneNo);
        bandUser.set("username", userName);
        bandUser.set("sessionMacKey", sessionMacKey);
        bandUser.set("password", commonFunc.doEncrypt(passWord));
        return bandUser.save(null, {userMasterKey: true});

    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
    }).then(function (bandUser) {
        if (!bandUser) {
            ParseLogger.log("error", "Failed to save the user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            Promise.reject("save band user failed");
        } else {
            // log for bind band succeed;
            var bindLogs = new BindLogs();
            bindLogs.set("installationId", installationId);
            bindLogs.save(null, {useMasterKey: true});
            var ret = {};
            ret.sessionToken = sessionToken;
            ret.username = retUserName;
            ret.objectId = retObjectId;
            ret.salt = MacTool.getBindKey(sessionMacKey, sessionToken);
            ret.createdAt = retCreatedAt;
            res.success(ret);
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
    });
};

/**
 * just band user can unbind
 */
exports.unbindBand = function (req, res) {
    commonFunc.setI18n(req, i18n);
    Parse.Cloud.useMasterKey();
    Parse.User.enableUnsafeCurrentUser();
    if (req.user) {
        // No need to fetch the current user for querying Note objects.
        var sessionQuery = new Parse.Query(Parse.Session);
        sessionQuery.equalTo("user", req.user);
        sessionQuery.equalTo("installationId", req.installationId);
        sessionQuery.find({useMasterKey: true}).then(function (sessions) {
            _.forEach(sessions, function (item) {
                item.destroy();
            });
            //req.user.destroy();
            res.success({});
        }, function (err) {
            ParseLogger.log("info", err, {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
        });
        // Parse.User.logOut().then(function (obj) {
        //     res.success({});
        // }, function (err) {
        //     res.error(err.message);
        // });


    } else {
        ParseLogger.log("warn", "Not provide the parameter user", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }
};

exports.updateDevSettings = function (req, res) {
    commonFunc.setI18n(req, i18n);
    var bandName = req.params.bandname;
    var settings = req.params.settings;

    if (!bandName || !settings) {
        ParseLogger.log("warn", "Not provide the bandName or the settings", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            res.error(errors["invalidSession"], i18n.__("invalidSession"));
            return;
        } else {
            Parse.Cloud.useMasterKey();
            Parse.User.enableUnsafeCurrentUser();
            var band;
            var query = new Parse.Query(BandUser);
            query.equalTo('bandName', bandName);
            query.ascending('createdAt');
            return query.first({
                useMasterKey: true
            }).then(function (b) {
                // If not, create a new user.
                if (!b) {
                    ParseLogger.log("error", "Cannot find the band", {"req": req});
                    return res.error(errors["noBandFound"], i18n.__("noBandFound"));
                }
                band = b;

                var bandSettings;
                if (b.get('settings')) {
                    bandSettings = b.get('settings');
                    return Parse.Promise.as(b);
                } else {
                    bandSettings = new BandSettings();
                    b.set('settings', bandSettings);
                    return b.save(null, {useMasterKey: true});
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (b) {
                var bandSettings;
                if (b.get('settings')) {
                    bandSettings = b.get('settings');
                    _.forEach(settings, function (value, key) {
                        bandSettings.set(key, value);

                    });
                    return bandSettings.save(null, {useMasterKey: true});
                } else {
                    ParseLogger.log("warn", "No band setting found", {"req": req});
                    res.error(errors["noBandSetting"], i18n.__("noBandSetting"));
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (bandsettings) {
                res.success({});
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
                return;
            });
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        return;
    });

};
exports.getDevSettings = function (req, res) {
    commonFunc.setI18n(req, i18n);
    var bandName = req.params.bandname;
    var band;
    if (!bandName) {
        ParseLogger.log("warn", "Not provide the bandname", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            res.error(errors["invalidSession"], i18n.__("invalidSession"));
            return;
        } else {
            Parse.Cloud.useMasterKey();
            Parse.User.enableUnsafeCurrentUser();
            var query = new Parse.Query(BandUser);
            query.equalTo('bandName', bandName);
            query.ascending('createdAt');


            query.first({
                useMasterKey: true
            }).then(function (b) {
                // If not, create a new user.
                if (!b) {
                    ParseLogger.log("warn", "Cannot find the band", {"req": req});
                    return res.error(errors["noBandFound"], i18n.__("noBandFound"));
                }
                band = b;
                if (b.get('settings')) {
                    var settings = b.get('settings');
                    return settings.fetch();
                } else {
                    return Parse.Promise.as();
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (settings) {
                if (!settings) {
                    res.success({
                        name: band.bandName,
                        settings: {}
                    });
                } else {
                    res.success({
                        name: band.bandName,
                        settings: settings.toJSON()

                    });
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            });
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        return;
    });
};

/**
 * used to verify if the installation id is authorized for bind band
 * @param installationId
 * @returns {Parse.Promise}
 */

var hasBindBandAuth = function (installationId) {
    Parse.Cloud.useMasterKey();
    var preOneDay = new Date((new Date()).getTime() - 24 * 60 * 60 * 1000);
    var preOneHour = new Date((new Date()).getTime() - 1 * 60 * 60 * 1000);
    var hourMax = 3;
    var dailyMax = 20;
    var promise = new Parse.Promise(function (resolve, reject) {
        var configQuery = new Parse.Query(ConfigInfos);
        configQuery.equalTo("alias", "BindBandConstraint");
        configQuery.first({useMasterKey: true}).then(
            function (conf) {
                if (conf) {
                    var confValue = conf.get("value");
                    var confArr = JSON.parse(confValue);
                    hourMax = parseInt(confArr[0]);
                    dailyMax = parseInt(confArr[1]);
                }
                var bindLogQuery = new Parse.Query(BindLogs);
                bindLogQuery.equalTo("installationId", installationId);
                bindLogQuery.greaterThan("createdAt", preOneDay);
                return bindLogQuery.count({useMasterKey: true})
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                reject("internalError");
            }
        ).then(function (cnt) {
            if (cnt >= dailyMax) {
                reject("bindFrequent");
                return;
            }
            var bindLogQuery = new Parse.Query(BindLogs);
            bindLogQuery.equalTo("installationId", installationId);
            bindLogQuery.greaterThan("createdAt", preOneHour);
            return bindLogQuery.count({useMasterKey: true});
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            reject("internalError");
            return;
        }).then(function (cnt) {
            if (cnt >= hourMax) {
                reject("bindFrequent");
                return;
            } else {
                resolve("ok");
                return;
            }

        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            reject("internalError");
            return;
        });
    });
    return promise;
}


var signUpAllNewBandUser = function (req, res, bandName, bandAddr, userName, passWord, phoneNo) {
    Parse.Cloud.useMasterKey();
    var sessionToken = "";
    var retUserName = "";
    var retObjectId = "";
    var retCreatedAt = "";
    var retUser = null;
    var installationId = req.installationId;
    var sessionMacKey = MacTool.getRandomKey();
    var nUser = new Parse.User();
    nUser.setUsername(userName);
    nUser.setPassword(passWord);
    nUser.signUp().then(function (lUser) {
        if (!lUser) {
            ParseLogger.log("error", "Failed to create the new user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            Parse.Promise.reject("Failed to create user");
            return;
        } else {
            retUser = lUser;
            sessionToken = lUser.getSessionToken();
            retUserName = lUser.getUsername();
            retObjectId = lUser.id;
            retCreatedAt = lUser.createdAt;
            return commonFunc.storeAfterSignup(req, lUser, userName, passWord, i18n);
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
        Parse.Promise.reject("Failed to create user");
        return;
    }).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("error", "Failed to create the register log", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            Parse.Promise.reject("Failed to create reg log");
            return;
        } else {
            var bandUser = new BandUser();
            bandUser.set("bandName", bandName);
            bandUser.set("bandAddress", bandAddr);
            bandUser.set("user", retUser);
            bandUser.set("phoneNo", phoneNo);
            bandUser.set("sessionMacKey", sessionMacKey);
            bandUser.set("username", userName);
            bandUser.set("password", commonFunc.doEncrypt(passWord));
            return bandUser.save(null, {useMasterKey: true});
        }
    }, function (errMsg) {
        ParseLogger.log("error", errMsg, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
        Parse.Promise.reject(errMsg);
        return;
    }).then(function (bUser) {
        if (!bUser) {
            ParseLogger.log("error", "Failed to save the bandUser", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));

        } else {
            var bindLogs = new BindLogs();
            bindLogs.set("installationId", installationId);
            bindLogs.save(null, {useMasterKey: true});
            var ret = {};
            ret.sessionToken = sessionToken;
            ret.username = retUserName;
            ret.objectId = retObjectId;
            ret.createdAt = retCreatedAt;
            ret.salt = MacTool.getBindKey(sessionMacKey, sessionToken);
            res.success(ret);
        }

    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
    });
};


