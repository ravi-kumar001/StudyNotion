const express = require("express");
const router = express.Router();
const { contactUs } = require("../Controllers/Other");

router.post("/contactus", contactUs);

module.exports = router;
