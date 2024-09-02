const { Profile } = require("../DB/Modals/Profile");
const { User } = require("../DB/Modals/User");
const deleteAccoutTemplate = require("../mail/templates/deleteAccoutTemplate");
const { uploadFileToCloudinary } = require("../utils/imageUploader");
const { mailSender } = require("../utils/mailSender");
require("dotenv").config();

// @desc      Get current user
// @route     GET /api/v1/users/currentuser
// @access    Private // VERIFIED
const currentUser = async (req, res) => {
  const { id } = req.user;
  console.log("User id => ", id);
  try {
    const userResponse = await User.findById({ _id: id })
      .populate("profile")
      .populate("courses")
      .exec();

    // Validation
    if (!userResponse) {
      return res.status(400).json({
        success: false,
        message: "Id not found for current user",
        status: 400,
        error: "Something went wrong in current user",
      });
    }

    // Return response if user is found
    return res.status(200).json({
      success: true,
      message: "Found current user successfully",
      data: userResponse,
      status: 200,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({
      message: "Something went wrong during fetching current user",
      success: false,
      status: 500,
      error: "Can't get current user",
    });
  }
};

// @desc     Change avatar of user
// @route     PUT /api/v1/users/changeavatar
// @access    Private // VERIFIED
const changeAvatar = async (req, res) => {
  try {
    if (!(req.files && req.files.file)) {
      return res.status(400).json({
        success: false,
        message: "Image Not Found",
        error: "Select Image",
        status: 400,
      });
    }

    const avatar = req.files.file;

    if (avatar.size > process.env.AVATAR_MAX_SIZE) {
      return res.status(401).json({
        success: false,
        message: "Image Size issue",
        error: `Please upload image less than ${
          process.env.AVATAR_MAX_SIZE / 1024
        } KB`,
        status: 401,
      });
    }

    if (!avatar.mimetype.startsWith("image")) {
      return res.status(402).json({
        success: false,
        message: "Please Provide image File",
        status: 402,
      });
    }

    const allowedType = ["jpeg", "jpg", "png"];
    const avatarType = avatar.name.split(".")[1].toLowerCase();

    if (!allowedType.includes(avatarType)) {
      return res.status(403).json({
        success: false,
        message: "Please Provide valid image File",
        status: 403,
      });
    }

    avatar.name = `avatar_${req.user.id}_${Date.now()}.${avatarType}`;

    const changeAvatarResponse = await uploadFileToCloudinary(
      avatar,
      `/${process.env.CLOUDINARY_FOLDER_NAME}/${process.env.AVATAR_FOLDER_NAME}`,
      100,
      80
    );
    console.log("ChangeAvatarResponse => ", changeAvatarResponse);

    // Update Also in User Document   @Not Forget this for updating related document
    const updateUserResponse = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: changeAvatarResponse.secure_url,
      },
      { new: true }
    );
    console.log("Update User Response ", updateUserResponse);

    return res.status(200).json({
      success: true,
      message: "Avatar Change successfully",
      data: changeAvatarResponse.secure_url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong during change avatar",
      error: "Something went wrong during change avatar",
      status: 500,
    });
  }
};

// @desc     delete current user Account
// @route    DELETE /api/v1/users/deletecurrentuser
// @access   Private // VERIFIED
const deleteCurrentUser = async (req, res) => {
  try {
    // Get Id
    const userId = req.user.id;

    // Validation this user exist or not
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User n't found",
        status: 400,
      });
    }

    // First delete user profile modal
    await Profile.findByIdAndDelete({ _id: user.profile });

    try {
      await mailSender(
        user.email,
        `Account Deleted successfully for ${user.firstName} ${user.lastName}`,
        deleteAccoutTemplate(user.email, `${user.firstName} ${user.lastName}`)
      );
    } catch (error) {
      return res.status(401).json({
        error: "Send Mail Failed",
        success: false,
      });
    }

    // Now delete user modal
    await User.findByIdAndDelete({ _id: userId });

    // Return response
    return res.status(200).json({
      status: 200,
      message: "Account deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during delete Account . Please try again",
      error: error.message,
    });
  }
};

// @desc      Get Instructor Dashboard data of a Instructor
// @route     GET /api/v1/users/getinstructordashboarddata
// @access    Private/Instructor
const getInstructorDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No such user found",
      });
    }

    let totalPublishedCourses = user.courses.length;
    let totalStudents = 0;
    let totalIncome = 0;

    const coursesWithStats = user.courses.map((course) => {
      let courseWithStats = {
        course,
        stats: {
          totalStudents: course.numberOfEnrolledStudents,
          totalIncome: course.price * course.numberOfEnrolledStudents,
        },
      };

      totalStudents += courseWithStats.stats.totalStudents;
      totalIncome += courseWithStats.stats.totalIncome;
      return courseWithStats;
    });

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        userFirstName: user.firstName,
        totalPublishedCourses,
        totalStudents,
        totalIncome,
        coursesWithStats,
      },
    });
    
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server Error in instructor dashboard",
      error: error.message,
      success: false,
    });
  }
};

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin // VERIFIED
const getUsers = async (req, res) => {
  try {
    const users = await User.findOne(req.user.id)
      .populate("profile")
      .populate("courses")
      .exec();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to get all users, please try again",
      success: false,
    });
  }
};

// @desc      Get single user by id
// @route     GET /api/v1/users/getuser/:id
// @access    Private/Admin // VERIFIED
const getUser = async (req, res) => {
  try {
    const user = await User.findOne(req.user.id)
      .populate("profile")
      .populate("courses")
      .exec();

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "No such user found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      error: "No such user found",
      success: false,
    });
  }
};

// @desc      Get all courses created by current instructor
// @route     GET /api/v1/users/getcreatedcourses
// @access    Private/Instructor
const getCreatedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("courses").exec();

    return res.status(200).json({
      success: true,
      count: user.courses.length,
      data: user.courses,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch all courses", success: false });
  }
};

module.exports = {
  currentUser,
  changeAvatar,
  deleteCurrentUser,
  getInstructorDashboardData,
  getUsers,
  getUser,
  getCreatedCourses,
};
