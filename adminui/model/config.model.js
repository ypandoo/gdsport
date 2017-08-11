var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
    alias: String,
    name: String,
    value: String
});

var model = mongoose.model("configinfos", schema);

module.exports = model;