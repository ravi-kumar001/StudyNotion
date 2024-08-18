const express = require("express");
const {
  register,
  login,
  changePassword,
  sendOTP,
} = require("../Controllers/Auth");
const {
  resetPassword,
  resetPasswordToken,
} = require("../Controllers/ResetPassword");
const { auth } = require("../middlewares/Auth");
const router = express.Router();

// Route for user registration
router.post("/signup", register);

// Route for user login
router.post("/login", login);

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP);

// Change password
router.post("/changepassword", auth, changePassword);

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for reseting password
router.post("/reset-password", resetPassword);

module.exports = router;
