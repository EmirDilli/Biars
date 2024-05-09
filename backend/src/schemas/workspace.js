const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workpsaceSchema = new Schema({
  name: { type: String, required: true },
  dms: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Dm" }],
  users: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
  isPublic: mongoose.SchemaTypes.Boolean,
  invited_users: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
});

const Workspace = mongoose.model("Workspace", workpsaceSchema);

module.exports = Workspace;
