const mongoose = require("mongoose");

const url = "mongodb://mongo:27017/extension";

const connectDb = async () => {
  await mongoose.connect(url);
  console.log("mongodb connected");
};

module.exports = {
  connectDb,
};
