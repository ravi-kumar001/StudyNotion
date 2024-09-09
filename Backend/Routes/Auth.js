const express = require("express");
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
const { auth, adminAuthorization } = require("../middlewares/Auth");
const router = express.Router();

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
