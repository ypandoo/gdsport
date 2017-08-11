/**
 * Created by yuhailong on 07/04/2017.
 */

var assert = require("assert");
var chai = require("chai");
var should = chai.should;
var assert = chai.assert;
var expect = chai.expect;
var httpClientEngine = require("./tools/httpClientEngine");
httpClientEngine.init("localhost", 20375);
var batchTool = require("./tools/batchTool");



/*
describe("Array", function () {
    describe("#indexOf(1)", function () {
        it("It should be -1", function () {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
        it("Test error", function () {
            [1, 2, 3].indexOf(5).should.equal(2);
        });
        it("TestGetConfig", function (done) {
            var headers = {
                "X-Parse-Installation-Id": "034373d0-5845-4952-a038-618474d6643e",
                "X-Parse-Application-Id": "appworld-cibxdl",
                "X-Parse-Client-Key": "XXXXXX",
                "X-Parse-App-Build-Version": "5",
                "content-type": "application/json"
            };
            var reqData = JSON.stringify({
                "alias": [
                    "SmsExpiration",
                    "PhoneNoHidden",
                    "ClearSportData"
                ]
            });
            httpClientEngine.send("/parse/functions/getConfig", "POST", headers, reqData, function (err, data) {
                if (err) {
                    done(err);
                    return;
                } else {
                    var error = new Error();
                    var jsonResp = JSON.parse(data);
                    if (jsonResp.hasOwnProperty("result")) {
                        if (!jsonResp.result.hasOwnProperty("ClearSportData")) {
                            error.message = "Cannot get the property 'ClearSportData' from the 'result'";
                            done(error);
                            return;
                        }
                        if (!jsonResp.result.hasOwnProperty("SmsExpiration")) {
                            error.message = "Cannot get the property 'SmsExpiration' from the 'result'";
                            done(error);
                            return;
                        }
                        if (!jsonResp.result.hasOwnProperty("PhoneNoHidden")) {
                            error.message = "Cannnot get the property 'PhoneNoHidden' from the 'result'";
                            done(error);
                            return;
                        }
                        if (!jsonResp.result.hasOwnProperty("LALALA")) {
                            error.message = "Cannnot get the property 'LALALA' from the 'result'";
                            done(error);
                            return;
                        }
                        done();
                        return;
                    } else {
                        error.message = "Cannot get the property of 'result'";
                        done(error);
                        return;
                    }

                }
            });
        });
    });
});
   */