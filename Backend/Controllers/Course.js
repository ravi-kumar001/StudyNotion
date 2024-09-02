const { Category } = require("../DB/Modals/Category");
const { User } = require("../DB/Modals/User");
const { Course } = require("../DB/Modals/Course");
const { uploadFileToCloudinary } = require("../utils/imageUploader");
const { Section } = require("../DB/Modals/Section");
const { SubSection } = require("../DB/Modals/SubSection");

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

// @desc      Edit Course
// @route     PUT /api/v1/courses/editcourse
// @access    Private/instructor
const editCourse = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { courseId } = req.body;
    const updates = req.body;
    const thumbnail = req.files?.thumbnail;

    if (updates.hasOwnProperty("thumbnail") && !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Please select a thumbnail",
      });
    }

    if (!courseId) {
      return res.status(401).json({
        success: false,
        message: "Invalid request",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(402).json({
        success: false,
        message: "No such course found",
      });
    }

    if (course.instructor._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    /////////////////////// ** Course Thumbnail ** ///////////////////////
    if (thumbnail) {
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

      console.log("This is Done");
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

      thumbnail.name = `thumbnail_${
        req.user.id
      }_${Date.now()}.${thumbnailType}`;

      const thumbnailResponse = await uploadFileToCloudinary(
        thumbnail,
        `/${process.env.CLOUDINARY_FOLDER_NAME}/${process.env.THUMBNAIL_FOLDER_NAME}`,
        100,
        80
      );
      console.log("Thumbnail Response => ", thumbnailResponse);
      course.thumbnail = thumbnailResponse.secure_url;
    }

    /////////////////////////// ***** ///////////////////////////

    if (updates.tags) updates.tags = JSON.parse(updates.tags);
    if (updates.instructions)
      updates.instructions = JSON.parse(updates.instructions);

    // Update only properties that are present in the request body (and not inherited in updates)
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        course[key] = updates[key];
      }
    }

    await course.save();

    const updatedCourse = await Course.findById(courseId)
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
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Edit the course",
    });
  }
};

// @desc      Get full details of a course
// @route     POST /api/v1/courses/getFullCourseDetails
// @access    Private
const getFullCourseDetails = async (req, res) => {
  try {
    // Full details can be seen by instructor who created it
    const instructorId = req.user.id;

    // find course id
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(401).json({
        success: false,
        message: "Invalid request",
      });
    }

    // maro call for courseDetails with courseId and populate karo
    const courseDetailsResponse = await Course.findById(courseId)
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
    console.log("Course Details => ", courseDetailsResponse);

    // Some validation on courseDetailsResponse
    if (!courseDetailsResponse) {
      return res.status(404).json({
        success: false,
        message: `course Details not found with this ${courseId}`,
        status: 404,
      });
    }

    if (courseDetailsResponse.instructor._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // return response
    return res.status(200).json({
      status: 200,
      data: courseDetailsResponse,
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
  } catch (error) {
    console.log("Error in Get Course => ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetching course",
    });
  }
};

const getAllPublishedCourses = async (req, res) => {};

// @desc      Delete Course - Course can be delete only if no students is enrolled
// @route     DELETE /api/v1/courses/deletecourse
// @access    Private/instructor
const deleteCourse = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(401).json({
        success: false,
        message: "Invalid request",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(402).json({
        success: false,
        message: "No such course found",
      });
    }

    if (course.instructor._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (course.studentsEnrolled.length !== 0) {
      return res.status(404).json({
        success: false,
        message: "Can't delete course, some students are enrolled",
      });
    }

    // Delete Sections and Sub-Sections
    const courseSections = course.sections;
    for (const sectionsId of courseSections) {
      const section = await Section.findById(sectionsId);

      const subSections = section.subSections;

      // Delete the sub sections of section
      for (const subSectionId of subSections) {
        await SubSection.findByIdAndDelete(subSectionId);
      }
      
      await Section.findByIdAndDelete(sectionsId);
    }
    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.log("Error occured in delete course => ", error);
    return res.status(500).json({
      success: false,
      error: error,
      message: "Something went wrong during delete Course",
    });
  }
};

module.exports = {
  createCourse,
  getAllPublishedCourses,
  getCourse,
  editCourse,
  getFullCourseDetails,
  deleteCourse,
};
