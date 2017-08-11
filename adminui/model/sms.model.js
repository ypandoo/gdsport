var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
    phoneNo: String,
    data: String,
    sendTime: Date,
    expireTime: Date
});

var model = mongoose.model("smsinfos", schema);

module.exports = model;