const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middlewares/Auth");
const { markSubSectionAsCompleted } = require("../Controllers/CourseProgress");

router.post(
  "/marksubsectionascompleted",
  auth,
  authorize("Student"),
  markSubSectionAsCompleted
);

module.exports = router;
