const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const solutionSchema = new Schema({
    
  url: {type : String, required: true},
  ofQuestion: { type: String, required: true }

});

const Solution = mongoose.model("Solution", solutionSchema);

module.exports = Solution;