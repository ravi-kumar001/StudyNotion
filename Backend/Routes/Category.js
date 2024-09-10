const express = require("express");
const router = express.Router();
const { auth, adminAuthorization } = require("../middlewares/Auth");
const {
  createCategory,
  getAllCategories,
  getAllCategoryCourses,
} = require("../Controllers/Category");

router.get("/", getAllCategories);
router.post("/getcategorycourses", getAllCategoryCourses);
router.post("/", auth, adminAuthorization(), createCategory);

module.exports = router;
