const express = require("express");
const router = express.Router();
const { auth, isStudent } = require("../middlewares/Auth");
const { currentUser, changeAvatar } = require("../Controllers/User");

router.get("/currentuser", auth, currentUser);
router.put("/changeavatar", auth, isStudent, changeAvatar);
module.exports = router;
