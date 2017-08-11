/**
 * Created by yuhailong on 08/04/2017.
 */
var http = require("http");

var HttpClientEngine = {
    hostName: null,
    port: null,
    init: function (hostName, port) {
        this.hostName = hostName;
        this.port = port;
    },
    send: function (path, method, headers, reqData, respCallback) {
        if (this.hostName === null || this.port === null) {
            var err = new Error();
            err.code = -1;
            err.message = "The host name or the port is null";
            respCallback(err);
            return;
        }
        var hostName = this.hostName;
        var port = this.port;
        var options = {
            hostname: hostName,
            port: port,
            path: path,
            method: method,
            headers: headers,
        };

        var req = http.request(options, (res) => {
            res.on("data", (chunk) => {
                var output = new Buffer(chunk, "hex").toString("utf8");
                //console.log();
                //console.log(output);
                respCallback(null, output);
            });
            res.on("end", (chunk) => {

            });
        });
        req.on("error", (e) => {
            respCallback(e);
        });
        req.write(reqData);
        req.end();
    }
};

module.exports = HttpClientEngine;