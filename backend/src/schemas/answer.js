const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  file: Buffer,
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
