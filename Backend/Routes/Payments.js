const express = require("express");
const {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
} = require("../Controllers/Payments");
const { auth, authorize } = require("../middlewares/Auth");
const router = express.Router();

router.post("capture-payment", auth, authorize("Student"), capturePayment);
router.post("verify-payment", auth, authorize("Student"), verifyPayment);
router.post(
  "sent-payment-success-email",
  auth,
  authorize("Student"),
  sendPaymentSuccessEmail
);

module.exports = router;
