const express = require("express");
const router = express.Router();
const EventBus = require('vertx3-eventbus-client');
const PushService = require('../tools/j_push_service-proxy');
const MathUtil = require('../tools/mathUtil');
const PushModel = require('../model/push.model');
const PushInfos = Parse.Object.extend("pushinfos");
const cfg = require('../../config/index');
const PushSrvAddr = cfg.eventbus;

router.get("/", function(req, res) {
    res.render("push/index");
});


router.get("/index/:url", function(req, res) {
    var destUrl = "push/" + req.params.url;
    console.log("[/push/index/url] " + new Date() + "requrl:" + destUrl);
    res.render(destUrl);
});

router.get("/test1", function(req, res) {
    //var mathUtil = new MathUtil();
    var no = MathUtil.getUniqNumber();
    res.status(200).send(String(no));
});

router.get("/test", function(req, res) {
    //    var mathUtil = new MathUtil();
    //    var sendData = {};
    //    sendData.test = false;
    //    sendData.toAndroid = true;
    //    sendData.toIOS = true;
    //    sendData.alert = "";
    //    sendData.androidAlert = {};
    //    sendData.iosAlert = {};
    //    sendData.message = {};
    //    sendData.message.title = "Welcome to U";
    //    sendData.message.msg_content = "This is the first message from the CIB App";
    //    sendData.extraMessage = {};
    //    sendData.sendno = mathUtil.getRandom(1999999999, 1);
    //    sendData.timeToLive = 86400;
    //    sendData.apnsProduction = true;
    //    sendData.bigPushDuration = 0;
    //
    //
    //    var eb = new EventBus('http://localhost:8080/eventbus/');
    //    eb.onopen = function () {
    //        var processorService = new PushService(eb, "service.jpush");
    //        console.log(JSON.stringify(sendData));
    //        processorService.send2All(sendData.test, sendData.toAndroid,
    //                sendData.toIOS, sendData.alert, sendData.androidAlert, sendData.iosAlert,
    //                sendData.message, sendData.extraMessage, sendData.sendno, sendData.timeToLive,
    //                sendData.apnsProduction, sendData.bigPushDuration,
    //                function (err, resp) {
    //                    if (err) {
    //                        console.error(err);
    //                        eb.close();
    //                        res.status(200).send(err);
    //                        return;
    //                    }
    //
    //                    console.log(resp);
    //                    res.status(200).send(resp);
    //                    eb.close();
    //                });
    //    };

    //    var sendData = ["3013729267", "2283720688"];
    //
    //    var eb = new EventBus('http://localhost:8080/eventbus/');
    //    eb.onopen = function () {
    //        var processorService = new PushService(eb, "service.jpush");
    //        console.log(JSON.stringify(sendData));
    //        processorService.getReceiveds(sendData,
    //                function (err, resp) {
    //                    if (err) {
    //                        console.error(err);
    //                        eb.close();
    //                        res.status(200).send(err);
    //                        return;
    //                    }
    //
    //                    console.log(resp);
    //                    res.status(200).send(resp);
    //                    eb.close();
    //                });
    //    };


    //    var mathUtil = new MathUtil();
    //    var sendData = {};
    //    sendData.test = true;
    //    sendData.tags = [];
    //    sendData.tagsAnd = [];
    //    sendData.alias = [];
    //    sendData.registerIds = [];
    //    sendData.toAndroid = true;
    //    sendData.toIOS = true;
    //    sendData.alert = "";
    //    sendData.androidAlert = {};
    //    sendData.iosAlert = {};
    //    sendData.message = {};
    //    sendData.message.title = "Welcome to U";
    //    sendData.message.msg_content = "This is the first message from the CIB App";
    //    sendData.extraMessage = {};
    //    sendData.sendno = mathUtil.getRandom(1999999999, 1);
    //    sendData.timeToLive = 86400;
    //    sendData.apnsProduction = true;
    //    sendData.bigPushDuration = 0;
    //
    //
    //    var eb = new EventBus('http://localhost:8080/eventbus/');
    //    eb.onopen = function () {
    //        var processorService = new PushService(eb, "service.jpush");
    //        console.log(JSON.stringify(sendData));
    //        processorService.send2Range(sendData.test, sendData.toAndroid,
    //                sendData.toIOS, sendData.tags, sendData.tagsAnd, sendData.alias,
    //                sendData.registerIds, sendData.alert, sendData.androidAlert,
    //                sendData.iosAlert, sendData.message, sendData.extraMessage,
    //                sendData.sendno, sendData.timeToLive, sendData.apnsProduction,
    //                sendData.bigPushDuration, function (err, resp) {
    //                    if (err) {
    //                        console.error(err);
    //                        eb.close();
    //                        res.status(200).send(err);
    //                        return;
    //                    }
    //
    //                    console.log(resp);
    //                    res.status(200).send(resp);
    //                    eb.close();
    //                });
    //    };

    //    var eb = new EventBus('http://localhost:8080/eventbus/');
    //    eb.onopen = function () {
    //        var processorService = new PushService(eb, "service.jpush");
    //        processorService.getTags(
    //                function (err, resp) {
    //                    if (err) {
    //                        console.error(err);
    //                        eb.close();
    //                        res.status(200).send(err);
    //                        return;
    //                    }
    //
    //                    console.log(resp);
    //                    res.status(200).send(resp);
    //                    eb.close();
    //                });
    //    };

    var eb = new EventBus('http://localhost:8080/eventbus/');
    eb.onopen = function() {
        var processorService = new PushService(eb, "service.jpush");


        //       processorService.getDeviceTagAlias("160a3797c80c55835e7",
        processorService.deleteAlias("孙光", "android",
            //        processorService.deleteTag("北京", "android",
            //processorService.getAliasDeviceList("", "",
            // processorService.addRemoveDevicesFromTag("北京", ["160a3797c80c55835e7"], [],
            //        processorService.clearDeviceTagAlias("160a3797c80c55835e7", true, true,
            //        processorService.updateDeviceTagAlias("160a3797c80c55835e7", "孙光",
            //                ["男", "北京"], [],
            function(err, resp) {
                if (err) {
                    console.error(err);
                    eb.close();
                    res.status(200).send(err);
                    return;
                }

                console.log(resp);
                res.status(200).send(resp);
                eb.close();
            }
        );
    };
});
router.post("/getTags", function(req, res) {
    var eb = new EventBus('http://localhost:8080/eventbus/');
    eb.onopen = function() {
        var processorService = new PushService(eb, "service.jpush");
        processorService.getTags(
            function(err, resp) {
                if (err) {
                    console.error(err);
                    eb.close();
                    res.status(200).send(err);
                    return;
                }
                console.log(resp);
                res.status(200).jsonp({ "code": "0", "data": resp });
                eb.close();
            });
    };
});

