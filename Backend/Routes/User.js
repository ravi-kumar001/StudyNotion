const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const {
  currentUser,
  changeAvatar,
  deleteCurrentUser,
  getUser,
  getUsers,
  getInstructorDashboardData,
  getCreatedCourses,
  getEnrolledCourses
} = require("../Controllers/User");

router.get("/", auth, authorize("Admin"), getUsers);
router.get("/getuser/:id", auth, authorize("Admin"), getUser);
router.get("/currentuser", auth, currentUser);
router.put(
  "/changeavatar",
  auth,
  authorize("Student", "Instructor"),
  changeAvatar
);
router.delete(
  "/deletecurrentuser",
  auth,
  authorize("Student", "Instructor"),
  deleteCurrentUser
);

router.get(
  "/getcreatedcourses",
  auth,
  authorize("Instructor"),
  getCreatedCourses
);
router.get('/getinstructordashboarddata', auth, authorize('Instructor'), getInstructorDashboardData);
router.get('/getenrolledcourses', auth, authorize('Student'), getEnrolledCourses);

module.exports = router;
