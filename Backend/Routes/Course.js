const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllPublishedCourses,
} = require("../Controllers/Course");

const {
  createCategory,
  getAllCategories,
  getAllCategoryCourses,
} = require("../Controllers/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../Controllers/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../Controllers/SubSection");

const {
  createRating,
  getAverageRating,
  getAllRatingAndReviews,
} = require("../Controllers/RatingAndReviews");

const { auth, authorize } = require("../middlewares/Auth");

// Course created by Instructor only
router
  .get("/", getAllPublishedCourses)
  .post(auth, authorize("Instructor"), createCourse);

// add a section to a course
router.post("/createsection", auth, authorize("Instructor"), createSection);
router.post("/updatesection", auth, authorize("Instructor"), updateSection);
router.post("/deletesection", auth, authorize("Instructor"), deleteSection);

// SubSection Route
router.post(
  "/createSubSection",
  auth,
  authorize("Instructor"),
  createSubSection
);

router.post(
  "/updateSubSection",
  auth,
  authorize("Instructor"),
  updateSubSection
);

router.post(
  "/deleteSubSection",
  auth,
  authorize("Instructor"),
  deleteSubSection
);

// Course Route
router.get("/getAllCours", getAllCategories);
router.get("/get-course-details", getAllCategoryCourses);

// Category Route
router.post("/createCategory", createCategory);
router.get("/getAllCategory", getAllCategories);
router.post("categoryPageDetails", getAllCategoryCourses);

// Rating and reviews
router.post("createRating", auth, authorize("Student"), createRating);
router.get("getAverageRating", getAverageRating);
router.get("getAllRatingAndReviews", getAllRatingAndReviews);

module.exports = router;
