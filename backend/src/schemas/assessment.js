const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assessmentSchema = new Schema({
  name: String,
  date: Date,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSemester' , required: false},
  type:  { type: String, enum: ['exam', 'final', 'quiz', 'homework', 'project'], required: false},
  questions: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    weight: Number,
    max: Number
  }],
  answerKey: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer', required: false }]
});

const Assessment = mongoose.model("Assessment", assessmentSchema);

module.exports = Assessment;


