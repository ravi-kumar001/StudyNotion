const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const {
  getAllReviews,
  getReview,
  getReviewsOfCourse,
  createReview,
  deleteReview
} = require("../Controllers/RatingAndReviews");

router.get("/getallreviews", getAllReviews);
router.post("/getreview", getReview);
router.post("/getreviewsofcourse", getReviewsOfCourse);
router.post("/createreview", auth, authorize("Student"), createReview);
router.delete(
  "/deletereview",
  auth,
  authorize("Student", "Admin"),
  deleteReview
);

module.exports = router;
