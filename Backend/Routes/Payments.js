const express = require("express");
const {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
} = require("../Controllers/Payments");
const { auth, isStudent } = require("../middlewares/Auth");
const router = express.Router();

router.post("capture-payment", auth, isStudent, capturePayment);
router.post("verify-payment", auth, isStudent, verifyPayment);
router.post(
  "sent-payment-success-email",
  auth,
  isStudent,
  sendPaymentSuccessEmail
);

module.exports = router;
