const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
  sender_id: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  receiver_id: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  date: mongoose.SchemaTypes.Date,
  text: mongoose.SchemaTypes.String,
});

const Message = mongoose.model("Message", messagesSchema);

module.exports = Message;
