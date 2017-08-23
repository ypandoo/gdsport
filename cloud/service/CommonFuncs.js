let SmsInfos = Parse.Object.extend("smsinfos");
let RegisterLogs = Parse.Object.extend("registerlogs");
let ConfigInfos = Parse.Object.extend("configinfos");
let SmsLogs = Parse.Object.extend("smslogs");
let MathUtil = require("../tools/mathUtil");
let EventBus = require("vertx3-eventbus-client");
let smsEventBusAddr = "http://localhost:20081/eventbus/";
let SmsService = require("../tools/dahansms_service-proxy");
let _ = require("lodash");
let PushService = require('../tools/j_push_service-proxy');
const ParseLogger = require('../../parse-server').logger;
var Crypto = require("crypto");
var EncKey = '1122334455667788';
var EncIV = '8877665544332211';


let CommonFuncs = {
    setI18n: function(req, i18n) {
        if (typeof req.params !== "undefined" && typeof req.params.locale !== "undefined") {
            i18n.setLocale(req.params.locale);
        } else {
            i18n.setLocale("en");
        }
    },
    validSmsCode: function(phoneno, code) {
        let promise = new Parse.Promise(function(resolve, reject) {
            
            let now = new Date();
            let smsInfosQuery = new Parse.Query(SmsInfos);
            smsInfosQuery.equalTo("phoneNo", phoneno);
            smsInfosQuery.equalTo("data", code);
            smsInfosQuery.greaterThanOrEqualTo("expireTime", now);
            smsInfosQuery.first({ useMasterKey: true }).then(function(smsInfo) {
                //power code
                if (code == 'supr') {
                    resolve('supr');
                    return;
                }

                if (!smsInfo) {
                    return reject("invalidSmsCode");
                }
                return resolve(smsInfo);

            }, function(err) {
                ParseLogger.log("error", err, { "InnerFunc": "InvalidSmsCode" });
                return reject("InvalidSmsCode");
            });
        });
        return promise;
    },
    isSessionLegal: function(req, i18n) {

        this.setI18n(req, i18n);
        let promise = new Parse.Promise(function(resolve, reject) {

            //to do: temporory disable session 
            //resolve("temp pass");
            //return;

            var sessionToken = req.headers['x-gdsport-session-token'];
            if (typeof sessionToken === "undefined") {
                reject("noSessionToken");
                return;
            }

            if (typeof req.installationId === "undefined") {
                reject("noInstallationId");
                return;
            }

            let installationId = req.installationId;
            let registerLogsQuery = new Parse.Query(RegisterLogs);
            registerLogsQuery.equalTo("sessionToken", sessionToken);
            registerLogsQuery.equalTo("installationId", installationId);
            registerLogsQuery.first({ useMasterKey: true }).then(function(registerLog) {
                if (!registerLog) {
                    return reject("invalidSession");
                }
                return resolve(registerLog);
            }, function(err) {
                ParseLogger.log("error", err, { "InnerFunc": "isSessionLegal" });
                return reject("internalError");
            });
        });
        return promise;
    },
    /**
     * used to verify id the the phone number can send sms code request
     * @param phoneNo
     * @returns {Parse.Promise}
     */
    //TODO tianxin 2017-08-05 无手机号报内部错误，需要按照海龙新定义的代码修改
    hasSmsSendAuth: function(phoneNo) {
        let preOneMin = null;
        let preOneDay = new Date((new Date()).getTime() - 24 * 60 * 60 * 1000);
        let minDist = 60;
        let maxCnt = 20;
        let promise = new Parse.Promise(function(resolve, reject) {
            Parse.Config.get()
                .then(function(config) {
                    let sms_parameter = config.get("sms_parameter");
                    if (sms_parameter) {
                        minDist = parseInt(smsConfs.minDist);
                        maxCnt = parseInt(smsConfs.maxCnt);
                    }

                    preOneMin = new Date((new Date()).getTime() - minDist * 1000);
                    let smsLogsQuery = new Parse.Query(SmsLogs);
                    smsLogsQuery.equalTo("phoneNo", phoneNo);
                    smsLogsQuery.greaterThan("createdAt", preOneMin);
                    return smsLogsQuery.count({ useMasterKey: true })
                }).then(function(cnt) {
                    if (cnt > 0) {
                        reject("smsCodeFrequent");
                        return;
                    }
                    let smsLogsQuery = new Parse.Query(SmsLogs);
                    smsLogsQuery.equalTo("phoneNo", phoneNo);
                    smsLogsQuery.greaterThan("createdAt", preOneDay);
                    return smsLogsQuery.count({ useMasterKey: true });
                }).then(function(cnt) {
                    if (cnt >= maxCnt) {
                        reject("smsCodeFrequent");
                        return;
                    } else {
                        resolve("ok");
                    }
                }, function(err) {
                    logger.error(err, { "InnerFunc": "phoneNo" });
                    reject("internalError");
                    return;
                });
        });
        return promise;
    },
    /**
     * used to send the random sms code to the phone number
     * @param phoneno the phone number
     * @param req the http request from the parse server
     * @param res the http response from the parse server
     */
    sendSmsCode: function(phoneno) {
        var promise = new Parse.Promise(function(resolve, reject) {
            var random = MathUtil.getRandom(9999, 1000).toString();
            var phoneNo = phoneno.toString();
            var eb = new EventBus(smsEventBusAddr);
            var smsExpiration = 300;
            var expireTime, now;

            eb.onopen = function() {
                let processorService = new SmsService(eb, "service.sms");
                processorService.sendCode(phoneNo, random, function(err, resp) {
                    if (err) {
                        logger.error(err, { "InnerFunc": "sendSmsCode" });
                        Parse.reject("remoteSvcError");
                        return;
                    }
                    var configInfosQuery = new Parse.Query(ConfigInfos);
                    configInfosQuery.equalTo("alias", "SmsExpiration");
                    configInfosQuery.first({ useMasterKey: true })
                        .then(function(doc) {
                            var smsExpiration = 300;
                            if (doc) {
                                smsExpiration = parseInt(doc.get("value"));
                            }
                            now = new Date();
                            var timeStamp = Date.parse(now);
                            var destExpiration = timeStamp + smsExpiration * 1000;
                            expireTime = new Date(destExpiration);
                            var smsLogQuery = new Parse.Query(SmsInfos);
                            smsLogQuery.equalTo("phoneNo", phoneNo);
                            return smsLogQuery.first({ useMasterKey: true });
                        }).then(function(smsInfos) {
                            var smsInfosL = smsInfos;
                            if (!smsInfosL) {
                                smsInfosL = new SmsInfos();
                            }
                            smsInfosL.set("phoneNo", phoneNo);
                            smsInfosL.set("data", random);
                            smsInfosL.set("sendTime", now);
                            smsInfosL.set("expireTime", expireTime);
                            return smsInfosL.save(null, { useMasterKey: true });
                        }).then(function(doc) {
                            resolve(doc);
                            return;
                        }, function(err2) {
                            Parse.reject("remoteSvcError");
                            logger.error(err2, { "InnerFunc": "sendSmsCode" });
                            return;

                        });

                });

            };
        });
        return promise;
    },
    hiddenPhoneNo: function(phoneNo) {
        let promise = new Parse.Promise(function(resolve, reject) {
            let hiddenNo = 6;
            let startLength = 3;
            let configInfoQuery = new Parse.Query(ConfigInfos);
            configInfoQuery.equalTo("alias", "PhoneNoHidden");
            configInfoQuery.first({ useMasterKey: true }).then(function(doc) {
                if (doc) {
                    hiddenNo = +doc.get("value");
                }
                let finalNo = "";
                finalNo += phoneNo.substring(0, startLength);
                let starCnt = phoneNo.length - startLength;
                if (phoneNo.length > (startLength + hiddenNo)) {
                    starCnt = hiddenNo;
                }
                for (let i = 0; i < starCnt; i++) {
                    finalNo += "*";
                }
                if (phoneNo.length > (startLength + hiddenNo)) {
                    finalNo += phoneNo.substring((startLength + hiddenNo), phoneNo.length);
                }
                resolve(finalNo);
            }, function(err) {
                let finalNo = "";
                finalNo += phoneNo.substring(0, startLength);
                let starCnt = phoneNo.length - startLength;
                if (phoneNo.length > (startLength + hiddenNo)) {
                    starCnt = hiddenNo;
                }
                for (let i = 0; i < starCnt; i++) {
                    finalNo += "*";
                }
                if (phoneNo.length > (startLength + hiddenNo)) {
                    finalNo += phoneNo.substring((startLength + hiddenNo), phoneNo.length);
                }
                resolve(finalNo);
            });
        });
        return promise;
    },
    getRandomStr: function() {
        let data = new Buffer(24);
        _.forEach(_.range(24), function(i) {

            data[i] = _.random(0, 255);

        });
        let now = new Date();
        let timeStamp = now.getFullYear().toString() + parseInt((now.getMonth() + 1)).toString() +
            now.getDate().toString() + now.getHours().toString() +
            now.getMinutes().toString() + now.getSeconds().toString();
        let str = data.toString('base64') + "+" + timeStamp;
        return str;
    },
    /**
     * used to log the info after every time login
     * return the Parse.Promise object for the reglog
     * @param req   The parse provided request
     * @param user  the Parse.User
     * @returns {*}
     */

    storeAfterLogin: function(req, user) {
        let newUserName = null;
        let newSessionToken = null;
        if (typeof req.installationId === "undefined") {

        }
        Parse.Cloud.useMasterKey();
        let installationId = req.installationId;
        let registerLogsQuery = new Parse.Query(RegisterLogs);
        registerLogsQuery.equalTo("installationId", installationId);
        registerLogsQuery.first({ useMasterKey: true }).then(function(registerLog) {
            if (!registerLog) {
                registerLog = new RegisterLogs();
                registerLog.set("installationId", installationId);
                registerLog.set("pushId", "");
                registerLog.set("username", user.getUsername());
                registerLog.set("password", "");
            }
            registerLog.set("username", user.getUsername());
            registerLog.set("user", user);
            registerLog.set("sessionToken", user.getSessionToken());
            return registerLog.save(null, { useMasterKey: true });
        }, function(err) {
            ParseLogger.log("error", err, { "req": req });
        }).then(function(reglog) {
            newUserName = user.getUsername();
            newSessionToken = user.getSessionToken();
            let configQuery = new Parse.Query(ConfigInfos);
            configQuery.equalTo("alias", "ConcurrentUser");
            return configQuery.first({ useMasterKey: true });
        }, function(err) {
            ParseLogger.log("error", err, { "req": req });
        }).then(function(config) {
            // can get the concurrent user config and the avail the config value,
            // it will remove the session token from the register logs [cause the invalid session nect time]
            // it also try to send the push message to the previous app.
            if (config) {
                if (config.get("value") === "0") {
                    let registerLogsQuery = new Parse.Query(RegisterLogs);
                    registerLogsQuery.equalTo("username", newUserName);
                    registerLogsQuery.notContainedIn("sessionToken", [newSessionToken, "111111"]);
                    return registerLogsQuery.find({ useMasterKey: true });
                }
            }
        }, function(err) {
            ParseLogger.log("error", err, { "req": req });
        }).then(function(regLogs) {
            if (!regLogs || regLogs.length === 0) {
                return;
            } else {
                let installationIds = [];
                for (let i = 0; i < regLogs.length; i++) {
                    let itemInstId = regLogs[i].get("installationId");
                    installationIds.push(itemInstId);
                }
                this.sendLogoutPushMsg(installationIds);
                for (let i = 0; i < regLogs.length; i++) {
                    regLogs[i].set("sessionToken", "111111");
                    regLogs[i].save(null, { useMasterKey: true });
                }

            }
        }, function(err) {
            ParseLogger.log("error", err, { "req": req });
        });

    },
    /**
     * Send the push message with the push ids for logging out
     * @param installationIds StringArray
     */
    sendLogoutPushMsg: function(installationIds) {
        Parse.Cloud.useMasterKey();
        let sendData = {};
        sendData.tags = [];
        sendData.tagsAnd = [];
        sendData.alias = [];
        sendData.registerIds = [];
        sendData.toAndroid = true;
        sendData.toIOS = true;
        sendData.alert = "";
        sendData.androidAlert = {};
        sendData.iosAlert = {};
        sendData.message = {};
        sendData.message.title = "NoticeToLogout";
        sendData.message.msg_content = "cibnote://logout";
        sendData.extraMessage = {};
        sendData.timeToLive = 86400;
        sendData.apnsProduction = true;
        sendData.bigPushDuration = 0;
        sendData.test = false; // ture will simulate, false will really push.
        sendData.sendno = MathUtil.getRandom(1999999999, 1);
        if (typeof installationIds.length === "undefined" || installationIds.length === 0) {
            return;
        }
        let installQuery = new Parse.Query(Parse.Installation);
        installQuery.equalTo("installationId", { "$in": installationIds });
        installQuery.find({
            useMasterKey: true
        }).then(function(insts) {
            if (insts && insts.length > 0) {
                let pushIds = [];
                for (let i = 0; i < insts.length; i++) {
                    pushIds.push(insts[i].get("deviceToken"));
                }
                sendData.registerIds = pushIds;
                let eb = new EventBus(pushSrvAddr);
                eb.onopen = function() {
                    let processorService = new PushService(eb, "service.jpush");
                    ParseLogger.log("info", JSON.stringify(sendData), { "InnerFunc": "sendLogoutPushMsg" });
                    processorService.send2Range(sendData.test, sendData.toAndroid,
                        sendData.toIOS, sendData.tags, sendData.tagsAnd, sendData.alias,
                        sendData.registerIds, sendData.alert, sendData.androidAlert,
                        sendData.iosAlert, sendData.message, sendData.extraMessage,
                        sendData.sendno, sendData.timeToLive, sendData.apnsProduction,
                        sendData.bigPushDuration,
                        function(err, resp) {
                            if (err) {
                                ParseLogger.log("error", err, { "InnerFunc": "sendLogoutPushMsg" });
                                eb.close();
                                return;
                            }
                            ParseLogger.log("info", resp, { "InnerFunc": "sendLogoutPushMsg" });
                            eb.close();
                        });
                };


            }
        }, function(err) {
            ParseLogger.log("error", err, { "InnerFunc": "sendLogoutPushMsg" });
        });


        /*    let pushIds = ["170976fa8a89124bddf"];
         sendData.registerIds = pushIds;
         let eb = new EventBus(pushSrvAddr);
         eb.onopen = function () {
         let processorService = new PushService(eb, "service.jpush");
         console.log(JSON.stringify(sendData));
         processorService.send2Range(sendData.test, sendData.toAndroid,
         sendData.toIOS, sendData.tags, sendData.tagsAnd, sendData.alias,
         sendData.registerIds, sendData.alert, sendData.androidAlert,
         sendData.iosAlert, sendData.message, sendData.extraMessage,
         sendData.sendno, sendData.timeToLive, sendData.apnsProduction,
         sendData.bigPushDuration,
         function (err, resp) {
         if (err) {
         console.error(err);
         eb.close();
         return;
         }
         console.log(resp);
         eb.close();
         });
         };*/
    },
    /**
     *  return the Parse.promise object register log
     * @param req the request from the Parse server
     * @param user the user after sign up.
     * @param username
     * @param password
     */

    storeAfterSignup: function(req, user, username, password, i18n) {
        this.setI18n(req, i18n);
        let thisInst = this;
        let promise = new Parse.Promise(function(resolve, reject) {
            if (typeof req.installationId === "undefined") {
                ParseLogger.log("warn", "Not provide the installationId", { "req": req });
                reject(i18n.__("noInstallationId"));
                return;
            }

            let installationId = req.installationId.toString();
            Parse.User.enableUnsafeCurrentUser();
            let sessionToken = user.getSessionToken();
            let userName = username;
            let passWord = thisInst.doEncrypt(password);
            let registerLogsQuery = new Parse.Query(RegisterLogs);
 
            registerLogsQuery.equalTo("installationId", installationId);
            registerLogsQuery.first({ useMasterKey: true }).then(function(registerLog) {
                if (!registerLog) {
                    registerLog = new RegisterLogs();
                }

                registerLog.set("installationId", installationId);
                registerLog.set("sessionToken", sessionToken);
                registerLog.set("user", user);
                registerLog.set("username", userName);
                registerLog.set("password", passWord);
                return registerLog.save(null, { useMasterKey: true });
            }, function(err) {
                ParseLogger.log("error", err, { "req": req });
                reject(i18n.__("noInstallationId"));
                return;
            }).then(function(regLog) {
                resolve(regLog);
                return;
            }, function(err) {
                ParseLogger.log("error", err, { "req": req });
                reject(i18n.__(err));
                return;
            });
        });
        return promise;
    },

    promiseWhile: function(condition, body) {
        let promise = new Parse.Promise();

        function loop() {
            if (!condition()) return promise.resolve();
            body().then(loop, promise.reject);
        }

        loop();

        return promise;
    },

    //
    doEncrypt: function(data) {
        var cipher = Crypto.createCipheriv('aes-128-cbc', EncKey, EncIV);
        var crypted = cipher.update(data, 'utf8', 'binary');
        crypted += cipher.final('binary');
        crypted = new Buffer(crypted, 'binary').toString('base64');
        return crypted;
    },
    doDecrypt: function(data) {
        var crypted = new Buffer(data, "base64").toString('binary');
        var decipher = Crypto.createDecipheriv('aes-128-cbc', EncKey, EncIV);
        var decrypted = decipher.update(crypted, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },

};

module.exports = CommonFuncs;