router.post("/receiveds", function(req, res) {
    var sendData = req.body.sendData;
    var condition = {};
    var from = sendData.from;
    var to = sendData.to;
    console.log("push /receiveds:" + JSON.stringify(sendData));
    if (typeof from !== "undefined" && from.length > 0) {
        try {
            var fromDate = new Date(Date.parse(from));
            condition.time = {};
            condition.time.$gte = fromDate;
        } catch (e) {
            // format the date string error;
        }
    }
    if (typeof to !== "undefined" && to.length > 0) {
        try {
            var toDate = new Date(Date.parse(to));
            if (typeof condition.time === "undefined") {
                condition.time = {};
            }
            condition.time.$lte = toDate;
        } catch (e) {
            //format the date string error;
        }
    }

    Parse.Cloud.useMasterKey();
    var pushInfosQuery = new Parse.Query(PushInfos);
    pushInfosQuery.ascending("time");
    pushInfosQuery.limit(20);
    pushInfosQuery.find({ useMasterKey: true })
        .then(function(list) {
            if (!list || list.length < 1) {
                res.status(200).jsonp({ "code": "-2", "msg": "no more data" });
                return;
            }
            var ret = [];
            var sendData = [];
            for (var i = 0; i < list.length; i++) {
                sendData.push(String(list[i].get("messageId")));
                ret[i] = {};
                ret[i].time = list[i].get("time");
                ret[i].message = list[i].get("message");
                ret[i].title = list[i].get("title");
                ret[i].sendNo = list[i].get("sendNo");
                ret[i].messageId = list[i].get("messageId");
                ret[i].androidRecvs = 0;
                ret[i].iosApns = 0;
                ret[i].iosRecvs = 0;
            }

            var eb = new EventBus(PushSrvAddr);
            eb.onopen = function() {
                var processorService = new PushService(eb, "service.jpush");
                console.log(JSON.stringify(sendData));
                processorService.getReceiveds(sendData,
                    function(err, resp) {
                        if (err) {
                            console.error(err);
                            eb.close();
                            res.status(200).send(err);
                            return;
                        }
                        //                        console.log(resp);
                        //                        console.log(resp.length);
                        //                        console.log(ret.length);
                        for (var i = 0; i < resp.length; i++) {
                            for (var j = 0; j < ret.length; j++) {
                                if (Math.floor(resp[i].msg_id) === Math.floor(ret[j].messageId)) {
                                    //                                    console.log("From result check : " + resp[i].msg_id + "," + ret[j].messageId);
                                    ret[j].androidRecvs = resp[i].android_received;
                                    ret[j].iosApns = resp[i].ios_apns_sent;
                                    ret[j].iosRecvs = resp[i].ios_msg_received;
                                    break;
                                }
                            }
                        }
                        res.status(200).jsonp({ "code": "0", "data": ret });
                        eb.close();
                    });
            };
        }, function(err) {
            res.status(200).jsonp({ "code": "-2", "msg": err });
            return;
        });

    /*
     var selection = "messageId sendNo title message time";
     var options = {
     sort: {
     time: 1
     }
     };
     var search = PushModel.find(condition, selection, options, function (err, docs) {
     if (err) {
     res.status(200).jsonp({"code": "-2", "msg": err});
     return;
     }
     console.log("push result:" + JSON.stringify(docs));
     var ret = [];
     var sendData = [];
     for (var i = 0; i < docs.length; i++) {
     sendData.push(String(docs[i].messageId));
     ret[i] = {};
     ret[i].time = docs[i].time;
     ret[i].message = docs[i].message;
     ret[i].title = docs[i].title;
     ret[i].sendNo = docs[i].sendNo;
     ret[i].messageId = docs[i].messageId;
     ret[i].androidRecvs = 0;
     ret[i].iosApns = 0;
     ret[i].iosRecvs = 0;
     }
     
     var eb = new EventBus('http://localhost:8080/eventbus/');
     eb.onopen = function () {
     var processorService = new PushService(eb, "service.jpush");
     console.log(JSON.stringify(sendData));
     processorService.getReceiveds(sendData,
     function (err, resp) {
     if (err) {
     console.error(err);
     eb.close();
     res.status(200).send(err);
     return;
     }
     //                        console.log(resp);
     //                        console.log(resp.length);
     //                        console.log(ret.length);
     for (var i = 0; i < resp.length; i++) {
     for (var j = 0; j < ret.length; j++) {
     if (Math.floor(resp[i].msg_id) === Math.floor(ret[j].messageId)) {
     //                                    console.log("From result check : " + resp[i].msg_id + "," + ret[j].messageId);
     ret[j].androidRecvs = resp[i].android_received;
     ret[j].iosApns = resp[i].ios_apns_sent;
     ret[j].iosRecvs = resp[i].ios_msg_received;
     break;
     }
     }
     }
     res.status(200).jsonp({"code": "0", "data": ret});
     eb.close();
     });
     };
     
     
     });
     */
});

