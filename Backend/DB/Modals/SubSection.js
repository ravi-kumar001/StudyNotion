const mongoose = require("mongoose");
const { Schema } = mongoose;

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  timeDuration: {
    type: String,
    default: "0",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  section: {
    type: Schema.Types.ObjectId,
    ref: "Section",
  },
});

const SubSection = mongoose.model("SubSection", subSectionSchema);

module.exports = { SubSection };
