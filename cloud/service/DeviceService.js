const i18n = require('i18n');
const _ = require('lodash');
i18n.configure({
    directory: __dirname + "/../locale"
});
const errors = require("../errcode.js");
const ParseLogger = require('../../parse-server').logger;
const commonFunc = require("./CommonFuncs");
const ConfigInfos = Parse.Object.extend("configinfos");  
const BindLogs = Parse.Object.extend("bindlogs");
const RegisterLogs = Parse.Object.extend("registerlogs");
const deviceSettings = Parse.Object.extend("devicesettings");
const UserProfile = Parse.Object.extend("UserProfile");
const DeviceInfos = Parse.Object.extend("deviceinfos");

/***Band Device */
exports.bindDevice = function (req, res) {
    commonFunc.setI18n(req, i18n);

    if (typeof req.params === "undefined") {
        ParseLogger.log("warn", "No req.params", { "req": req });
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    } 
    if (typeof req.installationId === "undefined" || !req.installationId) {
        ParseLogger.log("warn", "No installationid provided", { "req": req });
        res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
        return;
    }
    if (typeof req.params.devicename === "undefined") {
        ParseLogger.log("warn", "No req.params.devicename", { "req": req });
        res.error(errors["nodevicename"], i18n.__("nodevicename"));
        return;
    }
    if (typeof req.params.devicetype === "undefined") {
        ParseLogger.log("warn", "No req.params.devicetype", { "req": req });
        res.error(errors["nodevicetype"], i18n.__("nodevicetype"));
        return;
    }
    if (typeof req.params.username === "undefined") {
        ParseLogger.log("warn", "No req.params.username", { "req": req });
        res.error(errors["nousername"], i18n.__("nousername"));
        return;
    }
    if (typeof req.params.address === "undefined") {
        ParseLogger.log("warn", "No req.params.address", { "req": req });
        res.error(errors["noBandAddr"], i18n.__("noBandAddr"));
        return;
    }
    if (typeof req.params.localtime === "undefined") {
        ParseLogger.log("warn", "No req.params.localtime", { "req": req });
        res.error(errors["noLocalTime"], i18n.__("noLocalTime"));
        return;
    }

    var username = req.params.username;
    var bandAddr = req.params.address;
    var installationId = req.installationId;
    var localTime = req.params.localtime;
    var devicename = req.params.devicename;
    var devicetype = req.params.devicetype;

    hasBindBandAuth(req.installationId).then(function (ret) {
            var configInfosQuery = new Parse.Query(ConfigInfos);
            configInfosQuery.equalTo("alias", "AppTimeThreshold");
            return configInfosQuery.first({ useMasterKey: true });
    }, function (err) {
        ParseLogger.log("error", err, { "req": req });
        res.error(errors[err], i18n.__(err));
        return reject(errMsg);
    }).then(function (configInfo) {
        var appTimeThreshold = 600;
        if (configInfo) {
            appTimeThreshold = parseInt(configInfo.get("value"));
        }
        var serverTimeStamp = new Date().getTime();
        var appLocalTime = parseInt(localTime);
        
        if (appLocalTime < (serverTimeStamp + appTimeThreshold * 10000)
            && appLocalTime > (serverTimeStamp - appTimeThreshold * 10000)
        ) {
            var bandUserQuery = new Parse.Query(DeviceInfos);
            bandUserQuery.equalTo("devicename", devicename);
            return bandUserQuery.first({ useMasterKey: true });
        } else {
            ParseLogger.log("error", "AppTimeThreshold is expired", { "req": req });
            res.error(errors["invalidTimestamp"], i18n.__("invalidTimestamp"));
            reject(errMsg);
            return;
        }
    }, function (err) {
        ParseLogger.log("error", err, { "req": req });
        res.error(errors[err], i18n.__(err));
        reject(errMsg);
        return;
    })
    .then(function (fBandUser) {
            if (!fBandUser) {
                //add device
                var devInfo = new DeviceInfos();
                devInfo.set("username", username);
                devInfo.set("bandAddr", bandAddr);
                devInfo.set("installationId", installationId);
                devInfo.set("devicename", devicename);
                devInfo.set("devicetype", devicetype);
                devInfo.set("active", 1);
                return devInfo.save(null, { useMasterKey: true })
            } else {
                //active = 1
                let state = fBandUser.get('active');
                fBandUser.set('active', 1);
                return fBandUser.save(null, { useMasterKey: true });
                
            }
        }, function (err) {
            // res.error(errors["internalError"], i18n.__("internalError"));
            // reject(err.message);
            ParseLogger.log("error", err, { "req": req });
            return Parse.Promise.reject(err);
        })
        .then(function(deviceInfo){
            //
            var ret = {};
            ret.username = deviceInfo.get('username');
            ret.devicename = deviceInfo.get('devicename');
            res.success(ret);
        },
        function(err){
            ParseLogger.log("warn", "save device info failed", { "req": req });
            res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
            return;
        }
    )
};

