/**
 * Created by yuhailong on 05/04/2017.
 */
var crypto = require("crypto");
var ParseLogger = require("../../gd-spec/logger").logger;
var MacTool = {
    /**
     * Get one 16 bytes length random key.
     */
    getRandomKey: function () {
        return crypto.randomBytes(16).toString("hex");
    },

    /**
     * Get the salt key for the bindband response.
     * @param randomKey the generated random key.
     * @param sessionToken the session token from Parse server.
     * @returns {null} the hex string or null for issue occurred.
     */
    getBindKey: function (randomKey, sessionToken) {
        if (sessionToken.indexOf(":") === -1) {
            return null;
        }
        var stArr = sessionToken.split(":");
        if (stArr.length !== 2) {
            return null;
        }
        var sessionKey = stArr[1];
        var iv = "30303030303030303030303030303030";
        var cipher = crypto.createCipheriv("aes-128-cbc", new Buffer(sessionKey, "hex"), new Buffer(iv, "hex"));
        var key = cipher.update(randomKey, "hex", "hex");
        key += cipher.final("hex");
        return key;
    },

    /**
     *
     * @param resp the response json from the uploadSportData.
     * @param sessionKey the session key of the band user session.
     * @returns {boolean} true for the passed and false for any issue.
     */
    validMac: function (resp, sessionKey) {
        if (!resp.hasOwnProperty("bandname")
            || !resp.hasOwnProperty("data")
            || !resp.hasOwnProperty("uptime")
            || !resp.hasOwnProperty("mac")) {
            return false;
        }
        var uptime = resp.uptime;
        if (resp.data.length < 1) {
            return false;
        }
        var sortData = resp.data;
        sortData.sort(function (a, b) {
            var time1 = parseInt(a.time);
            var time2 = parseInt(b.time);
            return time1 > time2 ? 1 : -1;
        });
        var input = resp.bandname;
        for (var i = 0; i < sortData.length; i++) {
            var item = sortData[i];
            input += item.time;
            input += item.step;
            input += item.heat;
            input += item.distance;
        }
        var iv = "31313131313131313131313131313131";
        var cipher = crypto.createCipheriv("aes-128-cbc", new Buffer(sessionKey, "hex"), new Buffer(iv, "hex"));
        var macKey = cipher.update(new Buffer(uptime.toString(), "utf8"), "hex");
        macKey += cipher.final("hex");

        try {
            var macHandler = crypto.createHmac("sha256", new Buffer(macKey, "hex"));
            macHandler.update(new Buffer(input, "utf8"));
            var mac = macHandler.digest("hex");
            if (mac === resp.mac.toLowerCase()) {
                return true;
            } else {
                ParseLogger.log("error", "Failed to valid the MAC", {
                    "macKey": macKey,
                    "input": input,
                    "remoteMac": resp.mac.toLowerCase(),
                    "localMac": mac
                });
            }
            return false;
        } catch (e) {
            console.log(e.message);
        }
    }
};

module.exports = MacTool;