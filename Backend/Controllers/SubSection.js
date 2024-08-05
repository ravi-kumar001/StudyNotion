const { uploadFileToCloudinary } = require("../utils/imageUploader");
const { SubSection } = require("../DB/Modals/SubSection");
const { Section } = require("../DB/Modals/Section");

// Create SubSection
const createSubSection = async (req, res) => {
  try {
    // Fetch Data
    const { sectionId, title, timeDuration, description } = req.body;
    const video = req.files.videoFile;

    // Data validation
    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    // Upload video to cloudinary
    const uploadedVideoResponse = await uploadFileToCloudinary(
      video,
      process.env.CLOUDINARY_FOLDER_NAME
    );
    console.log(uploadFileToCloudinary);

    // Create SubSection
    const createSubSectionResponse = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadedVideoResponse.secure_url,
    });

    // Update Section with this SubSection objectId
    const updatedSectionResponse = await Section.findByIdAndUpdate(
      { sectionId },
      { $push: { subSection: createSubSectionResponse._id } },
      { new: true }
    );
    console.log("Updated Section Response " + updatedSectionResponse); // hw log updated section here , after adding populate query

    res.status(200).json({
      status: 200,
      message: "SubSection Created Successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during create SubSection . Please try again",
    });
  }
};

// Update SubSection hw
const updateSubSection = async (req, res) => {
  try {
    // Data fetch
    const { title, timeDuration, description, subSectionId } = req.body;

    // Data validation
    if (!subSectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    const updateSubSectionResponse = await SubSection.findByIdAndUpdate(
      subSectionId,
      {
        title,
        timeDuration,
        description, // Here somthing is missing we are not update video url video update karne ke liye phir se cloudinary ka logic likhan padega
      },
      { new: true }
    );
    console.log(updateSubSectionResponse);

    res.status(200).json({
      success: true,
      message: "Section update successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during update SubSection . Please try again",
    });
  }
};

// Delete SubSection hw
const deleteSubSection = async (req, res) => {
  try {
    // Get Section id
    const { subSection } = req.params;

    // Section deleted successfully
    const deletedSubSectionResponse = await SubSection.findByIdAndDelete(
      subSectionId
    );
    console.log(deletedSubSectionResponse);

    res.status(200).json({
      message: "SubSection deleted Successfully",
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during delete SubSection . Please try again",
    });
  }
};

module.exports = { createSubSection, updateSubSection, deleteSubSection };
