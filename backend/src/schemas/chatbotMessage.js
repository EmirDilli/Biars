const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let chatbotMessageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    sentBy: {
        type: Number,
        required: true
    }
});

module.exports = chatbotMessageSchema;