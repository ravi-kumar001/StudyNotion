const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllPublishedCourses,
  getCourse,
  editCourse,
  deleteCourse,
  getFullCourseDetails,
} = require("../Controllers/Course");

const { auth, authorize } = require("../middlewares/Auth");

// Course created by Instructor only
router
  .route("/")
  .get(getAllPublishedCourses)
  .post(auth, authorize("Instructor"), createCourse);

router.put("/editcourse", auth, authorize("Instructor"), editCourse);
router.post(
  "/getfullcoursedetails",
  auth,
  authorize("Instructor"),
  getFullCourseDetails
);
router.delete("/deletecourse", auth, authorize("Instructor"), deleteCourse);
router.get("/getcourse/:courseId", getCourse);

module.exports = router;
