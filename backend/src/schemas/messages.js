const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
  sender_id: mongoose.SchemaTypes.ObjectId,
  receiver_id: mongoose.SchemaTypes.ObjectId,
  date: mongoose.SchemaTypes.Date,
  text: mongoose.SchemaTypes.String,
});

const Message = mongoose.model("Message", messagesSchema);

module.exports = Message;
