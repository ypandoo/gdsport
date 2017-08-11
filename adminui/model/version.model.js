var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
    name: String,
    type: String,
    updatedAt: Date,
    url: String,
    forceUpdate: Boolean,
    releaseDate: Date,
    current: Boolean,
    memo: String,
    createdAt: Date
});

var model = mongoose.model("versioninfos", schema);

module.exports = model;