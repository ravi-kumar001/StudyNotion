const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ["Male", "Female", "Non-Binary", "Prefer not to say", "Other", null],
    // default: null,
  },
  dob: {
    type: String,
    // default: null,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
    min: [10, "Mobile no. should be 10 digits"],
  },
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = { Profile };
