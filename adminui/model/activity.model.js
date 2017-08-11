var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
    title: String,
    duration: String,
    isAvail: Boolean,
    tile1: String,
    tile2: String,
    content: String,
    startAfter: Date,
    endBefore: Date,
    createAt: Date
});

var model = mongoose.model("activityinfos", schema);

module.exports = model;