/***UnBand Device */
exports.unbindDevice = function (req, res) {
    commonFunc.setI18n(req, i18n);

    if (typeof req.params === "undefined") {
        ParseLogger.log("warn", "No req.params", { "req": req });
        return res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        ;
    }
    if (typeof req.installationId === "undefined" || !req.installationId) {
        ParseLogger.log("warn", "No installationid provided", { "req": req });
        return res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
    }
    if (typeof req.params.devicename === "undefined") {
        ParseLogger.log("warn", "No req.params.devicename", { "req": req });
        return res.error(errors["nodevicename"], i18n.__("nodevicename"));
    }
    if (typeof req.params.username === "undefined") {
        ParseLogger.log("warn", "No req.params.username", { "req": req });
        return res.error(errors["nousername"], i18n.__("nousername"));
    }

    var username = req.params.username;
    var devicename = req.params.devicename;

    var bandUserQuery = new Parse.Query(DeviceInfos);
    bandUserQuery.equalTo("devicename", devicename);
    bandUserQuery.first({ useMasterKey: true }).then(function(deviceInfo){
        if(deviceInfo){
            deviceInfo.set('active', 0);
            return deviceInfo.save(null, { useMasterKey: true })
        } else {
            ParseLogger.log("error", "Cannot find device", { "req": req });
            res.error(errors["noDeviceFound"], i18n.__("noDeviceFound"));
            return Parse.Promise.reject(errMsg);
        }
    }, function (err) {
        ParseLogger.log("error", err, { "req": req });
        res.error(errors[err], i18n.__(err));
        return Parse.Promise.reject(errMsg);
    })
    .then(function (deviceInfo) {
            if (!deviceInfo) {
                ParseLogger.log("warn", "device not exists", { "req": req });
                res.error(errors["noDeviceFound"], i18n.__("noDeviceFound"));
                return Parse.Promise.reject('noDeviceFound');
                } 
            else {
                var ret = {};
                ret.username = deviceInfo.get('username');
                ret.devicename = deviceInfo.get('devicename');
                return res.success(ret);
            }
        }, function (err) {
            res.error(errors["internalError"], i18n.__("internalError"));
            ParseLogger.log("error", err.message, { "req": req });
            return Parse.Promise.reject(err);
        });
};


exports.updateDevSettings = function (req, res) {
    commonFunc.setI18n(req, i18n);
    var devicename = req.params.devicename;
    var settings = req.params.settings;

    if (!devicename || !settings) {
        ParseLogger.log("warn", "Not provide the devicename or the settings", {"req": req});
        return res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            return res.error(errors["invalidSession"], i18n.__("invalidSession"));
        } else {
            Parse.User.enableUnsafeCurrentUser();
            var band;
            var query = new Parse.Query(DeviceInfos);
            query.equalTo('devicename', devicename);
            return query.first({
                useMasterKey: true
            }).then(function (device) {
                // If not, create a new user.
                if (!device) {
                    ParseLogger.log("error", "Cannot find the device", {"req": req});
                    return res.error(errors["noDeviceFound"], i18n.__("noDeviceFound"));
                }

                var deviceSetting;
                if (device.get('settings')) {
                    deviceSetting = device.get('settings');
                    return Parse.Promise.as(device);
                } else {
                    deviceSetting = new deviceSettings();
                    device.set('settings', deviceSetting);
                    return device.save(null, {useMasterKey: true});
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                return res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (device) {
                    
                    if (device.get('settings'))
                    {
                        let deviceSetting = device.get('settings');
                        _.forEach(settings, function (value, key) {
                            deviceSetting.set(key, value);
                        });
                        return deviceSetting.save(null, {useMasterKey: true});
                } else {
                    ParseLogger.log("warn", "No device setting found", {"req": req});
                    return res.error(errors["noDeviceSetting"], i18n.__("noDeviceSetting"));
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                return res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (deviceSetting) {
                return res.success({"devicename": devicename});
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                return res.error(errors["internalError"], i18n.__("internalError"));
            });
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        return res.error(errors[err], i18n.__(err));
    });

};


exports.getDevSettings = function (req, res) {
    commonFunc.setI18n(req, i18n);
    var devicename = req.params.devicename;
    if (!devicename) {
        ParseLogger.log("warn", "Not provide the devicename", {"req": req});
        return res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            return res.error(errors["invalidSession"], i18n.__("invalidSession"));
        } else {
            Parse.User.enableUnsafeCurrentUser();
            var query = new Parse.Query(DeviceInfos);
            query.equalTo('devicename', devicename);
            query.first().then(function (device) {
                // If not, create a new user.
                if (!device) {
                    ParseLogger.log("warn", "Cannot find the band", {"req": req});
                    return res.error(errors["noDeviceFound"], i18n.__("noDeviceFound"));
                }
                if (device.get('settings')) {
                    var settings = device.get('settings');
                    return settings.fetch();
                } else {
                    return Parse.Promise.as();
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                return res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (settings) {
                if (!settings) {
                    return res.success({
                        name: devicename,
                        settings: {}
                    });
                } else {
                    return res.success({
                        name: devicename,
                        settings: settings.toJSON()
                    });
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                return res.error(errors["internalError"], i18n.__("internalError"));
            });
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        return res.error(errors[err], i18n.__(err));
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
                return reject("internalError");
            }
        ).then(function (cnt) {
            if (cnt >= dailyMax) {
                return reject("bindFrequent");
            }
            var bindLogQuery = new Parse.Query(BindLogs);
            bindLogQuery.equalTo("installationId", installationId);
            bindLogQuery.greaterThan("createdAt", preOneHour);
            return bindLogQuery.count({useMasterKey: true});
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            return reject("internalError");
        }).then(function (cnt) {
            if (cnt >= hourMax) {
                return reject("bindFrequent");
            } else {
                return resolve("ok");
            }

        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            return reject("internalError");
        });
    });
    return promise;
}
