const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dmSchema = new Schema({
  user_id_1: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  user_id_2: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  messages: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Message" }],
  workspace: { type: mongoose.SchemaTypes.ObjectId, ref: "Workspace" },
});

const Dm = mongoose.model("Dm", dmSchema);

module.exports = Dm;
