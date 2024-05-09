const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new mongoose.Schema({
  name: String,
  description: String,
  keywords: [String],
  department: String,
  code: String,
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
