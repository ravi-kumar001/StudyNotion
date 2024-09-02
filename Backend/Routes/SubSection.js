const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const {
  createSubSection,
  deleteSubSection,
  updateSubSection,
} = require("../Controllers/SubSection");

router.post("/", auth, authorize("Instructor"), createSubSection);
router.put("/", auth, authorize("Instructor"), updateSubSection);
router.delete("/", auth, authorize("Instructor"), deleteSubSection);

module.exports = router;
