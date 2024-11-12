const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const {
  createOrder,
  verifyPaymentSignature,
  sendPaymentSuccessEmail,
} = require("../Controllers/Payments");

router.post("/createorder", auth, authorize("Student"), createOrder);
router.post(
  "/verifypaymentsignature",
  auth,
  authorize("Student"),
  verifyPaymentSignature
);
router.post('/sendpaymentsuccessemail', auth, authorize('Student'), sendPaymentSuccessEmail);

module.exports = router;
