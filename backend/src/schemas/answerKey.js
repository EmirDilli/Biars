const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({

    url: {type: String, required: true},
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
   
});

const AnswerSchema = mongoose.model("Answer", answerSchema);

module.exports = AnswerSchema;

// Answer Schema 
