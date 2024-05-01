const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Number, required: true },
  profileUrl: String,
  bearerToken: String,
  workspaces: [Schema.Types.ObjectId],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
