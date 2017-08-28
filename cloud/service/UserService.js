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
const RegisterLogs = Parse.Object.extend("registerlogs");
const BandUser = Parse.Object.extend("BandUser");
const UserProfile = Parse.Object.extend("UserProfile");
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
        return res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
    }
    let password = req.params.password;
    let smsCode = req.params.authcode;

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
    commonFunc.validSmsCode(phoneNumber, smsCode).then(function (smsCodeRet) {
        // validate if the SMS code is correct and not expired
        if (smsCodeRet === null || !smsCodeRet) {
            ParseLogger.log("warn", i18n.__("invalidSmsCode"), {"req": req});
            res.error(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
            return Parse.Promise.reject(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
        } else {
            let userQuery = new Parse.Query(Parse.User);
            userQuery.equalTo('username', phoneNumber.toString());
            return userQuery.first({useMasterKey: true});
        }
    }, function (errMsg) {
        ParseLogger.log("error", errMsg, {"req": req});
        res.error(errors[errMsg], i18n.__(errMsg));
        return Parse.Promise.reject(errMsg);
    }).then(function (phoneUser) {
        // validate if the phone number has been registered
        if (phoneUser) {
            ParseLogger.log("warn", i18n.__("phoneNbExist"), {"req": req});
            res.error(errors["phoneNbExist"], i18n.__("phoneNbExist"));
            return Parse.Promise.reject(i18n.__("phoneNbExist"));
        } else {
            // todo create user with phone number directly
            signUpAllNewPhoneUser(req, res, phoneNumber, password);
            //reject("user should be created directly");
        }
    });
};


exports.resetPassword = function (req, res) {
    commonFunc.setI18n(req, i18n);
    var phoneNumber = req.params.phonenum;
    phoneNumber = phoneNumber.replace(/\D/g, '');

    if (typeof req.installationId === "undefined" || !req.installationId) {
        ParseLogger.log("warn", i18n.__("noInstallationId"), {"req": req});
        res.error(errors["noInstallationId"], i18n.__("noInstallationId"));
        return;
    }
    var password = req.params.password;
    var smsCode = req.params.authcode;
    var newSession;

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

    let renewUser = null;
    commonFunc.validSmsCode(phoneNumber, smsCode).then(function (smsInfo) {
        if (!smsInfo || smsInfo === null) {
            ParseLogger.log("warn", i18n.__("invalidSmsCode"), {"req": req});
            res.error(errors["invalidSmsCode"], i18n.__("invalidSmsCode"));
            return Parse.Promise.reject("the SMS code is invalid or expired");
        } else {
            Parse.User.enableUnsafeCurrentUser();
            var phoneUserQuery = new Parse.Query(Parse.User);
            phoneUserQuery.equalTo("username", phoneNumber);
            return phoneUserQuery.first({useMasterKey: true});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        return res.error(errors[err], i18n.__(err));
    }).then(function (phUser) {
        if (!phUser) {
            ParseLogger.log("error", "Failed to find the phone user", {"req": req});
            res.error(errors["noUser"], i18n.__("noUser"));
            return reject("Failed to find out the  user");
        } else {
            Parse.User.enableUnsafeCurrentUser();
            var prelUser = phUser;
            prelUser.setPassword(password);
            return prelUser.save(null, {useMasterKey: true});
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        return res.error(errors['internalError'], i18n.__('internalError'));
    })
    .then(function (user) {
        if (!user) {
            ParseLogger.log("error", "Failed to save the parse user", {"req": req});
            res.error(errors["noUserFound"], i18n.__("noUserFound"));
            return Parse.Promise.reject("Save the password failed");
        } else {
            return Parse.User.logIn(phoneNumber, password);
            //return commonFunc.storeAfterSignup(req, user, user.get("username"), password, i18n);
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        return res.error(errors['internalError'], i18n.__(err));
    })
    .then(function (user) {
        if (!user) {
            ParseLogger.log("error", "Failed to save the parse user", { "req": req });
            res.error(errors["noUserFound"], i18n.__("noUserFound"));
            return Parse.Promise.reject("Save the password failed");
        } else 
        {
            //newSession = user.getSessionToken();
            return commonFunc.storeAfterSignup(req, user, user.get("username"), password, i18n);
        }
            
    }, function (err) {
        ParseLogger.log("error", err, { "req": req });
        return res.error(errors['internalError'], i18n.__(err));
    })
    .then(function (regLog) {
        if (!regLog) {
                ParseLogger.log("error", "Failed to save the register log", {"req": req});
                return res.error(errors["internalError"], i18n.__(internalError));
            } else {
                return res.success({ username: phoneNumber, sessionToken: newSession});
            }
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            return res.error(errors["internalError"], i18n.__(error));
    })
};


/**
 * just phone user can login
 */
exports.signin = function (req, res) {
    commonFunc.setI18n(req,i18n);
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
        let phoneUserQuery = new Parse.Query(User);
        phoneUserQuery.equalTo("username", phoneNumber.toString());
        phoneUserQuery.first({useMasterKey: true}).then(function (phoneUser) {
            if (!phoneUser) {
                ParseLogger.log("error", "Failed to find out the user with the password and username", {"req": req});
                res.error(errors["loginFailed"], i18n.__("loginFailed"));
                return Parse.Promise.reject("loginFailed");
            } else {
                return phoneUser;
            }
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["loginFailed"], i18n.__("loginFailed"));
            return Parse.Promise.reject("loginFailed");
        }).then(function (sUser) {
            if (!sUser) {
                ParseLogger.log("error", "Faild to find the user by user id", {"req": req});
                res.error(errors["internalError"], i18n.__("internalError"));
                return Parse.Promise.reject("noUserFound");
            } else {
                let userName = sUser.get("username");
                return Parse.User.logIn(userName, password);
            }
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            return Parse.Promise.reject("Failed to find the user");
        }).then(function (nUser) {
            if (!nUser) {
                ParseLogger.log("error", "Failed to login the user", {"req": req});
                return res.error(errors["loginFailed"], i18n.__("loginFailed"));
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
                return commonFunc.storeAfterLogin(req, nUser);
            }
        }, function (err) {
            ParseLogger.log("error", err, {"req": req});
            res.error(errors["loginFailed"], i18n.__("loginFailed"));
            return;
        });

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
    let user = new Parse.User();
    user.setUsername(phoneNo, {useMasterKey: true});
    user.setPassword(password, {useMasterKey: true});
    user.signUp(null, {useMasterKey: true}).then(function (newUser) {
        if (!newUser) {
            ParseLogger.log("error", "Failed to create user", {"req": req});
            res.error(errors["internalError"], i18n.__("internalError"));
            return Parse.Promise.reject(i18n.__("internalError"));
        } else {
            sessionToken = newUser.getSessionToken();
            retUserName = newUser.getUsername();
            retObjectId = newUser.id;
            retCreatedAt = newUser.createdAt;

            commonFunc.storeAfterLogin(req, user);
            //commonFunc.refreshToken(retUserName, sessionToken);
            let ret = {};
            ret.token = sessionToken;
            ret.username = retUserName;
            return res.success(ret);
        }
    }, function (err) {
        ParseLogger.log("error", err, {"req": req});
        return res.error(errors["internalError"], i18n.__("internalError"));
    });
};

exports.updateUserProfile = function (req, res) {
    commonFunc.setI18n(req, i18n);

    var phoneNumber = req.params.username;
    var height = req.params.height;
    var sex = req.params.sex;
    var birthdate = req.params.birthdate;
    var nickname = req.params.nickname;
    var weight = req.params.weight;
    var avatar = req.params.avatar;
    var avatarhash = req.params.avatarhash;

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            return res.error(errors["invalidSession"], i18n.__("invalidSession"));
        } else {
            Parse.User.enableUnsafeCurrentUser();
            var band;
            var query = null;

            query = new Parse.Query(Parse.User);
            query.equalTo('username', phoneNumber);
            query.first({
                useMasterKey: true
            }).then(function (b) {
                // If not, create a new user.
                if (!b) {
                    ParseLogger.log("warn", "Failed to find the bind", {"req": req});
                    return res.error(errors["noDeviceFound"], i18n.__("noDeviceFound"));
                }
                band = b;
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
                res.error(errors[err], i18n.__(err));
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
                    if (nickname) 
                        profile.set('nickname', nickname.toString());
                     
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
                res.error(errors[err], i18n.__(err));
            }).then(function (profile) {
                res.success({ 'username': phoneNumber});
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
    var phoneNumber = req.params.username;
    var avatarhash = req.params.avatarhash;
    var band;

    commonFunc.isSessionLegal(req, i18n).then(function (regLog) {
        if (!regLog) {
            ParseLogger.log("warn", "Failed to valid from the register log", {"req": req});
            return res.error(errors["invalidSession"], i18n.__("invalidSession"));
        } else {
            Parse.User.enableUnsafeCurrentUser();
            var query = null;
            query = new Parse.Query(User);
            query.equalTo('username', phoneNumber);
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
                    var nickname = (typeof profile.get('nickname') === "undefined") ? "" : profile.get('nickname');
                    res.success({
                        username: phoneNumber,
                        //city: '上海',
                        height: typeof profile.get('height') === "undefined" ? "" : profile.get('height'),
                        birthdate: typeof profile.get('birthdate') === "undefined" ? "" : profile.get('birthdate'),
                        sex: typeof profile.get('sex') === "undefined" ? "" : profile.get('sex'),
                        weight: typeof profile.get('weight') === "undefined" ? "" : profile.get('weight'),
                        avatar: profile.get('avatarhash') === avatarhash ? "" : profile.get('avatar'),
                        avatarhash: profile.get('avatarhash') === "undefined" ? "" : profile.get('avatarhash'),
                        nickname: nickname

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