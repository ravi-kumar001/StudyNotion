const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategory,
  categoryPageDetails,
} = require("../Controllers/Category");
const {isAdmin} = require("../middlewares/Auth");

router.get("/", getAllCategory);
router.post("/", isAdmin , createCategory);

module.exports = router;
