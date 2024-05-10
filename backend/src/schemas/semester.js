const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const semesterSchema = new mongoose.Schema({
  semesterId: {
    type: String,
    required: true,
    unique: true, // Ensure that each semester identifier is unique
  },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ["active", "completed"], default: "active" },
  classSemesters: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "ClassSemester",
    },
  ],
  weeks: [
    {
      weekId: Number,
      startDate: mongoose.SchemaTypes.Date,
      endDate: mongoose.SchemaTypes.Date,
    },
  ],
});

const Semester = mongoose.model("Semester", semesterSchema);

module.exports = Semester;
