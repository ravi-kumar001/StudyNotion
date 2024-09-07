const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingAndReviewsSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: [1, "Please give rating between 1 and 5"],
    max: [5, "Please give rating between 1 and 5"],
    required: true,
  },
  review: {
    type: String,
    trim: true,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RatingAndReviews = mongoose.model(
  "RatingAndReviews",
  ratingAndReviewsSchema
);

module.exports = { RatingAndReviews };
