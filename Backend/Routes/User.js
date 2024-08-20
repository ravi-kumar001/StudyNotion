const express = require("express");
const router = express.Router();
const { auth, isStudent } = require("../middlewares/Auth");
const { currentUser } = require("../Controllers/User");

router.get("/currentuser", currentUser);
module.exports = router;
