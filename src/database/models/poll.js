const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  title: String,
  question: String,
  pollId: String,
  options: [String],
  expiry: Date,
});

const Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;
