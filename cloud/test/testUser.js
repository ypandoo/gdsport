/**
 * Created by yuhailong on 11/04/2017.
 */

var assert = require("assert");
var chai = require("chai");
var should = chai.should;
var assert = chai.assert;
var expect = chai.expect;
var httpClientEngine = require("./tools/httpClientEngine");
httpClientEngine.init("localhost", 20375);
var batchTool = require("./tools/batchTool");

describe("Test for cibUser", function () {
    var sessionToken = "";
    describe("signup", function () {
        var funcName = "signup";
        it("check resp    [correct req]", function (done) {
            batchTool.initHeaders();
            var reqData = JSON.stringify({
                "phonenumber": "13810616786",
                "password": "testtest",
                "code": "8929"
            });
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                        var error = new Error();
                        error.message = "[The result is error]:\n" + respData;
                        done(error);
                        return;
                    }
                    done();
                    return;
                });
        });
    });
    describe("login", function () {
        var funcName = "login";
        it("check resp    [correct req]", function (done) {
            var reqData = JSON.stringify({
                "phonenumber": "13810616786",
                "password": "testtest"
            });
            batchTool.initHeaders();
            httpClientEngine.send(batchTool.getPath(funcName), "POST", batchTool.getHeaders(),
                reqData, function (err, respData) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var jsonResp = JSON.parse(respData);
                    var error = new Error();
                    if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                        error.message = "[The resp data is error]:\n" + respData;
                        done(error);
                        return;
                    }
                    if (!jsonResp.result.hasOwnProperty("sessionToken")) {
                        error.message = "[The resp data result not contain sessionToken]:\n" + respData;
                        done(error);
                        return;
                    }
                    sessionToken = jsonResp.result.sessionToken;
                    done();
                });
        });
    });
    describe("updatePushId", function () {
        var funcName = "updatePushId";
        it("check resp    [correct req]", function (done) {
            setTimeout(function () {
                var reqData = JSON.stringify({
                    "pushid": "thisisthetestpushid"
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
                        var error = new Error();
                        if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                            error.mesage = "[Resp is error]:\n" + respData;
                            done(error);
                            return;
                        }
                        done();
                    });
            }, 300);
        });
    });
    describe("logout", function () {
        var funcName = "logout";
        it("check resp    [correct req]", function (done) {
            setTimeout(function () {
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
                            error.message = "[Failed in the resp]:\n" + respData;
                            done(error);
                            return;
                        }
                        done();
                    });
            }, 300);
        });
    });
});