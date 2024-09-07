const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    whatYouWillLearn: {
      type: String,
      required: true,
    },
    sections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
    ratingAndReviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "RatingAndReviews",
      },
    ],
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    numberOfEnrolledStudents: {
      type: Number,
      default: 0,
    },
    studentsEnrolled: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        default: [],
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    // timeDuration will be in seconds
    totalDuration: {
      type: Number,
      required: true,
      default: 0,
    },
    instructions: [String],
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };
