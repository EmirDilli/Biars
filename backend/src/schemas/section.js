// Question Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sectionSchema = new mongoose.Schema({
  classSemester: { type: mongoose.Schema.Types.ObjectId, ref: "ClassSemester" },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
  schedule: [String],
  location: String,
  enrollment: Number,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});
const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
