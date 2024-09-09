const mongoose = require("mongoose");

const errorSchema = new mongoose.Schema({
  message: { type: String, required: true },
  stack: { type: String },
  statusCode: { type: Number, default: 500 },
  date: { type: Date, default: Date.now },
});

const Error = mongoose.model("Error", errorSchema);

module.exports = { Error };
