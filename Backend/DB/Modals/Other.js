const mongoose = require("mongoose");

const otherSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Other = mongoose.model("Other", otherSchema);

module.exports = { Other };
