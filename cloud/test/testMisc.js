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


describe("Test for cibMisc", function () {

    describe("getConfig", function () {
        var funcName = "getConfig";
        it("req param check   [no alias]", function (done) {
            batchTool.initHeaders();
            var reqData = JSON.stringify({});
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var respJson = JSON.parse(respData);
                    if (!respJson.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Do not have error attribute]:\n" + respData;
                        return;
                    }
                    done();
                })
        });
        it("resp param check   [all]", function (done) {
            var reqData = JSON.stringify({"alias": []});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var respJson = JSON.parse(respData);
                    if (!respJson.hasOwnProperty("result")) {
                        var error = new Error();
                        error.message = "[Cannot get the 'result' attribute:]\n" + respData;
                        return;
                    }
                    done();
                    return;
                });
        });
        it("resp param check   [specific]", function (done) {
            var reqData = JSON.stringify({
                "alias": [
                    "SmsExpiration",
                    "PhoneNoHidden",
                    "ClearSportData"
                ]
            });
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var respJson = JSON.parse(respData);
                    var error = new Error();
                    if (!respJson.hasOwnProperty("result")) {
                        error.message = "[Do not have the attribute result]:\n" + respData;
                        done(error);
                        return;
                    }
                    if (!respJson.result.hasOwnProperty("ClearSportData")) {
                        error.message = "[Cannot get the property 'ClearSportData' from the 'result']:\n" + respData;
                        done(error);
                        return;
                    }
                    if (!respJson.result.hasOwnProperty("SmsExpiration")) {
                        error.message = "[Cannot get the property 'SmsExpiration' from the 'result']:\n" + respData;
                        done(error);
                        return;
                    }
                    if (!respJson.result.hasOwnProperty("PhoneNoHidden")) {
                        error.message = "[Cannot get the property 'PhoneNoHidden' from the 'result']:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                    return;
                })
        });
    });
    describe("validSmsCode", function () {
        var funcName = "validSmsCode";
        it("req param check   [no phoneno]", function (done) {
            var reqData = JSON.stringify({});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Cannot get error attribute]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                    return;
                });
        });
        it("req param check   [no code]", function (done) {
            var reqData = JSON.stringify({"phoneno": "13810616786"});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("error")) {
                        done("[Cannot find out the error attribute from the resp]:\n" + respData);
                        return;
                    }
                    done();
                });
        });
        it("resp check   [wrong data]", function (done) {
            var reqData = JSON.stringify({"phoneno": "11111111111", "code": "1111"});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Cannot get the error attribute]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
        it("resp check   [correct data]", function (done) {
            var reqData = JSON.stringify({"phoneno": "13810616786", "code": "8929"});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Failed for SMS code validation]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    });
    describe("getNewestVersion", function () {
        var funcName = "getNewestVersion";
        it("resp check   [correct data]", function (done) {
            var reqData = JSON.stringify({});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Received error in the response]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    });
    describe("getActivity", function () {
        var funcName = "getActivity";
        it("resp check   [correct data]", function (done) {
            var reqData = JSON.stringify({"ids": ""});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[result has the error attribute]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    });
    describe("getBandGuide", function () {
        var funcName = "getBandGuide";
        it("resp check   [correct data]", function (done) {
            var reqData = JSON.stringify({});
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[Has error in the resp]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                });
        });
    })
});