const { User } = require("../DB/Modals/User");
const { Profile } = require("../DB/Modals/Profile");

// Update Profile Handler Function why here updateProfile not createProfile because we already create a nullist profile when create user Modal
//@desc   update Profile of current user Logged in
//@route    PUT /api/v1/profiles
//access      Private
const updateProfile = async (req, res) => {
  try {
    // Fetch data
    const { dob, about, gender, contactNumber, firstName, lastName } = req.body; // Here dob = "", about = "" ka matlab if this is exist then its value asign otherwise empty string asign
    const userId = req.user.id;

    // Validation on data
    if (!gender || !contactNumber || !userId || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        status: 400,
      });
    }

    // find Profile
    const user = await User.findById(userId);
    const profileId = user.additionalDetails;
    const profile = await Profile.findById(profileId);

    // update Profile  we create a nulisit profile modal so we can only use save method with asign this new value
    profile.gender = gender;
    profile.dob = dob;
    profile.about = about;
    profile.contactNumber = contactNumber;
    await profile.save();

    //  return response
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Profile created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during update Profile . Please try again",
      error: error.message,
    });
  }
};

// Delete Account Handler function this is profile related handler function so, this function exist in this controller otherwise we can seperate this funtion in another controller
const deleteAccount = async (req, res) => {
  try {
    // Get Id
    const userId = req.user.id;

    // Validation this user exist or not
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User n't found",
        status: 400,
      });
    }

    // First delete user profile modal
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });

    // Now delete user modal
    await User.findByIdAndDelete({ _id: id });

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

// GetAllCourseDetails
const getAllUserDetails = async (req, res) => {
  try {
    // for this we need user id
    const userId = req.user.id;

    // validation and get user details
    const getAllUserDetailsResponse = await User.findById(userId)
      .populate("additionalDetails")
      .exec();
    console.log(getAllUserDetailsResponse);

    // Validation
    if (!getAllUserDetailsResponse) {
      return res.status(400).json({
        success: false,
        message: "User not exist",
        status: 400,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during Get All User Details . Please try again",
      error: error.message,
    });
  }
};

// Update Display Picture
const updateDisplayPicture = async (req, res) => {};

// Get Enrolled Courses
const getEnrolledCourses = async (req, res) => {};

// Instructor DashBoard
const instructorDashboard = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server Error in instructor dashboard",
      error: error.message,
      success: false,
    });
  }
};

module.exports = {
  updateProfile,
  deleteAccount,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
};
