const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseProgress = new mongoose.Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  completedVideos: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
});

const CourseProgress = mongoose.model("CourseProgress", courseProgress);

module.exports = { CourseProgress };
