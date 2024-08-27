const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const { createSection, updateSection, deleteSection } = require("../Controllers/Section");

router.post("/", auth, authorize("Instructor"), createSection);
// router.put("/", auth, authorize("Instructor"), updateSection);
router.delete('/', auth, authorize('Instructor'), deleteSection);

module.exports = router;
