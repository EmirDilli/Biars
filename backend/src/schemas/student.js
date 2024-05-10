const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  classes: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Section" }],
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
