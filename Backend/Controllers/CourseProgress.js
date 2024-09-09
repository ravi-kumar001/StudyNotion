const { CourseProgress } = require("../DB/Modals/CourseProgress");
const { SubSection } = require("../DB/Modals/SubSection");

// @desc      Mark subsection as completed
// @route     POST /api/v1/courseprogress/marksubsectionascompleted
// @access    Private/student
const markSubSectionAsCompleted = async (req, res) => {
  try {
    const { courseId, subSectionId } = req.body;
    const userId = req.user.id;

    if (!(courseId && subSectionId)) {
      return res.status(400).json({
        error: "Invalid request",
        success: false,
      });
    }

    const subsection = await SubSection.findById(subSectionId);
    if (!subsection) {
      return res.status(401).json({
        error: "No such lecture found",
        success: false,
      });
    }

    const courseProgress = await CourseProgress.findOneAndUpdate(
      {
        userId,
        courseId,
      },
      { $push: { completedVideos: subSectionId } },
      { new: true }
    );

    if (!courseProgress) {
      return res.status(402).json({
        error: "No such course progress found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        completedVideos: courseProgress.completedVideos,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch enrolled course data",
      success: false,
    });
  }
};

module.exports = { markSubSectionAsCompleted };
