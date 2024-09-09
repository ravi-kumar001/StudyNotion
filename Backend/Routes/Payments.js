const express = require("express");
const router = express.Router();
const {
  // createOrder,
  // verifyPaymentSignature,
  enrolledStudent,
  // sendPaymentSuccessEmail,
} = require("../Controllers/Payments");
const { auth, authorize } = require("../middlewares/Auth");

// router.post("/createorder", auth, authorize("Student"), createOrder);
router.post(
  "/verifypaymentsignature",
  auth,
  authorize("Student"),
  enrolledStudent
);
// router.post(
//   "/sendpaymentsuccessemail",
//   sendPaymentSuccessEmail
// );

module.exports = router;
