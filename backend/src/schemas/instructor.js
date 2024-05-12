const mongoose = require("mongoose");
const Section = require("./section");
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
  userId: mongoose.SchemaTypes.ObjectId,
  classes: [{ type: mongoose.SchemaTypes.ObjectId, ref: Section }],
});

const Instructor = mongoose.model("Instructor", instructorSchema);

module.exports = Instructor;
