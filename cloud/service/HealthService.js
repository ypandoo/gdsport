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
//var MacTool = require("../tools/macUtil");

var MAX_RATING = 100;
var RawSportData = Parse.Object.extend("RawSportData");
var SportDataOfDay = Parse.Object.extend("SportDataOfDay");
var SportDataOfHour = Parse.Object.extend("SportDataOfHour");
var RawSleepData = Parse.Object.extend("RawSleepData");
var DeviceInfos = Parse.Object.extend("deviceinfos");
const ParseLogger = require('../../parse-server').logger;

exports.uploadHealthData = function (req, res) {
    commonFunc.setI18n(req, i18n);
    var devicename = req.params.devicename;
    var sportdata = req.params.sportdata;
    var sleepdata = req.params.sleepdata;
    var uptime = req.params.uploadtime;

    // var mac = req.params.mac;
    if (!devicename || !uptime || !sportdata) {
        ParseLogger.log("warn", "No devicename ,times, sportdata set in the param", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log ", {"req": req});
            res.error(errors["invalidSession"], i18n.__("invalidSession"));
            Parse.Promise.reject("");
            return;
        } else {
            var deviceQuery = new Parse.Query(DeviceInfos);
            deviceQuery.equalTo("devicename", devicename);
            return deviceQuery.first();
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        return reject("");
    }).then(function (deviceInfo) {
        if(!deviceInfo)
        {
            ParseLogger.log("error", err, { "req": req });
            res.error(errors[err], i18n.__('DeviceNotFound'));
            return reject("");
        }

        //Sport data
        var count = 0;
        var index = 0;
        var sports = new Array();
        _.forEach(sportdata, function (data) {
            var rawSportData = new RawSportData();
            rawSportData.set("time", new Date(parseInt(data.time) * 1000));
            rawSportData.set("step", parseInt(data.step));
            rawSportData.set("heat", parseInt(data.heat));
            rawSportData.set("distance", parseInt(data.distance));
            rawSportData.set("device", deviceInfo);
            sports.push(rawSportData);
        });
        count = sports.length;
        return commonFunc.promiseWhile(
                function () {
                    return index < count;
                },
                function () {
                    return insertSportData(index, sports[index], deviceInfo, req)
                        .then(function (obj) {
                                index++;
                                return Parse.Promise.as(index);
                            },
                            function (err) {
                                index++;
                                return Parse.Promise.as(index);
                                //res.error(err);
                            });
                }).then(function () {
                //deal with sleep data
                if(!sleepdata){
                    return res.success({ devicename: devicename });
                }else
                {
                    return updateSleepData(sleepdata, deviceInfo).then(function(savedSleepData){
                        if(savedSleepData)
                        {
                            return res.success({ devicename: devicename});
                        }else{
                            ParseLogger.log("error", err, { "req": req });
                            return res.error(errors["internalError"], i18n.__("internalError"));
                        }
                    });
                }
                
            });

        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
        });
};

function updateSleepData(sleepdata, deviceinfo){
    Parse.User.enableUnsafeCurrentUser();

    var getUpPoint = new Date(parseInt(sleepdata.getUpPoint));
    var dayOfData = _.clone(getUpPoint);
    dayOfData.setMinutes(0);
    dayOfData.setHours(0);
    dayOfData.setSeconds(0);
    dayOfData.setMilliseconds(0);

    var querySleepData = new Parse.Query(RawSleepData);
    querySleepData.equalTo('device', deviceinfo);
    querySleepData.equalTo('day', dayOfData);
    return querySleepData.first()
    .then(function (singleSleepData) {
        if (singleSleepData) {
            return singleSleepData;
        }

        var rawSleepData = new RawSleepData();
        rawSleepData.set("day", dayOfData);
        rawSleepData.set("gotoSleepPoint", sleepdata.gotoSleepPoint);
        rawSleepData.set("getUpPoint", sleepdata.getUpPoint);
        rawSleepData.set("lightSleepTime", sleepdata.lightSleepTime);
        rawSleepData.set("deepSleepTime", sleepdata.deepSleepTime);
        rawSleepData.set("wakeupTime", sleepdata.wakeupTime);
        rawSleepData.set("device", deviceinfo);
        return rawSleepData.save();

    }, function (err) {
        return "internalError";
    });
}

