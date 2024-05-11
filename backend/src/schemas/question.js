// Question Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  url: String, // Assuming file type is Buffer
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  topics: [String],
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
