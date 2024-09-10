const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const {
  createCourse,
  getEnrolledCourseData,
  getCourse,
  editCourse,
  deleteCourse,
  getFullCourseDetails,
  getAllPublishedCourses,
} = require("../Controllers/Course");

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
router.post(
  "/getenrolledcoursedata",
  auth,
  authorize("Student"),
  getEnrolledCourseData
);

module.exports = router;
