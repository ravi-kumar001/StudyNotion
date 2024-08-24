const express = require("express");
const { contactUs } = require("../Controllers/Other");
const router = express.Router();

router.post("/contactus", contactUs);

module.exports = router;
