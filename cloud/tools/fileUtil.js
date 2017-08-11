var path = require("path");
var fs = require("fs");

var FileUtil = {
    writeTextToFile: function (dirName, fileName, strVal) {

        var destPath = path.join(dirName, fileName);
        var promise = new Promise(function (resolve, reject) {
            fs.open(destPath, "w+", function (err, fd) {
                if (!err) {
                    fs.write(fd, strVal, function (err, written, theString) {
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

    }
};

module.exports = FileUtil;
