const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelSchema = new Schema({
  name: mongoose.SchemaTypes.String,
  messages: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Message" }],
  workspace: { type: mongoose.SchemaTypes.ObjectId, ref: "Workspace" },
  users: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
});

const Channel = mongoose.model("Channel", channelSchema);

module.exports = Channel;
