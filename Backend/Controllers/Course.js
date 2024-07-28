const { Tags } = require("../DB/Modals/Tags");
const { User } = require("../DB/Modals/User");
const { Course } = require("../DB/Modals/Course");
const { uploadFileToCloudinary } = require("../utils/imageUploader");

// Create Course Handler function
const createCourse = async (req, res) => {
  try {
    // Data fetch
    const { courseName, description, whatYouWillLearn, price, tag } = req.body;
    const thumbnail = req.files.thumbnail;

    // validation on fetched data
    if (!courseName || !description || !whatYouWillLearn || !price || !tag) {
      return res.status(401).json({
        success: false,
        message: "All field required",
        status: 401,
      });
    }

    // Check for this user is instructor or not
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details is here ", instructorDetails);

    if (!instructorDetails) {
      return res.status(402).json({
        success: false,
        message: "Intructor details not found",
        status: 402,
      });
    }

    // check intructor'tag is valid or not
    const validTagsResponse = await Tags.findById({ tag });
    if (!validTagsResponse) {
      res.status(403).json({
        success: false,
        message: "Tag is not found . Please try again later",
        status: 403,
      });
    }

    // thumbnail upload on cloudinary
    const uploadedThumbnailResponse = await uploadFileToCloudinary(
      thumbnail,
      process.env.CLOUDINARY_FOLDER_NAME
    );
    console.log(uploadFileToCloudinary);

    // Create an entry for new course
    const createCourseResponse = await Course.create({
      courseName,
      description,
      instructor: instructorDetails._id, // This line shows that we store user id in instructor field
      price,
      whatYouWillLearn,
      tags: validTagsResponse._id,
      thumbnail: uploadedThumbnailResponse.secure_url,
    });

    // add this course in user schema for current instructor
    const updatedUserResponse = await User.findByIdAndUpdate(
      {
        id: instructorDetails._id,
      },
      {
        $push: {
          courses: createCourseResponse._id,
        },
      },
      { new: true } // this line used for give updated response
    );
    console.log("Update User Response => ", updatedUserResponse);

    // update tag schema hw

    res.status(200).json({
      status: 200,
      success: true,
      message: "Course create successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during creating course . Please try again",
    });
  }
};

// Get All Course
const getAllCourse = async (req, res) => {
  try {
    const getAllCourseResponse = await Course.find();
    console.log(getAllCourseResponse);

    res.status(200).json({
      success: true,
      message: "All Course find successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during Fetching course . Please try again",
    });
  }
};

module.exports = { createCourse, getAllCourse };
