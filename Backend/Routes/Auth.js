const express = require("express");
const {
  login,
  changePassword,
  sendOTP,
  logout,
  forgotPassword,
  signup,
} = require("../Controllers/Auth");
const {
  resetPassword,
  resetPasswordToken,
} = require("../Controllers/ResetPassword");
const { auth } = require("../middlewares/Auth");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/sendotp", sendOTP);
router.post("/logout",logout);
router.put("/changepassword", auth, changePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);

module.exports = router;
