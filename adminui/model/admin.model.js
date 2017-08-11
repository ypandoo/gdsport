var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
    name: String,
    password: String,
    realName: String,
    createTime: Date,
    lastTime: Date
});

var model = mongoose.model("admininfos", schema);

module.exports = model;