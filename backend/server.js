const fs = require("fs");
const http = require("http");
const process = require("process");

const OpenAI = require("openai");
const express = require("express");
const { connectDb } = require("./db");
const { Keys, Message } = require("./schema");

const app = express();
app.use(express.json()); // <==== parse request body as JSON

connectDb();

app.get("/apikey", async function (req, res) {
  const keys = await Keys.find({ key: "openai" });

  console.log("get api key: ", keys[0] || "");
  res.send(keys[0] || "");
});

app.post("/apikey", async function (req, res) {
  console.log("post api key: ", req.body.value);
  const key = new Keys({
    key: "openai",
    value: req.body.value,
  });
  await key.save();
  res.send({ message: "success" });
});

app.get("/messages", async function (req, res) {
  const history = await Message.find({}).sort({ createdAt: -1 });

  res.send(history.map((message) => message));
});

app.post("/messages", async function (req, res) {
  const openaiKey = await Keys.find({ key: "openai" });

  if (!openaiKey.length) {
    res.status(500).send({ message: "no openai key" });
    return;
  }

  console.log("post message: ", req.body, "api key: ", openaiKey[0].value);

  const openai = new OpenAI({
    apiKey: openaiKey[0].value,
  });

  const userMessage = new Message({
    role: req.body.role,
    content: req.body.content,
    createdAt: Date.now(),
  });
  await userMessage.save();

  const history = await Message.find({}).sort({ createdAt: -1 });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: history.map((message) => ({
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
  res.send({ message: response.choices[0].message });
});

var sock = process.argv[2];

fs.stat(sock, function (err) {
  if (!err) {
    fs.unlinkSync(sock);
  }
  http.createServer(app).listen(sock, function () {
    fs.chmodSync(sock, "777");
    console.log("Express server listening on " + sock);
  });
});
