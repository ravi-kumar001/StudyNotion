const mongoose = require("mongoose");
const { courseSchema } = require("../Schema/schema");

const Course = mongoose.model("Course", courseSchema);
module.exports = { Course };
