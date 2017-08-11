/**
 * Created by yuhailong on 29/11/2016.
 */
/**
 * Attention: strictly want to import the Parse.js from the parse support
 * eg:
 * var Parse = null;
 require(['js/activity/parse'], function () {
        Parse = require("js/activity/parse");
        Parse.initialize("appworld-cibxdl");
        Parse.serverURL = "http://127.0.0.1:20371/parse";
        console.log("Parse initialized ok");
   });

 It is also need to import the mathUtil.js

 */

var ParseUtilFile = function () {
};

ParseUtilFile.prototype.callback = null;
ParseUtilFile.prototype.cnt = 0;
ParseUtilFile.prototype.srcList = [];
ParseUtilFile.prototype.retList = [];

ParseUtilFile.prototype.handle = function (srcs, cb) {
    this.srcList = srcs;
    this.callback = cb;
    this.cnt = 0;
    this.retList = [];
    console.log(this.srcList.length);
    this.handleSingle();
};

ParseUtilFile.prototype.handleSingle = function () {
    var myInst = this;
    var mokeName = "tmp_" + myInst.getRandom(9999, 1);
    Parse.Cloud.useMasterKey();
    var parseFile = new Parse.File(mokeName, {base64: myInst.srcList[myInst.cnt]});
    parseFile.save({useMasterKey: true}).then(function (obj) {
        //console.log("File Url:" + parseFile.url());
        myInst.retList.push(parseFile.url());
        myInst.cnt++;
        //console.log(myInst.cnt);
        if (myInst.cnt >= myInst.srcList.length) {
            myInst.callback(myInst.retList);
            return;
        }
        myInst.handleSingle();
    }, function (err) {
        myInst.callback(null);
        console.log(err);
    });

};


ParseUtilFile.prototype.getRandom = function (max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}