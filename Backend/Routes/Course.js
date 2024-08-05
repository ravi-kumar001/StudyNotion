const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourse,
  getCourseDetails,
} = require("../Controllers/Course");
const {
  createCategory,
  getAllCategory,
  categoryPageDetails,
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
const {
  auth,
  isAdmin,
  isStudent,
  isInstructor,
} = require("../middlewares/Auth");

// Course created by Instructor only
router.post("/create-course", auth, isInstructor, createCourse);

// add a section to a course
router.post("/createsection", auth, isInstructor, createSection);
router.post("/updatesection", auth, isInstructor, updateSection);
router.post("/deletesection", auth, isInstructor, deleteSection);

// SubSection Route
router.post("/createSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

// Course Route
router.get("/getAllCours", getAllCourse);
router.get("/get-course-details", getCourseDetails);

// Category Route
router.post("/createCategory", createCategory);
router.get("/getAllCategory", getAllCategory);
router.post("categoryPageDetails", categoryPageDetails);

// Rating and reviews
router.post("createRating", auth, isStudent, createRating);
router.get("getAverageRating", getAverageRating);
router.get("getAllRatingAndReviews", getAllRatingAndReviews);

module.exports = router;
