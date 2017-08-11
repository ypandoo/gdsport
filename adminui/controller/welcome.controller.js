/**
 * Created by yuhailong on 23/03/2017.
 */
var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
    res.render("welcome");
});

module.exports = router;