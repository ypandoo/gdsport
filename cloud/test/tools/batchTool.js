/**
 * Created by yuhailong on 10/04/2017.
 */
var BatchTool = {
    headers: {
        "X-Parse-Installation-Id": "f2c2e5c1-5da3-4441-8527-08dde1c58d49",
        "X-Parse-App-Display-Version": "1.0.0",
        "X-Parse-Client-Version": "a1.13.2-SNAPSHOT",
        "X-Parse-Client-Key": "XXXXXX",
        "X-Parse-Application-Id": "appworld-cibxdl",
        "Content-Type": "application/json"
    },
    pathPrefix: "/parse/functions/",
    initHeaders: function () {
        this.headers = {};
        this.headers = {
            "X-Parse-Installation-Id": "f2c2e5c1-5da3-4441-8527-08dde1c58d49",
            "X-Parse-App-Display-Version": "1.0.0",
            "X-Parse-Client-Version": "a1.13.2-SNAPSHOT",
            "X-Parse-Client-Key": "XXXXXX",
            "X-Parse-Application-Id": "appworld-cibxdl",
            "Content-Type": "application/json"
        };
    },
    setHeaders: function (headers) {
        this.initHeaders();
        if (headers.length < 1) {
            return;
        }
        for (var hKey in headers) {
            this.headers[hKey] = headers[hKey];
        }
    },
    getHeaders: function () {
        return this.headers;
    },
    getPath: function (funcName) {
        return this.pathPrefix + funcName;
    },
    goodRespWithSession: function (funcName, reqData, sessionToken, httpClientEngineInst, assertCallBack) {
        this.initHeaders();
        var sHeaders = {
            "X-Parse-Session-Token": sessionToken
        };
        this.setHeaders(sHeaders);
        var thisInst = this;
        httpClientEngineInst.send(thisInst.getPath(funcName), "POST", thisInst.getHeaders(),
            reqData, function (err, respData) {
                if (err) {
                    assertCallBack(err);
                    return;
                }
                var jsonResp = JSON.parse(respData);
                if (!jsonResp.hasOwnProperty("result") || jsonResp.hasOwnProperty("error")) {
                    var error = new Error();
                    error.message = "[error for the test result]:\n" + respData;
                    assertCallBack(error);
                    return;
                }
                assertCallBack();
            })
    }
};

module.exports = BatchTool;