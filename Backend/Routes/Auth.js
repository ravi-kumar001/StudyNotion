const express = require("express");
const router = express.Router();
const { auth, adminAuthorization } = require("../middlewares/Auth");
const {
  login,
  changePassword,
  sendOTP,
  logout,
  forgotPassword,
  signup,
  resetPassword,
  getMe,
  createAdmin
} = require("../Controllers/Auth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/sendotp", sendOTP);
router.post("/logout", logout);
router.get("/getme", auth, getMe);
router.put("/changepassword", auth, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.post("/createadmin", auth, adminAuthorization, createAdmin);

module.exports = router;
