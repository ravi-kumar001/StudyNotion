const mongoose = require("mongoose");
const { Schema } = mongoose;

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subSections: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
});

const Section = mongoose.model("Section", sectionSchema);

module.exports = { Section };
