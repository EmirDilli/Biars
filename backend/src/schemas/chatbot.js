const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let chatbotSchema = new Schema({
    sources: {
        type: [String],
        required: true
    },
    countOfSources: {
        type: Number,
        required: true
    },
    relatedCourse: {
        type: String,
        required: true
    },
    chatbotType: {
        type: Number, 
        required: true
    }
}, {timestamps: true});

let chatbotDB = mongoose.model("chatbotDB", chatbotSchema);


module.exports = chatbotDB;