var express = require("express");
var router = express.Router();
var AdminInfos = Parse.Object.extend("admininfos");
var PasswordTool = require("../tools/password");

router.get("/", function (req, res) {
    res.render("login");
});

router.post("/doLogin", function (req, res) {
    var name = req.body.name;
    var password = req.body.password;
    console.log(name + "|" + password);

    var adminU = null;
    var adminInfosQuery = new Parse.Query(AdminInfos);
    adminInfosQuery.equalTo("name", name);
    adminInfosQuery.equalTo("isAvail", true);
    adminInfosQuery.first({useMasterKey: true})
        .then(function (a) {
                if (!a) {
                    res.status(200).jsonp({
                        "code": "-2",
                        "msg": "no such user"
                    });
                    return;
                }
                req.session.username = a.get("name");
                req.session.realname = a.get("realName");
                req.session.features = a.get("features");
                req.session.group = a.get("group");
                adminU = a;
                var hashedPassword = a.get("password");
                return PasswordTool.verify(password, hashedPassword);
            }, function (err) {
                res.status(200).jsonp({
                    "code": "-2",
                    "msg": err
                });
                return;
            }
        ).then(function (isValid) {
        if (isValid) {

            adminU.lastTime = new Date();
            adminU.save();
            req.session.username = name;
            console.log(req.session);
            res.status(200).jsonp({
                "code": "0"
            });
            return;
        } else {
            res.status(200).jsonp({
                "code": "-2",
                "msg": "no such user"
            });
            return;
        }
    }, function (err) {
        res.status(200).jsonp({
            "code": "-2",
            "msg": "no such user"
        });
        return;
    });

    /*
     AdminModel.find({name: name, password: password}, function (err, docs) {
     if (err) {
     res.status(200).jsonp({
     "code": "-2",
     "msg": err
     });
     return;
     }
     if (docs.length === 0) {
     res.status(200).jsonp({
     "code": "-2",
     "msg": "No such user"
     });
     return;
     }
     docs[0].lastTime = new Date();
     docs[0].save();
     req.session.username = name;
     console.log(req.session);
     res.status(200).jsonp({
     "code": "0"
     });
     });
     */
});


router.get("/add", function (req, res) {
    Parse.Cloud.useMasterKey();
    PasswordTool.hash("user").then(function (hashedPassword) {
        var adminInfos = new AdminInfos();
        adminInfos.set("name", "user");
        adminInfos.set("password", hashedPassword);
        adminInfos.set("realName", "user");
        return adminInfos.save({useMasterKey: true});
    }, function () {
        res.status(200).send("No ok");
    }).then(function (a) {
        console.log("step1");
        res.status(200).send(a.get("name"));
        return;
    }, function (err) {
        console.log("step2");
        res.status(200).send(err.message);
        return;
    });
    /*
     var adminModel = new AdminModel({
     name: "user",
     password: "user",
     realName: "user",
     createTime: new Date(),
     lastTime: new Date()
     });
     adminModel.save();
     res.status(200).send(adminModel._id);
     */
});

router.post("/doLogout", function (req, res) {
    req.session.destroy(function () {
        res.status(200).jsonp({
            "code": "0"
        });
    });
});

module.exports = router;
