var path = require("path");
var fs = require("fs");

var writeJsonToFile = function (fileName, jsonVal) {

    var destPath = path.join(fileName);
    var promise = new Promise(function (resolve, reject) {
        fs.open(destPath, "w+", function (err, fd) {
            if (!err) {
                fs.write(fd, JSON.stringify(jsonVal), function (err, written, theString) {
                    if (!err) {
                        fs.close(fd, function (err) {
                            if (!err) {
                                resolve();
                            } else {
                                reject(err);
                            }
                        });
                    } else {
                        reject(err);
                    }
                })
            } else {
                reject(err);
            }
        });
    });
    return promise;

};

var readFileToJson = function (fileName) {
    var destPath = path.join(fileName);
    var promise = new Promise(function (resolve, reject) {
        fs.readFile(destPath, "utf8", function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        })
    });
    return promise;
}

module.exports = {
    writeJsonToFile: writeJsonToFile,
    readFileToJson: readFileToJson
};