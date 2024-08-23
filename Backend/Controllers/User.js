const { User } = require("../DB/Modals/User");
const { uploadFileToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

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

//@desc     Change avatar of user
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

module.exports = { currentUser, changeAvatar };
