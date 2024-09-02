const { Section } = require("../DB/Modals/Section");
const { Course } = require("../DB/Modals/Course");

// @desc      Create a section
// @route     POST /api/v1/sections
// @access    Private/Instructor  // VERIFIED
const createSection = async (req, res) => {
  try {
    // Fetch Data
    const { title, courseId } = req.body;

    // Data Validation
    if (!title || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }

    const courseDetails = await Course.findById(courseId.toString());
    if (!courseDetails) {
      return res.status(401).json({
        error: "No such course found",
        success: false,
      });
    }

    // only instructor of course can add section in course
    if (req.user.id !== courseDetails.instructor.toString()) {
      return res.status(402).json({
        success: false,
        error: "User not authorized",
      });
    }

    // Create Section
    const createSectionResponse = await Section.create({
      title,
      user: req.user.id,
      course: courseDetails._id,
    });
    console.log("Created Section Response => ", createSectionResponse);

    // Update Course with section objectId
    const updatedCourseResponse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { sections: createSectionResponse._id } },
      { new: true }
    )
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "sections",
        populate: {
          path: "subSections",
        },
      })
      .exec();
    console.log("Updated Course Response", updatedCourseResponse);

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: updatedCourseResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during create section . Please try again",
    });
  }
};

// @desc      Update a section
// @route     POST /api/v1/sections
// @access    Private/Instructor  // VERIFIED
const updateSection = async (req, res) => {
  try {
    // Data fetch
    const instructorId = req.user.id;
    const { title, sectionId } = req.body;

    // Data Validation
    if (!title || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(401).json({
        success: false,
        message: "No Such Section found",
      });
    }

    // only instructor of course can add section in course
    if (section.user.toString() !== instructorId) {
      return res.status(402).json({
        success: false,
        error: "User not authorized",
      });
    }

    const updateSectionResponse = await Section.findByIdAndUpdate(
      sectionId,
      {
        title,
      },
      { runValidators: true, new: true }
    );

    const updateCourseResponse = await Course.findByIdAndUpdate(section.course)
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "sections",
        populate: {
          path: "subSections",
        },
      })
      .exec();

    res.status(200).json({
      data: updateCourseResponse,
      success: true,
      message: "Section update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during update section . Please try again",
    });
  }
};

// @desc      Delete a section
// @route     POST /api/v1/sections
// @access    Private/Instructor  // VERIFIED
const deleteSection = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { sectionId } = req.body;

    if (!sectionId) {
      return res
        .status(400)
        .json({ success: false, error: "Some fields are missing" });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res
        .status(401)
        .json({ success: false, error: "No such section found" });
    }

    // only section creator (instructor) can update section
    if (section.user.toString() !== instructorId) {
      return res
        .status(402)
        .json({ success: false, error: "Unauthorized access" });
    }
    
    // update course
    const updatedCourse = await Course.findByIdAndUpdate(
      section.course,
      {
        $pull: { sections: section._id },
      },
      { new: true }
    )
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "sections",
        populate: {
          path: "subSections",
        },
      })
      .exec();

    // await Section.findByIdAndDelete(sectionId);
    await section.deleteOne();

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete section. Please try again",
    });
  }
};

module.exports = { createSection, updateSection, deleteSection };
