const { Section } = require("../DB/Modals/Section");
const { Course } = require("../DB/Modals/Course");

// Create Section
const createSection = async (req, res) => {
  try {
    // Fetch Data
    const { sectionName, courseId } = req.body;

    // Data Validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    // Create Section
    const createSectionResponse = await Section.create({ sectionName });
    console.log(createSectionResponse);

    // Update Course with section objectId
    const updatedCourseResponse = await Course.findByIdAndUpdate(
      { courseId },
      { $push: { courseContent: createSectionResponse._id } },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    console.log(updatedCourseResponse);

    return res.status(200).json({
      success: true,
      message: "Section create successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during create section . Please try again",
    });
  }
};

// Update Section
const updateSection = async (req, res) => {
  try {
    // Data fetch
    const { sectionName, sectionId } = req.body;

    // Data Validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    const updateSectionResponse = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName,
      },
      { new: true }
    );
    console.log(updateSectionResponse);

    res.status(200).json({
      success: true,
      message: "Section update successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during update section . Please try again",
    });
  }
};

// Delete Section
const deleteSection = async (req, res) => {
  try {
    // Get Section id
    const { sectionId } = req.params;

    // Section deleted successfully
    const deletedSectionResponse = await Section.findByIdAndDelete(sectionId);
    console.log(deletedSectionResponse);

    // HW Course Ko Bhi update Karo

    res.status(200).json({
      message: "Section deleted Successfully",
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during delete section . Please try again",
    });
  }
};

module.exports = { createSection, updateSection, deleteSection };
