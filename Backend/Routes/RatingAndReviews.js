const express = require("express");
const router = express.Router();

const {
  createRating,
  getAverageRating,
  getReviewsOfCourse,
  getAllRatingAndReviews,
} = require("../Controllers/RatingAndReviews");

router.post('/getreviewsofcourse', getReviewsOfCourse);
router.get("/getallreviews", getAllRatingAndReviews);
router.post("/create-rating", createRating);
router.get("/average-rating", getAverageRating);

module.exports = router;
