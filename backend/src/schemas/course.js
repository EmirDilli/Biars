const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true },
  semester: { type: String, required: true },
  instructors: [{ type: String, required: true }], 
  assessments: [{type: String, required : false}],  // id of the assessments that the course has 
  studentCount: {type:Number, required : true},
  maxNumberOfStudents: {type: Number, required: true}
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;