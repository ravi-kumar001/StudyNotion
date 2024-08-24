const express = require("express");
const router = express.Router();
const { auth, isStudent, isInstructor } = require("../middlewares/Auth");
const {
  currentUser,
  changeAvatar,
  deleteCurrentUser,
} = require("../Controllers/User");

router.get("/currentuser", auth, currentUser);
router.put("/changeavatar", auth, isStudent, changeAvatar);
router.delete(
  "/deletecurrentuser",
  auth,
  isStudent,
//   isInstructor,
  deleteCurrentUser
);

module.exports = router;
