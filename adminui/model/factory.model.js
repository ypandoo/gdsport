var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
    bandNo: String,
    citizenID: String,
    citizenName: String,
    gender: String,
    cardNo: String,
    bandName: String,
    createAt: Date,
    updateAt: Date
});

var model = mongoose.model("factoryinfos", schema);

module.exports = model;
