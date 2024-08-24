const mongoose = require("mongoose");
const { sectionSchema } = require("../Schema/schema");

const Section = mongoose.model("Section", sectionSchema);

module.exports = { Section };
