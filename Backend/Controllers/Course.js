const { Category } = require("../DB/Modals/Category");
const { User } = require("../DB/Modals/User");
const { Course } = require("../DB/Modals/Course");
const { uploadFileToCloudinary } = require("../utils/imageUploader");
const { data } = require("autoprefixer");

// Create Course Handler function   hame ise category schema ke andar ref push karna hi
// @desc      Create Course
// @route     POST /api/v1/courses
// @access    Private/instructor
const createCourse = async (req, res) => {
  try {
    // Data fetch
    const instructorId = req.user.id;
    const { title, description, whatYouWillLearn, price, category } = req.body;
    const thumbnail = req.files?.thumbnail;
    const tags = req.body?.tags ? req.body?.tags : null;
    const instructions = req.body?.instructions
      ? JSON.parse(req.body?.instructions)
      : null;

    // validation on fetched data
    if (
      !title ||
      !description ||
      !whatYouWillLearn ||
      !price ||
      !tags ||
      !category ||
      !instructions
    ) {
      return res.status(401).json({
        success: false,
        message: "All field required",
        error: "All fields are mandatory",
      });
    }

    // Check for this user is instructor or not
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details => ", instructorDetails);

    if (!instructorDetails) {
      return res.status(402).json({
        success: false,
        message: "Intructor details not found",
        status: 402,
      });
    }

    // check if category is a valid category
    const validCategoryResponse = await Category.findById(category);
    if (!validCategoryResponse) {
      res.status(403).json({
        success: false,
        error: "No such category found",
      });
    }

    // validate and upload thumbnail
    if (thumbnail.size > process.env.THUMBNAIL_MAX_SIZE) {
      return res.status(401).json({
        success: false,
        message: "Image Size issue",
        error: `Please upload image less than ${
          process.env.THUMBNAIL_MAX_SIZE / 1024
        } KB`,
        status: 401,
      });
    }

    if (!thumbnail.mimetype.startsWith("image")) {
      return res.status(402).json({
        success: false,
        message: "Please Provide image File",
        status: 402,
      });
    }

    const allowedType = ["jpeg", "jpg", "png"];
    const thumbnailType = thumbnail.name.split(".")[1].toLowerCase();

    if (!allowedType.includes(thumbnailType)) {
      return res.status(403).json({
        success: false,
        message: "Please Provide valid image File",
        status: 403,
      });
    }

    thumbnail.name = `thumbnail_${req.user.id}_${Date.now()}.${thumbnailType}`;

    const thumbnailResponse = await uploadFileToCloudinary(
      thumbnail,
      `/${process.env.CLOUDINARY_FOLDER_NAME}/${process.env.THUMBNAIL_FOLDER_NAME}`,
      100,
      80
    );
    console.log("Thumbnail Response => ", thumbnailResponse);

    // create course
    const createCourseResponse = await Course.create({
      title,
      description,
      instructor: instructorId,
      whatYouWillLearn,
      price,
      category,
      instructions,
      thumbnail: thumbnailResponse.secure_url,
      tags,
    });
    console.log("Create course Response => ", createCourseResponse);

    // add this course in user schema for current instructor i.e update user modal with this course id
    try {
      const updatedUserResponse = await User.findByIdAndUpdate(
        instructorId,
        {
          $push: {
            courses: createCourseResponse._id,
          },
        },
        { new: true } // this line used for give updated response i.e give updated document
      );
      console.log("Update User Response => ", updatedUserResponse);
    } catch (error) {
      console.log(error);
    }

    // update category
    await Category.findByIdAndUpdate(
      validCategoryResponse._id,
      {
        $push: { courses: createCourseResponse._id },
      },
      { new: true }
    );

    const courseFullDetails = await Course.findById(createCourseResponse._id)
      .populate({
        path: "instructor",
        populate: {
          path: "profile",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "sections",
        populate: {
          path: "subSections",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      data: courseFullDetails,
      message: "Course created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: "Something went wrong during creating course . Please try again",
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

// @desc      Get single courses (Only published course)
// @route     GET /api/v1/courses/getcourse/:courseId
// @access    Public // VERIFIED
const getCourse = async (req, res) => {
  try {
    const course = Course.findById(req.params.courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "profile",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "sections",
        populate: {
          path: "subSections",
          select: "videoUrl",
        },
      })
      .exec();

    if (!course || course.status == "Draft") {
      return res.status(400).json({
        success: false,
        error: "No such course found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course Get Successfully",
      data: course,
    });
  } catch (error) {}
};

// Get Course Details Handler function
const getCourseDetails = async (req, res) => {
  try {
    // find course id
    const { courseId } = req.body;

    // maro call for courseDetails with courseId and populate karo
    const courseDetailsResponse = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "profile",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    console.log("Course Details => ", courseDetailsResponse);

    // Some validation on courseDetailsResponse
    if (!courseDetailsResponse) {
      return res.status(404).json({
        success: false,
        message: `course Details not found with this ${courseId}`,
        status: 404,
      });
    }

    // return response
    return res.status(200).json({
      status: 200,
      message: "Course Details Fetch successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during Fetching course Details. Please try again",
    });
  }
};

const getAllPublishedCourses = async (req, res) => {};

module.exports = { createCourse, getAllPublishedCourses, getCourse };
