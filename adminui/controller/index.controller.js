var express = require("express");
var router = express.Router();
var Features = require("../config/features");

isInArray = function (val, arr) {
    for (var key in arr) {
        if (arr[key] === val) {
            return true;
        }
    }
    return false;
}


router.get("/", function (req, res) {
    var renderOption = {};
    renderOption.username = "";
    renderOption.login = false;
    renderOption.featureTitles = "";

    if (typeof req.session.username !== "undefined") {
        renderOption.realname = req.session.realname;
        renderOption.login = true;
        var userFeatures = req.session.features;
        var titles = "";
        if (req.session.group === "admin") {
            for (var itemKey in Features) {
                titles += '<li><a href=\"#';
                titles += itemKey;
                titles += '\" class=\"indexHeadLink\">';
                titles += Features[itemKey];
                titles += '</a></li>';
            }
        } else {
            for (var itemKey in Features) {
                if (isInArray(itemKey, userFeatures)) {
                    titles += '<li><a href=\"#';
                    titles += itemKey;
                    titles += '\" class=\"indexHeadLink\">';
                    titles += Features[itemKey];
                    titles += '</a></li>';
                }
            }
        }
        renderOption.featureTitles = titles;
    }
    res.render("index", renderOption);
});

router.get("/index", function (req, res) {
    var renderOption = {};
    renderOption.username = "";
    renderOption.login = false;
    renderOption.featureTitles = "";

    if (typeof req.session.username !== "undefined") {
        renderOption.realname = req.session.realname;
        renderOption.login = true;
        var userFeatures = req.session.features;
        var titles = "";
        if (req.session.group === "admin") {
            for (var itemKey in Features) {
                titles += '<li><a href=\"#';
                titles += itemKey;
                titles += '\" class=\"indexHeadLink\">';
                titles += Features[itemKey];
                titles += '</a></li>';
            }
        } else {
            for (var itemKey in Features) {
                if (isInArray(itemKey, userFeatures)) {
                    titles += '<li><a href=\"#';
                    titles += itemKey;
                    titles += '\" class=\"indexHeadLink\">';
                    titles += Features[itemKey];
                    titles += '</a></li>';
                }
            }
        }
        renderOption.featureTitles = titles;
    }
    res.render("index", renderOption);
});

var aclMiddleWare = function (req, res, next) {
    var sessionFeatures = req.session.features;
    var sessionGroup = req.session.group;
    if (!sessionFeatures || !sessionGroup) {
        res.status(401).send("请不要进行非法访问");
    }
    if (sessionGroup === "admin") {
        next();
    } else {
        var baseUrl = req.baseUrl;
        var splitUrl = baseUrl.split("/");
        var lastKey = splitUrl.length - 1;
        var authFeature = splitUrl[lastKey];
        if (isInArray(authFeature, sessionFeatures)) {
            next();
        } else {
            res.status(401).send("您未被授权访问该项目，请联系管理员");
        }
    }
}
router.use("/config/", aclMiddleWare, require("./config.controller"));
router.use("/version/", aclMiddleWare, require("./version.controller"));
router.use("/push/", aclMiddleWare, require("./push.controller"));
router.use("/login/", require("./login.controller"));
router.use("/activity/", aclMiddleWare, require("./activity.controller"));
router.use("/factory/", aclMiddleWare, require("./factory.controller"));
router.use("/sms/", aclMiddleWare, require("./sms.controller"));
router.use("/guide/", aclMiddleWare, require("./guide.controller"));
router.use("/welcome/", require("./welcome.controller"));
router.use("/user/", aclMiddleWare, require("./user.controller"));
router.use("/personalinfo/", require("./personalinfo.controller"));


module.exports = router;