const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taSchema = new Schema({});

const Ta = mongoose.model("TA", taSchema);

module.exports = Ta;
