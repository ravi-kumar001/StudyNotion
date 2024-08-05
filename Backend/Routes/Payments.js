const express = require("express");
const { capturePament, verifySignature } = require("../Controllers/Payments");
const { auth, isStudent } = require("../middlewares/Auth");
const router = express.Router();

router.get("capture-payment", auth, isStudent, capturePament);
router.get("verify-signature", verifySignature);

module.exports = router;
