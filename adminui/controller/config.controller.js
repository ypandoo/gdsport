var express = require("express");
var router = express.Router();
var ConfigModel = require("../model/config.model");
var ConfigInfos = Parse.Object.extend("configinfos");


router.get("/", function (req, res) {
    res.render("config/index");
});

router.get("/index/:url", function (req, res) {
    var destUrl = "config/" + req.params.url;
    console.log("[/config/index/url] " + new Date() + "requrl:" + destUrl);
    res.render(destUrl);
});

router.post("/getOne", function (req, res) {
    var alias = req.body.alias;
    console.log("[config/getOne]" + new Date() + " alias:" + alias);

    Parse.Cloud.useMasterKey();
    var configInfosQuery = new Parse.Query(ConfigInfos);
    configInfosQuery.equalTo('alias', alias);
    configInfosQuery.first({useMasterKey: true})
            .then(function (c) {
                if (!c) {
                    res.status(200).jsonp({"code": "-3", "msg": "cannot find the item"});
                    return;
                }
                var ret = {};
                ret.value = c.get('value');
                res.status(200).jsonp({"code": "0", "data": ret});
            }, function (err) {
                res.status(200).jsonp({"code": "-2", "msg": err});
                return;
            });


    /*
     ConfigModel.find({"alias": alias}, function (err, docs) {
     if (err) {
     res.status(200).jsonp({"code": "-2", "msg": err});
     return;
     }
     if (docs.length === 0) {
     res.status(200).jsonp({"code": "-3", "msg": "cannot find the item"});
     return;
     }
     var ret = {};
     ret.value = docs[0].value;
     res.status(200).jsonp({"code": "0", "data": ret});
     return;
     });
     */
});

router.post("/add", function (req, res) {
    var name = req.body.name;
    var value = req.body.value;
    var alias = req.body.alias;
    var configInfos = new ConfigInfos();
    configInfos.set('name', name);
    configInfos.set('value', value);
    configInfos.set('alias', alias);
    configInfos.save().then(function (user) {
        res.status(200).jsonp({"code": "0", "msg": "ok"});
    });
    /*    var configModel = new ConfigModel({
     name: name,
     value: value,
     alias: alias
     });
     configModel.save();
     res.status(200).jsonp({"code": "0", "msg": "ok"});
     */
});

router.post("/update", function (req, res) {
    var name = req.body.name;
    var value = req.body.value;
    var alias = req.body.alias;
    console.log("[config/update]" + new Date() + " reqData:" + JSON.stringify(req.body));
    var configInfosQuery = new Parse.Query(ConfigInfos);
    configInfosQuery.equalTo('alias', alias);
    configInfosQuery.first({useMasterKey: true})
            .then(function (c) {
                if (!c) {
                    res.status(200).jsonp({"code": "-2", "msg": "There is no more config info"});
                }
                c.set('name', name);
                c.set('value', value);
                return c.save();
            }).then(function (c) {
        if (!c) {
            res.status(200).jsonp({"code": "-2", "msg": "update failed"});
            return;
        }
        res.status(200).jsonp({"code": "0", "msg": "ok"});
    });
    /*
     var condition = {alias: alias};
     var update = {name: name, value: value};
     ConfigModel.update(condition, update, function (err) {
     if (err) {
     console.log("[config/update]" + new Date() + " Error" + err);
     }
     res.status(200).jsonp({"code": "0", "msg": "ok"});
     });
     */
});

module.exports = router;