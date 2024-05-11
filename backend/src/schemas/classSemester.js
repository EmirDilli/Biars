const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSemesterSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
  name: String,

  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }],
  tas: [{ type: mongoose.Schema.Types.ObjectId, ref: "TA" }],
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassPortfolio",
    unique: true,
    sparse: true,
  },
  exams: [
    {
      assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
      weight: Number,
    },
  ],
  homeworks: [
    {
      assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
      weight: Number,
    },
  ],
  quizzes: [
    {
      assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
      weight: Number,
    },
  ],
  projects: [
    {
      assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
      weight: Number,
    },
  ],

  assessments: [ // add assessment here
    {
      assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
      weight: Number,
    },
  ],
});
const ClassSemester = mongoose.model("ClassSemester", classSemesterSchema);

module.exports = ClassSemester;