router.post("/sendToSome", function(req, res) {
    //var mathUtil = new MathUtil();
    var sendData = req.body.sendData;
    console.log("[push sendToAll]:" + JSON.stringify(req.body.sendData));
    sendData.test = false; // ture will simulate, false will really push.
    sendData.sendno = MathUtil.getRandom(1999999999, 1);
    var eb = new EventBus(PushSrvAddr);
    eb.onopen = function() {
        var processorService = new PushService(eb, "service.jpush");
        console.log(JSON.stringify(sendData));
        processorService.send2Range(sendData.test, sendData.toAndroid,
            sendData.toIOS, sendData.tags, sendData.tagsAnd, sendData.alias,
            sendData.registerIds, sendData.alert, sendData.androidAlert,
            sendData.iosAlert, sendData.message, sendData.extraMessage,
            sendData.sendno, sendData.timeToLive, sendData.apnsProduction,
            sendData.bigPushDuration,
            function(err, resp) {
                if (err) {
                    console.error(err);
                    eb.close();
                    res.status(200).jsonp({ "code": "-2", "msg": err });
                    return;
                }
                console.log(resp);
                var pushInfos = new PushInfos();
                pushInfos.set("messageId", resp.msg_id);
                pushInfos.set("sendNo", resp.sendno);
                pushInfos.set("title", sendData.message.title);
                pushInfos.set("message", sendData.message.msg_content);
                pushInfos.set("time", new Date());
                pushInfos.save();
                /*
                 var newPush = new PushModel();
                 newPush.messageId = resp.msg_id;
                 newPush.sendNo = resp.sendno;
                 newPush.title = sendData.message.title;
                 newPush.message = sendData.message.msg_content;
                 newPush.time = new Date();
                 newPush.save();
                 */
                res.status(200).jsonp({ "code": "0", "data": "" });
                eb.close();
            });
    };
});

router.post("/sendToAll", function(req, res) {

    var sendData = req.body.sendData;
    console.log("[push sendToAll]:" + JSON.stringify(req.body.sendData));
    sendData.test = false; // ture will simulate, false will really push.
    sendData.sendNo = MathUtil.getRandom(1999999999, 1);
    var eb = new EventBus(PushSrvAddr);
    eb.onopen = function() {
        var processorService = new PushService(eb, "service.jpush");
        console.log(JSON.stringify(sendData));
        processorService.send2All(sendData.test, sendData.toAndroid,
            sendData.toIOS, sendData.alert, sendData.androidAlert, sendData.iosAlert,
            sendData.message, sendData.extraMessage, sendData.sendNo, sendData.timeToLive,
            sendData.apnsProduction, sendData.bigPushDuration,
            function(err, resp) {
                if (err) {
                    console.error(err);
                    eb.close();
                    res.status(200).jsonp({ "code": "-2", "msg": err });
                    return;
                }
                console.log(resp);
                var pushInfos = new PushInfos();
                pushInfos.set("messageId", resp.msg_id);
                pushInfos.set("sendNo", resp.sendno);
                pushInfos.set("title", sendData.message.title);
                pushInfos.set("message", sendData.message.msg_content);
                pushInfos.set("time", new Date());
                pushInfos.save();
                /*
                 var newPush = new PushModel();
                 newPush.messageId = resp.msg_id;
                 newPush.sendNo = resp.sendno;
                 newPush.title = sendData.message.title;
                 newPush.message = sendData.message.msg_content;
                 newPush.time = new Date();
                 newPush.save();
                 */
                res.status(200).jsonp({ "code": "0", "data": "" });
                eb.close();
            });
    };
});



module.exports = router;