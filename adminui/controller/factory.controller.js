var express = require("express");
var expressCsv = require("express-csv");
var router = express.Router();
var FactoryModel = require("../model/factory.model");
var csv = require("fast-csv");
var fs = require("fs");
var myMathUtil = require("../tools/mathUtil");
var request = require("request");
var FactoryInfos = Parse.Object.extend("PreloadBand");
var ConfigInfos = Parse.Object.extend("configinfos");

var factoryConfig = [];

router.get("/", function (req, res) {
    res.render("factory/index");
});

router.get("/index/:url", function (req, res) {
    var destUrl = "factory/" + req.params.url;
    console.log("[/factory/index/url] " + new Date() + "requrl:" + destUrl);
    res.render(destUrl);
});


/**
 * sendData is json format request
 * @param {string} param1
 * @param {callback function} param2
 */
router.post("/exportCsv", function (req, res) {
    var sendData = req.body.sendData;
    var from = sendData.from;
    var to = sendData.to;
    var condition = {};
    if (typeof from !== "undefined") {
        try {
            var fromTime = new Date(Date.parse(from));
            condition.createAt = {};
            condition.createAt.$gte = fromTime;
        } catch (e) {

        }
    }
    if (typeof to !== "undefined") {
        try {
            var toTime = new Date(Date.parse(to));
            if (typeof condition.createAt !== "undefined") {
                condition.createAt = {};
            }
            condition.createAt.$lte = toTime;
        } catch (e) {

        }
    }
    var selection = "bandNo,citizenID,citizenName,tender";
    var options = {
        sort: {
            createAt: 1
        }
    };
    FactoryModel.find(selection, condition, options, function (err, docs) {
        if (err) {
            res.status(200).jsonp({"code": "-2", "msg": err});
            return;
        }
        if (docs.length < 1) {
            res.status(200).jsonp({"code": "-3", "msg": "no more data"});
            return;
        }
        // tobecheck
        res.expressCsv(docs);
        return;
    });

});

router.post("/reloadConfig", function (req, res) {
    console.log("3ss");
    Parse.Cloud.useMasterKey();
    var configInfosQuery = new Parse.Query(ConfigInfos);
    configInfosQuery.equalTo("alias", "FactoryImport");
    configInfosQuery.first({useMasterKey: true}).then(function (c) {
        if (!c) {
            console.log("step1");
            res.status(200).jsonp({"code": "-3", "msg": "no more message"});
            return;
        }
        console.log(c.get("value"));
        try {
            factoryConfig = JSON.parse(c.get("value"));
        } catch (e) {
            console.log(e);
        }
        if (factoryConfig.length < 1) {
            res.status(200).jsonp({"code": "-3", "msg": "the count of item is zero"});
        }
        res.status(200).jsonp({"code": "0", "msg": "ok"});
        return;
    }, function (err) {
        res.status(200).jsonp({"code": "-2", "msg": err});
        retrun;
    });
});


router.post("/importCsv", function (req, res) {
    /*    var csvFile;
     if (!req.files) {
     res.send("No file uploaded");
     return;
     }
     csvFile = req.files.csvFile;
     var tmpFileName = './public/tmp/' + myMathUtil.getUniqNumber();
     console.log(tmpFileName);
     csvFile.mv(tmpFileName, function (err) {
     if (err) {
     res.status(500).send(err);
     return;
     } else {
     res.status(200).send("File uploaded");
     }
     });
     */
    Parse.Cloud.useMasterKey();
    var tmpFileName = '.' + req.mountPath + '/public/tmp/' + myMathUtil.getUniqNumber();
    var writeStream = fs.createWriteStream(tmpFileName);
    var sendData = req.body.sendData;
    var unescapedData = unescape(sendData);
    writeStream.write(unescapedData);
    writeStream.on("finish", function () {
        var readStream = fs.createReadStream(tmpFileName);
        var csvStream = csv()
            .on("data", function (data) {
                var factoryInfos = new FactoryInfos();
                if (factoryConfig.length > 0) {
                    for (var i = 0; i < factoryConfig.length; i++) {
                        factoryInfos.set(factoryConfig[i], data[i]);
                    }
                    factoryInfos.save({useMasterKey: true});
                }
                /*var newItem = {};
                 newItem.bandNo = data[0];
                 newItem.citizenID = data[1];
                 newItem.citizenName = escape(data[2]);
                 newItem.gender = data[3];
                 newItem.createAt = new Date(data[4]);
                 newItem.updateAt = new Date();
                 var fmInst = new FactoryModel(newItem);
                 fmInst.save();*/
            }).on("end", function () {
                //need to remove the temporary file
                res.status(200).jsonp({"code": "0", "msg": "no"});
            });
        readStream.pipe(csvStream);
    });
    writeStream.end();

});

router.get("/testCall", function (req, res) {
    res.render("factory/testCall");
});

router.post("/call", function (req, res) {
    var url = "http://localhost:9988/factory/resp";
    console.log("call start");
    console.log(req.body.name);
    var pipe = request.post(url, {form: req.body});
    pipe.on("end", function () {
        res.send(pipe.response);
        console.log("call finish");
    });
});

router.post("/resp", function (req, res) {
    console.log(req.body.name);
    setTimeout(function () {
        res.send(req.body.name);
    }, 4000);
});

module.exports = router;