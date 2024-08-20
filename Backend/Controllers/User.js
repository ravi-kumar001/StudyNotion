const { User } = require("../DB/Modals/User");
const currentUser = async (req, res) => {
  try {
    const userResponse = await User.findById(req.user.id)
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

    return res.status(200).json({
      success: true,
      message: "find current user successfully",
      data: userResponse,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong during fetching current user",
      success: false,
      status: 500,
      error: "Can't get current user",
    });
  }
};

module.exports = { currentUser };
