/**
 * Created by yuhailong on 06/04/2017.
 */

const i18n = require('i18n');
const _ = require('lodash');

const cfg = require('../../config/index');
i18n.configure({
    directory: __dirname + "/../locale"
});
const errors = require("../errcode.js");
const ParseLogger = require('../../parse-server').logger;
const commonFunc = require("./CommonFuncs");

const SmsLogs = Parse.Object.extend("smslogs");
//const PhoneUser = Parse.Object.extend("PhoneUser");
const RegisterLogs = Parse.Object.extend("registerlogs");
const BandUser = Parse.Object.extend("BandUser");
const User = Parse.Object.extend("_User");
const Session = Parse.Object.extend("_Session");





/**
 * just phone user can use phone number to sign up
 * there are 4 forks for the logic:
 * 1. the phone number has exist, register failed
 * 2. the phone number is not exist, not in the preload band info.
 *    then create new Parse.User and PhoneUser to relate.
 * 3. the phone number is not exist, in the preload band info, band has not been bind.
 *    then create new Parse.User and PhoneUser to relate.
 * 4. the phone number is not exist, in the preload band info, band has been bind.
 *    then find the Parse.User from the specified BandUser, bind the user to new PhoneUser.
 */


exports.signup = function (req, res)  {
    commonFunc.setI18n(req, i18n);
    if (typeof req.params.phonenum === "undefined") {
        ParseLogger.log("warn", i18n.__("noPhoneNb"), {"req": req});
        res.error(errors["noPhoneNb"], i18n.__("noPhoneNb"));
        return;
    }

    Parse.User.enableUnsafeCurrentUser();
    let phoneNumber = req.params.phonenum;
    phoneNumber = phoneNumber.replace(/\D/g, '');
    let retUserName = "";
    let retObjectId = "";
    let retCreatedAt = "";
    if (typeof req.installationId === "undefined" || !req.installationId) {
        ParseLogger.log("warn", i18n.__("noInstallationId"), {"req": req});
        res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
        return;
    }
    let password = req.params.password;
    let smsCode = req.params.authcode;
    //let pushId = req.pushid;

    //   if(lang !== undefined && languages.indexOf(lang) != -1) {
    // 		language = lang;
    // 	}

    if (!phoneNumber || (phoneNumber.length != 11)) {
        ParseLogger.log("warn", i18n.__("invalidPhoneFormat"), {"req": req});
        return res.error(errors["invalidPhoneFormat"], i18n.__("invalidPhoneFormat"));
    }

    if (!password || (password.length < 6)) {
        ParseLogger.log("warn", i18n.__("invalidPasswordFormat"), {"req": req});
        return res.error(errors["invalidPasswordFormat"], i18n.__("invalidPasswordFormat"));
    }
    if (!smsCode || (smsCode.length != 4)) {
        ParseLogger.log("warn", i18n.__("invalidSmsCodeFormat"), {"req": req});
        return res.error(errors["invalidSmsCodeFormat"], i18n.__("invalidSmsCodeFormat"));
    }

    let sessionToken = "";
    Parse.Cloud.useMasterKey();

    commonFunc.validSmsCode(phoneNumber, smsCode).then(function (smsCodeRet) {
        // validate if the SMS code is correct and not expired
        if (smsCodeRet === null || !smsCodeRet) {
            ParseLogger.log("warn", i18n.__("invalidSmsCode"), {"req": req});
            res.error(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
            reject(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
            return;
        } else {
            let userQuery = new Parse.Query(User);
            userQuery.equalTo('username', phoneNumber.toString());
            return userQuery.first({useMasterKey: true});
        }
    }, function (errMsg) {
        ParseLogger.log("error", errMsg, {"req": req});
        res.error(errors[errMsg], i18n.__(errMsg));
        reject(errMsg);
        return;
    }).then(function (phoneUser) {
        // validate if the phone number has been registered
        if (phoneUser) {
            ParseLogger.log("warn", i18n.__("phoneNbExist"), {"req": req});
            res.error(errors["phoneNbExist"], i18n.__("phoneNbExist"));
            reject(i18n.__("phoneNbExist"));
        } else {
            // let preloadBandQuery = new Parse.Query(PreloadBand);
            // preloadBandQuery.equalTo("phoneNo", phoneNumber);
            // return preloadBandQuery.first({useMasterKey: true});
            //     }
            // }).then(function (preloadBand) {
            //     // find if the phone number in the preload files
            //     if (!preloadBand) {
            // not defined in the preload band
            // todo create user with phone number directly
            signUpAllNewPhoneUser(req, res, phoneNumber, password);
            reject("user should be created directly");
            //     } else {
            //         let bandName = preloadBand.get("bandName");
            //         let bandUserQuery = new Parse.Query(BandUser);
            //         bandUserQuery.equalTo("bandName", bandName);
            //         return bandUserQuery.first({useMasterKey: true});
            //     }
            // }).then(function (bandUser) {
            //     // find if the band user has been registered
            //     if (!bandUser) {
            //         // todo create user with phone number directly
            //         signUpAllNewPhoneUser(req, res, phoneNumber, password);
            //         reject("user should ve created directly");
            //     } else {
            //         let user = bandUser.get("user");
            //         let bandUserStoken = user.getSessionToken();
            //         let phoneUser = new PhoneUser();
            //         phoneUser.set("phoneNo", phoneNumber);
            //         phoneUser.set("user", user);
            //         return phoneUser.save(null, {useMasterKey: true});
            //     }
            // }).then(function (phoneUser) {
            //     // create the new phone user
            //     if (!phoneUser) {
            //         res.error("create phone user failed");
            //         reject("create phone user failed");
            //     } else {
            //         let modUser = phoneUser.get("user");
            //         modUser.setPassword(password, {useMasterKey: true});
            //         return modUser.save(null, {useMasterKey: true})
            //     }
            // }).then(function (modUser) {
            //     // find the modified user
            //     if (!modUser) {
            //         res.error("modify the user failed");
            //         reject("modify the user failed");
            //     } else {
            //         retObjectId = modUser.id;
            //         let fUserQuery = new Parse.Query(Parse.User);
            //         return fUserQuery.get(retObjectId, {useMasterKey: true});
            //     }
            // }).then(function (fUser) {
            //     if (!fUser) {
            //         res.error("Cannot find the user");
            //         reject("cannot find the user");
            //         return;
            //     } else {
            //         sessionToken = fUser.getSessionToken();
            //         retUserName = fUser.getUsername();
            //         return storeAfterSignup(req, fUser, fUser.getUsername(), password);
            //     }
            // }).then(function (registerLog) {
            //     // check the register log
            //     if (!registerLog) {
            //         res.error("Log the register information failed");
            //         reject();
            //     } else {
            //         registerLog.set("pushId");
            //         registerLog.save();
            //         let ret = {};
            //         ret.sessionToken = sessionToken;
            //         ret.username = retUserName;
            //         ret.objectId = retObjectId;
            //         res.success(ret)
        }
    });


    // let query = new Parse.Query(Parse.User);
    // query.equalTo('username', phoneNumber + "");
    // query.first({
    //     useMasterKey: true
    // }).then(function (result) {
    //
    //     if (result) {
    //         return res.error('phone number has existed');
    //     } else {
    //         let user = new Parse.User();
    //         user.setUsername(phoneNumber);
    //         user.setPassword(secretPasswordToken + password);
    //         //			user.set("language", language);
    //         user.setACL({});
    //         user.save().then(function () {
    //             res.success({});
    //         }, function (err) {
    //             res.error(err);
    //         });
    //     }
    // }, function (err) {
    //     res.error(err);
    // });

};


/**
 * just phone user can reset the password
 */
exports.resetPassword = function (req, res) {
    commonFunc.setI18n(req);
    let phoneNumber = req.params.phonenumber;
    phoneNumber = phoneNumber.replace(/\D/g, '');

    if (typeof req.installationId === "undefined" || !req.installationId) {
        ParseLogger.log("warn", i18n.__("noInstallationId"), {"req": req});
        res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
        return;
    }
    let password = req.params.password;
    let smsCode = req.params.code;

    //   if(lang !== undefined && languages.indexOf(lang) != -1) {
    // 		language = lang;
    // 	}

    if (!phoneNumber || (phoneNumber.length != 11)) {
        ParseLogger.log("warn", i18n.__("invalidPhoneFormat"), {"req": req});
        return res.error(errors["invalidPhoneFormat"], i18n.__("invalidPhoneFormat"));
    }

    if (!password || (password.length < 6)) {
        ParseLogger.log("warn", i18n.__("invalidPasswordFormat"), {"req": req});
        return res.error(errors["invalidPasswordFormat"], i18n.__("invalidPasswordFormat"));
    }
    if (!smsCode || (smsCode.length != 4)) {
        ParseLogger.log("warn", i18n.__("invalidSmsCodeFormat"), {"req": req});
        return res.error(errors["invalidSmsCodeFormat"], i18n.__("invalidSmsCodeFormat"));
    }

    Parse.Cloud.useMasterKey();
    let renewUser = null;
    commonFunc.validSmsCode(phoneNumber.toString(), smsCode).then(function (smsInfo) {
        if (!smsInfo || smsInfo === null) {
            ParseLogger.log("warn", i18n.__("invalidSmsCode"), {"req": req});
            res.error(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
            reject("the SMS code is invalid or expired");
            return;
        } else {
            Parse.Cloud.useMasterKey();
            let phoneUserQuery = new Parse.Query(PhoneUser);
            phoneUserQuery.equalTo("phoneNo", phoneNumber.toString());
            return phoneUserQuery.first({useMasterKey: true});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        return;
    }).then(function (phUser) {
        if (!phUser) {
            ParseLogger.log("error", "Failed to find the phone user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            reject("Failed to find out the phone user");
        } else {
            let prelUser = phUser.get("user");
            prelUser.setPassword(password);
            return prelUser.save(null, {useMasterKey: true});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors['internalError'], i18n.__('internalError'));
    }).then(function (pnUser) {
        if (!pnUser) {
            ParseLogger.log("error", "Failed to save the parse user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            reject("Save the password failed");
        } else {
            renewUser = pnUser;
            let regLogQuery = new Parse.Query(RegisterLogs);
            regLogQuery.equalTo("installationId", req.installationId);
            return regLogQuery.first({useMasterKey: true});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors['internalError'], i18n.__('internalError'));
    }).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("error", "Failed to save the register log", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            reject("failed to get the reg log");
            return;
        } else {
            return commonFunc.storeAfterSignup(req, renewUser, regLog.get("username"), password, i18n);
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors['internalError'], i18n.__('internalError'));
    }).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("error", "Failed to save the register log", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
        } else {
            res.success({});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
    });

// let query = new Parse.Query(Parse.User);
// query.equalTo('username', phoneNumber + "");
// query.first().then(function (result) {
//
//     if (result) {
//         result.setPassword(secretPasswordToken + password);
//         result.save().then(function () {
//             res.success({});
//         }, function (err) {
//             res.error(err);
//         });
//
//     } else {
//         return res.error('no this user');
//     }
// }, function (err) {
//     res.error(err);
// });

};


/**
 * just phone user can login
 */
exports.signin = function (req, res) {
    commonFunc.setI18n(req,i18n);
    Parse.Cloud.useMasterKey();
    Parse.User.enableUnsafeCurrentUser();
    let sessionToken = "";
    let retUserName = "";
    let retObjectId = "";
    let retCreatedAt = "";
    if (typeof req.installationId === "undefined" || !req.installationId) {
        ParseLogger.log("error", i18n.__("noInstallationId"), {"req": req});
        res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
        return;
    }
    if (typeof req.params === "undefined" || typeof req.params.phonenum === "undefined") {
        ParseLogger.log("error", i18n.__("noPhoneNb"), {"req": req});
        res.error(errors["noPhoneNb"], i18n.__("noPhoneNb"));
        return;
    }
    let phoneNumber = req.params.phonenum;
    phoneNumber = phoneNumber.replace(/\D/g, '');
    let password = req.params.password;
    if (phoneNumber && password) {
        Parse.Cloud.useMasterKey();
        let phoneUserQuery = new Parse.Query(User);
        phoneUserQuery.equalTo("username", phoneNumber.toString());
        phoneUserQuery.first({useMasterKey: true}).then(function (phoneUser) {
            if (!phoneUser) {
                ParseLogger.log("error", "Failed to find out the user with the password and username", {"req": req});
                res.error(errors["loginFailed"], i18n.__("loginFailed"));
                reject("NO this phone number");
                return;
            } else {
                return phoneUser;
                /*let username = phoneUser.getUsername();
                let destUser = phoneUser.get("user");
                let userId = destUser.id;
                let parseUserQuery = new Parse.Query(Parse.User);
                return parseUserQuery.get(userId, {useMasterKey: true});*/
            }
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["loginFailed"], i18n.__("loginFailed"));
            reject("NO this phone number");
            return;
        }).then(function (sUser) {
            if (!sUser) {
                ParseLogger.log("error", "Faild to find the user by user id", {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
                reject("Failed to find the user");
                return;
            } else {
                let userName = sUser.get("username");
                return Parse.User.logIn(userName, password);
            }
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            reject("Failed to find the user");
            return;
        }).then(function (nUser) {
            if (!nUser) {
                ParseLogger.log("error", "Failed to login the user", {"req": req});
                res.error(errors["loginFailed"], i18n.__("loginFailed"));
            } else {
                sessionToken = nUser.getSessionToken();
                retUserName = nUser.getUsername();
                retObjectId = nUser.id;
                retCreatedAt = nUser.createdAt;
                let ret = {};
                ret.token = sessionToken;
                ret.username = retUserName;
                //ret.objectId = retObjectId;
                //ret.createdAt = retCreatedAt;
                res.success(ret);
                commonFunc.storeAfterLogin(req, nUser);
                return;
            }
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["loginFailed"], i18n.__("loginFailed"));
            return;
        });

        // Parse.User.logIn(phoneNumber, secretPasswordToken + req.params.password).then(function (user) {
        //     res.success(user.getSessionToken());
        // }, function (err) {
        //     res.error(err);
        // });
    } else {
        ParseLogger.log("warn", "Missed username or password", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }
};

/**
 * just phone user can logout
 */

exports.signout = function (req, res) {
    commonFunc.setI18n(req,i18n);
    Parse.Cloud.useMasterKey();
    Parse.User.enableUnsafeCurrentUser();
    if (req.params.username) {
        let phoneUserQuery = new Parse.Query(User);
        phoneUserQuery.equalTo("username", req.params.username);
        phoneUserQuery.first({ useMasterKey: true }).then(function (phoneUser) {
            // No need to fetch the current user for querying Note objects.
            let sessionQuery = new Parse.Query(Parse.Session);
            let id = '_User$'+phoneUser.id;
            sessionQuery.equalTo("user", id);
            //sessionQuery.equalTo("installationId", req.installationId);
            sessionQuery.find({ useMasterKey: true }).then(function (sessions) {
                _.forEach(sessions, function (item) {
                    item.destroy();
                });
                res.success({});
            }, function (err) {
                ParseLogger.log("error", err, { "req": req });
                res.error(errors["internalError"], i18n.__("internalError"));
            });
        },function(err){
            ParseLogger.log("error", err, { "req": req });
            res.error(errors["internalError"], i18n.__("internalError"));
        });


        
        // Parse.User.logOut().then(function (obj) {
        //     res.success({})
        // }, function (err) {
        //     res.error(err.message);
        // });

    } else {
        ParseLogger.log("warn", "Do not has the req.user", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
    }
};

/**
 * used to register one new phone user .
 * reture the Parse.Promise object here
 * @param req       the Parse request
 * @param res       the Parse response
 * @param phoneNo   the phone number
 * @param password  the password
 */

let signUpAllNewPhoneUser = function (req, res, phoneNo, password) {

    let sessionToken = "";
    let retUserName = "";
    let retObjectId = "";
    let retCreatedAt = "";
    Parse.Cloud.useMasterKey();
    let user = new Parse.User();
    user.setUsername(phoneNo, {useMasterKey: true});
    user.setPassword(password, {useMasterKey: true});
    user.signUp(null, {useMasterKey: true}).then(function (newUser) {
        if (!newUser) {
            ParseLogger.log("error", "Failed to create user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            reject(i18n.__("internalError"));
            return;
        } else {
            sessionToken = newUser.getSessionToken();
            retUserName = newUser.getUsername();
            retObjectId = newUser.id;
            retCreatedAt = newUser.createdAt;

            commonFunc.storeAfterLogin(req, user);
            let ret = {};
            ret.token = sessionToken;
            ret.username = retUserName;
            //CommonFuncs.jsret.objectId = retObjectId;
            //ret.createAt = retCreatedAt;
            res.success(ret);

            /*let phoneUser = new PhoneUser();
            phoneUser.set("phoneNo", phoneNo);
            phoneUser.set("user", newUser);
            return phoneUser.save(null, {useMasterKey: true});*/
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        return;
    });/*.then(function (phoneUser1) {
        if (!phoneUser1) {
            ParseLogger.log("error", "Failed to save the phone user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            reject(i18n.__("internalError"));
            return;
        } else {
            commonFunc.storeAfterLogin(req, user);
            let ret = {};
            ret.sessionToken = sessionToken;
            ret.username = retUserName;
            ret.objectId = retObjectId;
            ret.createAt = retCreatedAt;
            res.success(ret);
            resolve(regLog);
        }
    }, function (errMsg) {
        ParseLogger.log("error", errMsg, {"req": req});
        res.error(errors["internalError"], i18n.__("internalError"));
    });*/
};



/**
 * used to update the push id
 */
// Parse.Cloud.define("updatePushId", function (req, res) {
//     commonFunc.setI18n(req, i18n);
//     if (typeof req.params === "undefined" || typeof req.params.pushid === "undefined"
//         || typeof req.installationId === "undefined") {
//         ParseLogger.log("warn", "Req.params or req.params.pushid or req.installationId missied", {"req": req});
//         res.error(errors["invalidError"], i18n.__("invalidError"));
//         return;
//     }
//     let pushId = req.params.pushid;
//     commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
//         if (!regLog) {
//             ParseLogger.log("warn", "Session is illegal", {"req": req});
//             res.error(errors["invalidSession"], i18n.__("invalidSession"));
//             return;
//         }
//         regLog.set("pushId", pushId);
//         regLog.save(null, {useMasterKey: true});
//         res.success({});
//         return;
//     }, function (err) {
//         ParseLogger.log("error", err, {"req": req});
//         res.error(errors[err], i18n.__(err));
//         return;
//     })

// });

exports.updateUserProfile = function (req, res) {
    commonFunc.setI18n(req, i18n);
    //var bandName = req.params.bandname;
    var phoneNumber = req.params.username;
    var height = req.params.height;
    var sex = req.params.sex;
    var birthdate = req.params.birthdate;
    var weight = req.params.weight;
    var avatar = req.params.avatar;
    var avatarhash = req.params.avatarhash;
    //var realname = req.params.realname;

    if (typeof req.params.bandname === "undefined" && typeof req.params.phonenumber === "undefined") {
        ParseLogger.log("warn", "Not provide the bandname or phonenumber", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    var updateType = "band";
    if (typeof req.params.bandname === "undefined") {
        updateType = "phone";
    }

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            res.error(errors["invalidSession"], i18n.__("invalidSession"));
            return;
        } else {
            Parse.Cloud.useMasterKey();
            Parse.User.enableUnsafeCurrentUser();
            var band;
            var query = null;
            if (updateType === "band") {
                query = new Parse.Query(BandUser);
                query.equalTo('bandName', bandName);
                query.ascending('createdAt');
            } else {
                query = new Parse.Query(PhoneUser);
                query.equalTo('phoneNo', phoneNumber);
                query.ascending('createdAt');
            }
            query.first({
                useMasterKey: true
            }).then(function (b) {
                // If not, create a new user.
                if (!b) {
                    ParseLogger.log("warn", "Failed to find the bind", {"req": req});
                    return res.error(errors["noBandFound"], i18n.__("noBandFound"));
                }
                band = b;
                //     return b.get('user').fetch();
                // }).then(function (user) {
                var profile;
                if (band.get('profile')) {
                    profile = band.get('profile');
                    return Parse.Promise.as(band);
                } else {
                    profile = new UserProfile();
                    band.set('profile', profile);
                    return band.save(null, {useMasterKey: true});
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (band) {
                var profile;
                if (band.get('profile')) {
                    profile = band.get('profile');
                    if (sex)
                        profile.set('sex', parseInt(sex.toString()));
                    if (height)
                        profile.set('height', parseInt(height.toString()));
                    if (weight)
                        profile.set('weight', parseInt(weight.toString()));
                    if (birthdate)
                        profile.set('birthdate', birthdate.toString());
                    if (realname) {
                        profile.set('realname', realname.toString());
                    }
                    if (avatarhash && avatar) {
                        profile.set('avatar', avatar.toString());
                        profile.set('avatarhash', parseInt(avatarhash.toString()));

                    }
                    return profile.save(null, {useMasterKey: true});
                } else {
                    res.error(errors["internalError"], i18n.__("internalError"));
                    ParseLogger.log("warn", "Not found the profile", {"req": req});
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (profile) {
                res.success({});
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors[err], i18n.__(err));
            });
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(i18n.__("invalidSession"));
        return;
    });
};
exports.getUserProfile =  function (req, res) {
    commonFunc.setI18n(req, i18n);
    var bandName = req.params.bandname;
    var userName = req.params.username;
    var phoneNumber = req.params.phonenumber;
    var avatarhash = req.params.avatarhash;
    var band;
    if (!bandName && !phoneNumber) {
        ParseLogger.log("warn", "Not provide the bandName or phoneName", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    if (typeof req.params.bandname === "undefined" && typeof req.params.phonenumber === "undefined") {
        ParseLogger.log("warn", "Not provide the bandname or phonenumber", {"req": req});
        res.error(errors["invalidParameter"], i18n.__("invalidParameter"));
        return;
    }
    var updateType = "band";
    if (typeof req.params.bandname === "undefined") {
        updateType = "phone";
    }

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            res.error(errors["invalidSession"], i18n.__("invalidSession"));
            return;
        } else {
            Parse.Cloud.useMasterKey();
            Parse.User.enableUnsafeCurrentUser();
            var query = null;
            if (updateType === "band") {
                query = new Parse.Query(BandUser);
                query.equalTo('bandName', bandName);
                query.ascending('createdAt');
            } else {
                query = new Parse.Query(PhoneUser);
                query.equalTo('phoneNo', phoneNumber);
                query.ascending('createdAt');
            }
            query.first({
                useMasterKey: true
            }).then(function (b) {
                // If not, create a new user.
                if (!b) {
                    ParseLogger.log("warn", "Cannot find the band", {"req": req});
                    return (updateType === "band" ? res.error(errors["noBandFound"], i18n.__("noBandFound"))
                        :
                        res.error(errors["noPhoneFound"], i18n.__("noPhoneFound")));
                }
                band = b;
                //     return b.get('user').fetch();
                // }).then(function (user) {
                if (band.get('profile')) {
                    var profile = band.get('profile');
                    return profile.fetch();
                } else {
                    return Parse.Promise.as();
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            }).then(function (profile) {
                if (!profile) {
                    res.success({
                        name: band.bandName,
                        city: '上海',
                        height: -1,
                        birthdate: "",
                        sex: -1,
                        weight: -1,
                        avatar: "",
                        realname: ""
                    });
                } else {
                    var finalRealName = (typeof profile.get('realname') === "undefined") ? "" : profile.get('realname');
                    res.success({
                        name: band.get('bandName'),
                        city: '上海',
                        height: typeof profile.get('height') === "undefined" ? "" : profile.get('height'),
                        birthdate: typeof profile.get('birthdate') === "undefined" ? "" : profile.get('birthdate'),
                        sex: typeof profile.get('sex') === "undefined" ? "" : profile.get('sex'),
                        weight: typeof profile.get('weight') === "undefined" ? "" : profile.get('weight'),
                        avatar: profile.get('avatarhash') === avatarhash ? "" : profile.get('avatar'),
                        realname: finalRealName

                    })
                    ;
                }
            }, function (err) {
                ParseLogger.log("error", err, {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
            });
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        res.error(errors[err], i18n.__(err));
        return;
    });
};