const { User } = require("../DB/Modals/User");
const { mailSender } = require("../utils/mailSender");
const bcrypt = require("bcryptjs");

// First create ResetToken
const resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    // check this email is register or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "This email is n't register with us",
        status: 401,
      });
    }

    // Generate Token
    const token = crypto.randomUUID(); // we need token because every user have different-different token and ui routes
    console.log(token);

    // Update user by adding token and expiration time
    const updateDetails = await User.findOneAndUpdate(
      { email },
      {
        token: token,
        tokenExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true } // this line give new updated values in which token and resetPasswordExpires exists otherwise this give old value in which this two value missing
    );
    console.log(updateDetails);

    // Create Url
    const url = `https://localhost:3000/reset-password/${token}`;

    // Send mail containing this url
    const mailInformer = await mailSender(
      email,
      "Ragarding reset password",
      `Password Reset Link : ${url}`
    );

    res.status(200).json({
      status: 200,
      message: "Email send successfully for reset your password",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during mail send for reseting password",
    });
  }
};
// Forget Password

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // validation on password and confirmPassword
    if (password != confirmPassword) {
      return res.status(401).json({
        status: 401,
        message: "password and confirmPassword not matching",
        success: false,
      });
    }

    // Get userDetails from db using token
    const userDetails = await User.findOne({ token: token });

    // If no entry then token is invalid
    if (!userDetails) {
      return res.status(402).json({
        status: 402,
        message: "Token is invalid",
        success: false,
      });
    }

    // Token time check
    if (userDetails.tokenExpires < Date.now()) {
      return res.status(403).json({
        status: 403,
        message: "Token is expires . Please regenerate your token",
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // now Password update
    const updateResponse = await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
      },
      { new: true } // this line give new updated values in which token and resetPasswordExpires exists otherwise this give old value in which this two value missing
    );
    console.log(updateResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during reset your password . Please try again",
    });
  }
};
