const { User } = require("../DB/Modals/User");
const { mailSender } = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

// First create ResetToken  This Handler function written in Auth Controller
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

// Forget Password we can also write this is in Auth Controller
const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    // validation on resetToken and password
    if (!(resetToken && password)) {
      return res.status(401).json({
        status: 401,
        message: "Some Fields Are Missing",
        success: false,
      });
    }

    // Get userDetails from db using token first Hash the token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const userDetails = await User.findOne({ resetPasswordToken });
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
    console.log("Hashed Password => ", hashedPassword);

    // now Password update
    const updateResponse = await User.findOneAndUpdate(
      userDetails._id,
      {
        password: hashedPassword,
        resetPasswordExpire: undefined,
        resetPasswordToken: undefined,
      },
      { new: true } // this line give new updated values in which token and resetPasswordExpires exists otherwise this give old value in which this two value missing
    );
    console.log("User Update Response => ", updateResponse);

    // Sent mail for reset password

    try {
      const mailResponse = await mailSender(
        userDetails.email,
        `Password has been reset successfully for ${userDetails.firstName} ${userDetails.lastName}`,
        `Your password has been reset successfully. Thanks for being with us.
        To visit our site : ${process.env.STUDY_NOTION_FRONTEND_SITE}
        `
      );
      console.log("Mail Response", mailResponse);
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong during reset password mail sending",
      });
    }

    sendTokenResponse(res, userDetails, 200);

    // Return Response
    return res.status(200).json({
      message: "Password reset Successfully",
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during reset your password . Please try again",
    });
  }
};

// Function to send token in cookies  // VERIFIED
const sendTokenResponse = (res, userDetails, statusCode) => {
  const token = jwt.sign(
    {
      id: userDetails._id,
      email: userDetails.email,
      role: userDetails.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const options = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') {
  //   options.secure = true;
  // }

  res.cookie("token", token, options).status(statusCode).json({
    success: true,
    userDetails,
    token,
  });
};

module.exports = { resetPasswordToken, resetPassword };
