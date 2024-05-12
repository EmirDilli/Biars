const mongoose = require("mongoose");
const chatbotMessageSchema = require("./chatbotMessage.js");


let Schema = mongoose.Schema;


let chatbotChatsSchema = new Schema({
    relatedChatbot: {
        type: String,
        required: true
    },
    messageArray: {
        type: [chatbotMessageSchema],
        required: true
    },
    relatedUser: {
        type: String,
        required: true
    },
    visibleMessages: {
        type: [chatbotMessageSchema],
        required: true
    }
}, {timestamps: true});

let chatbotChatsDB = mongoose.model("chatbotChatsDB", chatbotChatsSchema);

module.exports = chatbotChatsDB;