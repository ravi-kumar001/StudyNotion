const mongoose = require("mongoose");
const { courseProgress } = require("../Schema/schema");

const CourseProgress = mongoose.model("CourseProgress", courseProgress);

module.exports = { CourseProgress };
