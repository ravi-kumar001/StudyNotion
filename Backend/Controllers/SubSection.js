const { uploadFileToCloudinary } = require("../utils/imageUploader");
const { SubSection } = require("../DB/Modals/SubSection");
const { Section } = require("../DB/Modals/Section");
const { Course } = require("../DB/Modals/Course");

// @desc      Create a subsection
// @route     POST /api/v1/subsections
// @access    Private/instructor // VERIFIED
const createSubSection = async (req, res) => {
  try {
    // Fetch Data
    const { title, timeDuration, description, sectionId } = req.body;
    const userId = req.user.id;
    const video = req?.files?.video;

    // Data validation
    if (!sectionId || !title || !timeDuration || !video) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    // check section is present or not
    const sectionDetails = await Section.findById(sectionId);
    if (!sectionDetails) {
      return res.status(402).json({
        success: false,
        message: "No such section found",
      });
    }

    if (sectionDetails.user.toString() != userId) {
      return res.status(403).json({
        success: false,
        message: "User not authorized",
      });
    }

    ///////////////////////* upload video **///////////////////////
    if (video.size > process.env.LECTURES_MAX_SIZE) {
      return res.status(403).json({
        success: false,
        message: "Video Size issue",
        error: `Please upload video less than ${
          process.env.VIDEO_MAX_SIZE / 1024
        } KB`,
      });
    }

    if (!video.mimetype.startsWith("video")) {
      return res.status(404).json({
        success: false,
        message: "Please Provide video File",
      });
    }

    const allowedType = ["mp4", "mkv"];
    const videoType = video.name.split(".")[1].toLowerCase();

    if (!allowedType.includes(videoType)) {
      return res.status(405).json({
        success: false,
        message: "Please Provide valid video File",
      });
    }

    video.name = `video${req.user.id}_${Date.now()}.${videoType}`;

    const videoDetails = await uploadFileToCloudinary(
      video,
      `/${process.env.CLOUDINARY_FOLDER_NAME}/${process.env.LECTURES_FOLDER_NAME}`,
      100,
      80
    );
    console.log("VIDEO Details Response => ", videoDetails);
    /////////////////////////// ***** ///////////////////////////////////

    // create sub section
    const subSection = await SubSection.create({
      title,
      timeDuration,
      description,
      section: sectionId,
      user: userId,
      videoUrl: videoDetails.secure_url,
    });

    // Update Section with this SubSection objectId
    const updatedSectionResponse = await Section.findByIdAndUpdate(
      { _id: sectionId }, // we directly pass sectionId
      { $push: { subSections: subSection._id } },
      { new: true }
    );
    console.log("Updated Section Response " + updatedSectionResponse); // hw log updated section here , after adding populate query

    // update course - updated time duration of course
    const updatedCourse = await Course.findByIdAndUpdate(
      updatedSectionResponse.course,
      {
        $inc: { totalDuration: timeDuration },
      },
      { new: true }
    );

    res.status(200).json({
      message: "SubSection Created Successfully",
      success: true,
      data: subSection,
    });
  } catch (error) {
    console.log("Some Error in Create Sub Section => ", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during create SubSection . Please try again",
    });
  }
};

// @desc      Update a subsection
// @route     PUT /api/v1/subsections
// @access    Private/instructor // VERIFIED
const updateSubSection = async (req, res) => {
  try {
    // Data fetch
    const { title, timeDuration, description, subSectionId } = req.body;
    console.log(title, timeDuration, description, subSectionId);
    let videoUrl = null;

    // Data validation
    if (!subSectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(402).json({
        success: false,
        message: "No such SubSection found",
      });
    }

    if (subSection.user.toString() != req.user.id) {
      return res.status(403).json({
        success: false,
        message: "User not authorized",
      });
    }

    if (req.files && req.files.video) {
      const video = req.files.video;

      ///////////////////////* upload video **///////////////////////
      if (video.size > process.env.VIDEO_MAX_SIZE) {
        return res.status(403).json({
          success: false,
          message: "Video Size issue",
          error: `Please upload video less than ${
            process.env.VIDEO_MAX_SIZE / 1024
          } KB`,
        });
      }

      if (!video.mimetype.startsWith("video")) {
        return res.status(404).json({
          success: false,
          message: "Please Provide video File",
        });
      }

      const allowedType = ["mp4", "mkv"];
      const videoType = video.name.split(".")[1].toLowerCase();

      if (!allowedType.includes(videoType)) {
        return res.status(405).json({
          success: false,
          message: "Please Provide valid video File",
        });
      }

      video.name = `video${req.user.id}_${Date.now()}.${videoType}`;

      const videoDetails = await uploadFileToCloudinary(
        video,
        `/${process.env.CLOUDINARY_FOLDER_NAME}/${process.env.VIDEO_FOLDER_NAME}`,
        100,
        80
      );
      console.log("VIDEO Details Response => ", videoDetails);

      videoUrl = videoDetails.secure_url;
      /////////////////////////// ***** ///////////////////////////////////
    }

    const updateSubSectionResponse = await SubSection.findByIdAndUpdate(
      subSectionId,
      {
        title,
        timeDuration,
        description,
        videoUrl, // Here somthing is missing we are not update video url video update karne ke liye phir se cloudinary ka logic likhan padega
      },
      { new: true }
    );

    const updatedSection = await Section.findById(subSection.section).populate(
      "subSections"
    );

    // update course - updated time duration of course
    if (timeDuration) {
      const updatedCourse = await Course.findByIdAndUpdate(
        updatedSection.course,
        { $inc: { totalDuration: timeDuration - subSection.timeDuration } },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Section update successfully",
      data: updatedSection,
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

// @desc      Delete a subsection
// @route     DELETE /api/v1/subsections
// @access    Private/instructor // VERIFIED
const deleteSubSection = async (req, res) => {
  try {
    const subSectionId = req.body.subSectionId;
    console.log("Sub Section Id", subSectionId);
    const instructorId = req.user.id;

    if (!subSectionId) {
      return res
        .status(400)
        .json({ success: false, error: "Some fields are missing" });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res
        .status(401)
        .json({ success: false, error: "No such SubSection found" });
    }

    // only section creator (instructor) can update section
    if (subSection.user.toString() !== instructorId) {
      return res
        .status(402)
        .json({ success: false, error: "Unauthorized access" });
    }

    const updatedSection = await Section.findByIdAndUpdate(
      subSection.section,
      {
        $pull: {
          subSections: subSection._id,
        },
      },
      { new: true }
    ).populate("subSections");

    // update course - updated time duration of course

    const updatedCourse = await Course.findByIdAndUpdate(
      updatedSection.course,
      { $inc: { totalDuration:-subSection.timeDuration } },
      { new: true }
    );

    subSection.deleteOne();

    res.status(200).json({
      message: "SubSection deleted Successfully",
      success: true,
      data: updatedSection,
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
