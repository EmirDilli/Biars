const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({

    url: {type: String, required: true},
    solution: {type:String, required: false}, // Assuming file type is Buffer
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required:false},
    topics:{type: [String], required:false} 


});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
