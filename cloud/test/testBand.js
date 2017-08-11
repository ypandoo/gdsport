/**
 * Created by yuhailong on 10/04/2017.
 */

var assert = require("assert");
var chai = require("chai");
var should = chai.should;
var assert = chai.assert;
var expect = chai.expect;
var httpClientEngine = require("./tools/httpClientEngine");
httpClientEngine.init("localhost", 20375);
var batchTool = require("./tools/batchTool");
var macUtil = require("../tools/macUtil");


var sessionToken = "";
var salt = "";
describe("Test for cibBand", function () {

    describe("bindBand", function () {
        var funcName = "bindBand";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "address": "F1:7B:6F:67:5F:AE",
                "pushid": "18071adc03033405c81",
                "phonenumber": "13810616786",
                "bandname": "UPWEAR6FA64C",
                "code": "8929",
                "locale": "zh",
                "height": 205,
                "sex": "0",
                "localtime": new Date().getTime().toString()
            });
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    var error = new Error();
                    if (!jsonResp.hasOwnProperty("result")) {
                        error.message = "[Cannot get the 'result' attribute from the resp]:\n" + respData;
                        done(error);
                        return;
                    }
                    if (!jsonResp.result.hasOwnProperty("sessionToken")) {
                        error.message = "[Cannot get the 'sessionToken' attribute from the resp.result]:\n" + respData;
                        done(error);
                        return;
                    }
                    if (!jsonResp.result.hasOwnProperty("username")) {
                        error.message = "[Cannot get the 'username' attribute from the resp]:\n" + respData;
                        done(error);
                        return;
                    }
                    if (!jsonResp.result.hasOwnProperty("salt")) {
                        error.message = "[Cannot get the 'salt' attribute from the resp]:\n" + respData;
                        done(error);
                        return;
                    }
                    sessionToken = jsonResp.result.sessionToken;
                    salt = jsonResp.result.salt;
                    done();

                });
        });
    });
    describe("updateBandSettings", function () {
        var funcName = "updateBandSettings";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C",
                "settings": {
                    "alarmrepeatdays": [
                        {"day0": true},
                        {"day1": false},
                        {"day2": false},
                        {"day3": false},
                        {"day4": false},
                        {"day5": false},
                        {"day6": false}
                    ],
                    "alarmstarthour": "0",
                    "alarmstartminute": "12",
                    "bandalarmopen": "false",
                    "targetstep": "10000",
                    "longseatalarmopen": "false",
                    "longseatalarminterval": "30",
                    "incomingcallalarm": "false",
                    "incomingsmsalarm": "true",
                    "longseatalarmendhour": "24",
                    "longseatalarmstarthour": "0"
                }
            });
            var headerOption = {
                "X-Parse-Session-Token": sessionToken
            };
            batchTool.setHeaders(headerOption);
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("result")) {
                        var error = new Error();
                        error.message = "[Cannot get the 'result' attribute from the response]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                    return;
                });
        });
    });
    describe("getBandSettings", function () {
        var funcName = "getBandSettings";
        it("check resp   [correct req]", function (done) {
            batchTool.initHeaders();
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C"
            });
            var headerOption = {
                "X-Parse-Session-Token": sessionToken
            };
            batchTool.setHeaders(headerOption);
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var error = new Error();
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                        error.message = "[Failed in the result]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    });
    describe("updateUserProfile", function () {
        var funcName = "updateUserProfile";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "phonenumber": "13810616786",
                "bandname": "UPWEAR6FA64C",
                "height": 183,
                "weight": 120,
                "sex": 1,
                "birthday": "1981-01-01",
                "realname": "hhehehe",
                "smscode": "2503",
                "cardnumber": "3363"
            });
            batchTool.initHeaders();
            var sHeaders = {
                "X-Parse-Session-Token": sessionToken
            };
            batchTool.setHeaders(sHeaders);
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Resp Data error]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    });
    describe("getUserProfile", function () {
        var funcName = "getUserProfile";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "phonenumber": "13810616786",
                "bandname": "UPWEAR6FA64C"
            });
            batchTool.initHeaders();
            var sHeaders = {
                "X-Parse-Session-Token": sessionToken
            };
            batchTool.setHeaders(sHeaders);
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Resp Data error]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    });
});

describe("Test for cibPointExchange", function () {
    describe("bindSportScore", function () {
        var funcName = "bindSportScore";
        it("check resp    [correct req]", function (done) {
            var reqData = JSON.stringify({
                "phonenumber": "13810616786",
                "smscode": "8929",
                "cardnumber": "1234"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
    describe("getSportScore", function () {
        var funcName = "getSportScore";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
    describe("getSportScoreRecord", function () {
        var funcName = "getSportScoreRecord";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
});

describe("Test for cibSleep", function () {
    describe("uploadSleepData", function () {
        var funcName = "uploadSleepData";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "locale": "zh",
                "bandname": "UPWEAR6FA64C",
                "phonenumber": "13810616786",
                "smscode": "2503",
                "cardnumber": "3363",
                "alias": [],
                "data": {
                    "getUpPoint": "1679067920000",
                    "gotoSleepPoint": "1469029620000",
                    "lightSleepTime": "19600000",
                    "deepSleepTime": "8600000",
                    "wakeupTime": "0"
                }
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
    describe("getAlgSleepData", function () {
        var funcName = "getAlgSleepData";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C",
                "startdate": "1491917550",
                "enddate": "1491977550"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
});

describe("Test for cibSport", function () {
    describe("uploadSportDataWithMAC", function () {
        var funcName = "uploadSportDataWithMAC";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "locale": "zh",
                "bandname": "UPWEAR675FAE",
                "phonenumber": "13810616786",
                "smscode": "2503",
                "cardnumber": "3363",
                "alias": [],
                "uptime": "1491441618570",
                "data": [{
                    "time": "1491441318570",
                    "step": "1234",
                    "distance": "25",
                    "heat": "4321"
                },
                    {
                        "time": "1491441218570",
                        "step": "4321",
                        "distance": "52",
                        "heat": "1221"
                    },
                    {
                        "time": "1491441518570",
                        "step": "22",
                        "distance": "97",
                        "heat": "31"
                    }],
                "mac": "08B286F5EFD30A37904AF28366263F6E5EAC6F5823B120B18192D439657B8E2A"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
    describe("getSportDataOfDay", function () {
        var funcName = "getSportDataOfDay";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C",
                "startdate": "1491917550",
                "enddate": "1491977550"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
    describe("getSportDataOfHour", function () {
        var funcName = "getSportDataOfHour";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C",
                "date": "1491917550"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        });
    });
    describe("getSportRating", function () {
        var funcName = "getSportRating";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({
                "bandname": "UPWEAR6FA64C"
            });
            batchTool.goodRespWithSession(funcName, reqData, sessionToken, httpClientEngine, done);
        })
    });
});

describe("Testt for cibBand", function () {
    describe("unbindBand", function () {
        var funcName = "unbindBand";
        it("check resp   [correct req]", function (done) {
            var reqData = JSON.stringify({});
            batchTool.initHeaders();
            var sHeaders = {
                "X-Parse-Session-Token": sessionToken
            };
            batchTool.setHeaders(sHeaders);
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Resp Data error]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    });
});