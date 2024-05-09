const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assessmentSchema = new mongoose.Schema({
  name: String,
  date: Date,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "ClassSemester" },
  type: {
    type: String,
    enum: ["exam", "final", "quiz", "homework", "project"],
    required: true,
  },
  questions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      weight: Number,
      max: Number,
    },
  ],
  answerKey: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
});
const Assessment = mongoose.model("Assessment", assessmentSchema);

module.exports = Assessment;
