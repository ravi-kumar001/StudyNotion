const express = require("express");
const router = express.Router();

const {
  createRating,
  getAverageRating,
  getAllRatingAndReviews,
} = require("../Controllers/RatingAndReviews");

router.get("/getallreviews", getAllRatingAndReviews);
router.post("/create-rating", createRating);
router.get("/average-rating", getAverageRating);

module.exports = router;
