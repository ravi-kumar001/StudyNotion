const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getAllCategoryCourses,
} = require("../Controllers/Category");
const { auth, adminAuthorization } = require("../middlewares/Auth");

router.get("/", getAllCategories);
router.post("/getcategorycourses", getAllCategoryCourses);
router.post("/", auth, adminAuthorization(), createCategory);

module.exports = router;
