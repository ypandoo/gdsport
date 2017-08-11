var fileTools = require("./tools/Files");

var initRebootCnt = function (fileName, fn) {
    var now = new Date();
    var time = "" + (now.getFullYear() + "").slice(-2)
        + ("0" + (now.getMonth() + 1)).slice(-2)
        + ("0" + now.getDate()).slice(-2);
    var cnt = 0;
    fileTools.readFileToJson(fileName).then(function (jsonData) {
        if (jsonData !== null && jsonData.date !== null && jsonData.cnt !== null) {
            if (time === jsonData.date) {
                cnt = jsonData.cnt;
            } else {
                cnt = 1;
            }
        } else {
            cnt = 1;
        }
        fn(cnt);
        var newJsonData = {};
        newJsonData.date = time;
        cnt++;
        newJsonData.cnt = cnt;
        fileTools.writeJsonToFile(fileName, newJsonData);
    }, function (err) {
        var newJsonData = {};
        newJsonData.date = time;
        cnt++;
        newJsonData.cnt = cnt;
        fileTools.writeJsonToFile(fileName, newJsonData).then(function (data) {
            console.log("ok");
        }, function (err) {
            console.log(err);
        });

    })
}

module.exports = {
    initRebootCnt: initRebootCnt
};