const express = require("express");
const { auth, authorize } = require("../middlewares/Auth");
const { markSubSectionAsCompleted } = require("../Controllers/CourseProgress");
const router = express.Router();

router.post(
  "/marksubsectionascompleted",
  auth,
  authorize("Student"),
  markSubSectionAsCompleted
);

module.exports = router;