exports.getHealthData = function (req, res) {
    commonFunc.setI18n(req, i18n);
    var bandName = req.params.bandname;
    var startDate = req.params.startdate;
    var endDate = req.params.enddate;
    var band;
    if (!bandName || !startDate || !endDate) {
        ParseLogger.log("warn", "Not provide the bandName or start Date or end date", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
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
                    ParseLogger.log("warn", "Cannot find the bind", {"req": req});
                    return res.error(errors["noBandFound"], i18n.__("noBandFound"));
                }
                band = b;
                var querySportDataOfDay = new Parse.Query(SportDataOfDay);
                querySportDataOfDay.equalTo('band', b);
                querySportDataOfDay.greaterThanOrEqualTo('day', new Date(startDate * 1000));
                querySportDataOfDay.lessThanOrEqualTo('day', new Date(endDate * 1000));
                return querySportDataOfDay.find({
                    useMasterKey: true
                });
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (list) {
                if (!list) {
                    return res.success([]);
                }
                var ret = new Array();
                _.forEach(list, function (sportDataOfDay) {
                    ret.push({
                        time: Math.round(sportDataOfDay.get("day").getTime() / 1000),
                        step: sportDataOfDay.get("step") ? sportDataOfDay.get("step") : 0,
                        heat: sportDataOfDay.get("heat") ? sportDataOfDay.get("heat") : 0,
                        distance: sportDataOfDay.get("distance") ? (sportDataOfDay.get("distance") / 1000).toFixed(2) : 0,
                    });

                });
                res.success(ret);

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

let getSportDataOfHour =  function (req, res) {
    commonFunc.setI18n(req, i18n);
    var bandName = req.params.bandname;
    var date = req.params.date;
    var band;
    if (!bandName || !date) {
        ParseLogger.log("warn", "Not provide the bandName or date", {"req": req});
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
                    ParseLogger.log("warn", "Failed to find the band ", {"req": req});
                    return res.error(errors["noBandFound"], i18n.__("noBandFound"));
                }
                band = b;
                var querySportDataOfHour = new Parse.Query(SportDataOfHour);
                querySportDataOfHour.equalTo('band', b);
                querySportDataOfHour.equalTo('day', new Date(date * 1000));
                return querySportDataOfHour.first({
                    useMasterKey: true
                });
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (sportDataOfHour) {
                if (!sportDataOfHour) {
                    return res.success([]);
                }
                var ret = new Array();
                for (var i = 0; i < 24; i++) {
                    if (sportDataOfHour.has("step" + i)) {
                        ret.push(sportDataOfHour.get("step" + i));
                    } else {
                        ret.push(0);
                    }
                }

                res.success(ret);

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




var insertSportData = function (index, sportData, band, req) {
    var querySportData = new Parse.Query(RawSportData);
    var timeOfData = sportData.get("time");
    var dayOfData = _.clone(timeOfData);
    dayOfData.setMinutes(0);
    dayOfData.setHours(0);
    dayOfData.setSeconds(0);
    dayOfData.setMilliseconds(0);
    querySportData.equalTo('time', sportData.get("time"));
    querySportData.equalTo('band', band);
    return querySportData.first().then(function (sportDataNew) {
        if (sportDataNew) {
            return Parse.Promise.error(0);
        }
        return sportData.save(null, {
            useMasterKey: true
        });
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
    }).then(function (obj) {
        var querySportDataOfDay = new Parse.Query(SportDataOfDay);
        querySportDataOfDay.equalTo('day', dayOfData);
        querySportDataOfDay.equalTo('band', band);
        return querySportDataOfDay.first();
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
    }).then(function (sportDataOfDayNew) {
        if (sportDataOfDayNew) {

            sportDataOfDayNew.increment("heat", sportData.get("heat"));
            sportDataOfDayNew.increment("step", sportData.get("step"));
            sportDataOfDayNew.increment("distance", sportData.get("distance"));
            return sportDataOfDayNew.save(null, {
                useMasterKey: true
            });

        }
        var sportDataOfDay = new SportDataOfDay();
        sportDataOfDay.set("day", dayOfData);
        sportDataOfDay.set("heat", sportData.get("heat"));
        sportDataOfDay.set("step", sportData.get("step"));
        sportDataOfDay.set("distance", sportData.get("distance"));
        sportDataOfDay.set("band", band);
        return sportDataOfDay.save(null, {
            useMasterKey: true
        });

    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
    }).then(function (obj) {
        var querySportDataOfHour = new Parse.Query(SportDataOfHour);
        querySportDataOfHour.equalTo('day', dayOfData);
        querySportDataOfHour.equalTo('band', band);
        return querySportDataOfHour.first();
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
    }).then(function (sportDataOfHourNew) {
        var hour = timeOfData.getHours();
        if (sportDataOfHourNew) {
            sportDataOfHourNew.increment("step" + hour, sportData.get("step"));
            //sportDataOfHourNew.increment("step", sportData.get("step"));
            //sportDataOfHourNew.increment("distance", sportData.get("distance"));
            return sportDataOfHourNew.save(null, {
                useMasterKey: true
            });

        }
        var sportDataOfHour = new SportDataOfHour();
        sportDataOfHour.set("day", dayOfData);
        sportDataOfHour.set("step" + hour, sportData.get("step"));
        sportDataOfHour.set("band", band);
        return sportDataOfHour.save(null, {
            useMasterKey: true
        });
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
    });
};