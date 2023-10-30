const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  role: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const keysSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const Message = mongoose.model("Message", chatSchema);
const Keys = mongoose.model("Keys", keysSchema);

module.exports = { Keys, Message };
