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

// Route for user registration
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP);

router.post("/logout",logout);

// Change password
router.post("/changepassword", auth, changePassword);

router.post('/forgotpassword', forgotPassword);

// Route for reseting password
router.put('/resetpassword', resetPassword);

module.exports = router;
