const fs = require("fs");
const http = require("http");
const process = require("process");
const express = require("express");
const morgan = require("morgan");
const OpenAI = require("openai");
const mongoose = require("mongoose");

const app = express();
app.use(express.json()); // <==== parse request body as JSON
app.use(morgan("tiny")); // <==== log HTTP requests

// initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB connection
const mongoDBUrl = "mongodb://mongo:27017/extension";
const connectDb = async () => {
  await mongoose.connect(mongoDBUrl);
  console.log("mongodb connected");
};

connectDb();

// MongoDB chat message model
const chatSchema = new mongoose.Schema({
  role: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", chatSchema);

// Get the list of chat messages in the DB
app.get("/messages", async function (req, res) {
  const chat = await Message.find({}).sort({ createdAt: 1 });
  res.send(chat.map((message) => message));
});

// Saves the user message in the DB, queries OpenAI, saves response and returns the chat history
app.post("/messages", async function (req, res) {
  const userMessage = new Message({
    role: req.body.role,
    content: req.body.content,
    createdAt: Date.now(),
  });
  await userMessage.save();

  let chat = await Message.find({}).sort({ createdAt: 1 });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: chat.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  });

  const chatgptMessage = new Message({
    role: response.choices[0].message.role,
    content: response.choices[0].message.content,
    createdAt: Date.now(),
  });
  await chatgptMessage.save();
  // refetch list of messages
  chat = await Message.find({}).sort({ createdAt: 1 });

  res.send(chat.map((message) => message));
});

// Start the server

const sock = process.argv[2];

fs.stat(sock, function (err) {
  if (!err) {
    fs.unlinkSync(sock);
  }
  http.createServer(app).listen(sock, function () {
    fs.chmodSync(sock, "777");
    console.log("Express server listening on " + sock);
  });
});
