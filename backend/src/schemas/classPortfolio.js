const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classPortfolioSchema = new mongoose.Schema({
  classSemester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassSemester",
    unique: true,
  },
  documents: Buffer,
  studentPerformance: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      absents: Number,
      examGrades: [
        {
          total: Number,
          questionsGrades: [Number],
        },
      ],
      quizGrades: [
        {
          total: Number,
          questionsGrades: [Number],
        },
      ],
      homeworkGrades: [
        {
          total: Number,
          questionsGrades: [Number],
        },
      ],
      projectGrades: [
        {
          total: Number,
          questionsGrades: [Number],
        },
      ],

      grades: [ // add NULL here when assessment created
        {
          total: Number,
          questionsGrades: [Number],
        },
      ],

      totalGrade: Number,
      letterGrade: String,
    },
  ],
});
const ClassPortfolio = mongoose.model("ClassPortfolio", classPortfolioSchema);

module.exports = ClassPortfolio;
