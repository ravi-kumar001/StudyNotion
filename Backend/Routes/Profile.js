const express = require("express");
const router = express.Router();
const { updateProfile } = require("../Controllers/Profile");
const { auth } = require("../middlewares/Auth");

router.put("/", auth, updateProfile);

module.exports = router;
