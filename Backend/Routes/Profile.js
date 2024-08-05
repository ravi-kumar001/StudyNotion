const express = require("express");
const {
  updateProfile,
  deleteAccount,
  getAllUserDetails,
  getEnrolledCourses,
  updateDisplayPicture,
} = require("../Controllers/Profile");
const { auth } = require("../middlewares/Auth");
const router = express.Router();

router.put("/update-profile", auth, updateProfile);
router.delete("/delete-account", auth, deleteAccount);
router.get("/get-all-user-details", auth, getAllUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports = router;
