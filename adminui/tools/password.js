/**
 * Created by yuhailong on 14/12/2016.
 */
var crypt = require("bcrypt-nodejs");

var Password = {
    hash: function (password) {
        return new Promise(function (resolve, reject) {
            crypt.hash(password, null, null, function (err, hashedPassword) {
                if (err) {
                    reject(err);
                }
                resolve(hashedPassword);
            });
        });
    },
    verify: function (password, hashedPassword) {
        return new Promise(function (resolve, reject) {
            crypt.compare(password, hashedPassword, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
}

module.exports = Password;