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
        error: "Fill All Fields",
        status: 400,
      });
    }

    // find Profile
    const user = await User.findById(userId);
    const profileId = user.profile;
    const profile = await Profile.findById(profileId);

    // update Profile  we create a nulisit profile modal so we can only use save method with asign this new value
    profile.gender = gender;
    profile.dob = dob;
    profile.about = about;
    profile.contactNumber = contactNumber;
    await profile.save();

    // also change firstName and lastName in User Document
    const updatedUserResponse = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
      },
      {
        runValidators: true, // we also pass this type of options {runValidator , new} by default this is true we not need this like {runValidators : true , new : true}
        new: true,
      }
    );

    //  return response
    return res.status(200).json({
      success: true,
      data: updatedUserResponse,
      message: "Profile Updated Successfully",
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

module.exports = {
  updateProfile,
};
