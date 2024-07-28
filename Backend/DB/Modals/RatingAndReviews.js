const mongoose = require("mongoose");
const { ratingAndReviewsSchema } = require("../Schema/schema");

const RatingAndReviews = mongoose.model(
  "RatingAndReviews",
  ratingAndReviewsSchema
);
module.exports = { RatingAndReviews };
