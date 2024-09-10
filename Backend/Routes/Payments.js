const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const {
  // createOrder,
  // verifyPaymentSignature,
  enrolledStudent,
  // sendPaymentSuccessEmail,
} = require("../Controllers/Payments");

// router.post("/createorder", auth, authorize("Student"), createOrder);
router.post(
  "/verifypaymentsignature",
  auth,
  authorize("Student"),
  enrolledStudent
);
// router.post('/sendpaymentsuccessemail', protect, authorize('Student'), sendPaymentSuccessEmail);

module.exports = router;
