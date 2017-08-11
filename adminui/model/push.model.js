var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
    messageId: String,
    sendNo: Number,
    title: String,
    message: String,
    time: Date
});

var model = mongoose.model("pushinfos", schema);

module.exports = model;