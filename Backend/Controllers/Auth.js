const { User } = require("../DB/Modals/User");
const { OTP } = require("../DB/Modals/OTP");
const { Profile } = require("../DB/Modals/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const { mailSender } = require("../utils/mailSender");
const passwordUpdateTemplate = require("../mail/templates/passwordUpdateTemplate");
const adminCreatedTemplate = require("../mail/templates/adminCreatedTemplate");
const accountCreationTemplate = require("../mail/templates/accountCreationTemplate");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// @desc      Send OTP for email verification
// @route     POST /api/v1/auth/sendotp
// @access    Public // VERIFIED
const sendOTP = async (req, res) => {
  try {
    // Fetch Data
    const { email } = req.body;

    // Check user already register or not
    const user = await User.findOne({ email });

    if (user) {
      return res.status(401).json({
        success: false,
        error: "User Already exists",
        message: "User already exists",
      });
    }

    // OTP Generate
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Check otp unique or not
    const result = await OTP.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    // Store otp in db
    const otpInfo = await OTP.create({
      email,
      otp,
    });

    // Return Response
    res.status(200).json({
      status: 200,
      message: "OTP send successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "OTP can't send. Please try again later",
    });
  }
};

// @desc      SignUp a user
// @route     POST /api/v1/auth/signup
// @access    Public // VERIFIED
const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
      contactNumber,
      otp,
    } = req.body;

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(402).json({
        success: false,
        message: "All Fields are required",
        error: "All Fields are required",
        status: 401,
      });
    }

    // Check both password is matching
    if (password != confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Password doesn't match",
        error: "Password doesn't match",
        status: 403,
      });
    }

    // Check user already exist
    // const user = await User.findOne({ email });

    if (await User.findOne({ email })) {
      return res.status(404).json({
        success: false,
        message: "User already exists.Please Login",
        error: "User already exists.Please Login",
      });
    }

    // Find most recent otp
    const recentOTP = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    // Validate OTP
    if (recentOTP.length === 0 || recentOTP.otp !== otp) {
      return res.status(405).json({
        success: false,
        message: "Wrong OTP",
        error: "Wrong OTP",
        status: 405,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
      gender: null,
      dob: null,
      about: null,
      contactNumber: null,
    });

    try {
      var user = await User.create({
        // if Modal.create not showing error then must use in try-catch block we also use new instance mehtod
        // Here we want to create a document in db with new modal instance
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        profile: profileDetails._id,
        avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
      });
    } catch (error) {
      console.log("Something went wrong during sign up ", error);
    }

    // await user.save();

    // Send Email for account creation to student
    try {
      await mailSender(
        email,
        `Account created successfully for ${firstName} ${lastName}`,
        accountCreationTemplate(firstName + " " + lastName)
      );
    } catch (error) {
      console.log("Something went wrong", error);
    }

    sendTokenResponse(res, user, 201);

    // // Setting custom headers
    // res.set("X-Custom-Header", "CustomValue");
    // res.set("X-Powered-By", "Express");

    // // Return response
    // res.status(200).json({
    //   success: true,
    //   message: "User created successfully",
    //   status: 200,
    // });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "User can't register.Please try again later",
    });
  }
};

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public  // VERIFIED
const login = async (req, res) => {
  try {
    // fetch data
    const { email, password } = req.body;

    // Validate data
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "All Fields are required",
      });
    }

    // check user exists or not
    let user = await User.findOne({ email }).populate("profile");
    if (!user) {
      return res.status(402).json({
        success: false,
        error: "User can't register.Please Sign In first",
      });
    }

    // Generate jwt after comparing password pahle ==> hum payload bhejte the ab direct user bheh rahe hai payload banake bhejane ki jarurat nahi hai direct user bhej do or jwt.sign method me direct object banakar match kar lo
    // const payload = {
    //   email: user?.email,
    //   role: user?.role,
    //   id: user?._id,
    // };

    if (!(await bcrypt.compare(password, user.password))) {
      // user = user.toObject();
      // user.token = token; // Ye dono field update karne se koi fayada nahi hai or pahle password ko undefined karte the but this password is always in hashed formed
      // user.password = undefined;

      return res.status(403).json({
        success: false,
        error: "Incorrect Password",
      });
    }

    sendTokenResponse(res, user, 201);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login Failed.Please try again later",
    });
  }
};

// @desc      Logout current user / cleat cookie
// @route     POST /api/v1/auth/logout
// @access    Private  // VERIFIED
const logout = async (req, res) => {
  try {
    res
      .cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      })
      .status(200)
      .json({
        success: true,
        data: {},
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to LogOut.",
    });
  }
};

// @desc      Get current logged in user
// @route     GET /api/v1/auth/getme
// @access    Private  // VERIFIED
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetching current user details. Please try again",
    });
  }
};

// @desc      Create Admin
// @route     POST /api/v1/auth/createadmin
// @access    Private/SiteOwner // VERIFIED
const createAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, contactNumber } = req.body;
    const role = "Admin";

    if (
      !(firstName && lastName && email && password && role && contactNumber)
    ) {
      return res.status(400).json({
        error: "Some fields are missing",
        success: false,
      });
    }

    // check if user already exists
    if (await User.findOne({ email })) {
      return res.status(401).json({
        error: "User already exist. Please sign in to continue",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // LATER  - what is approved
    let approved = role === "Instructor" ? false : true;

    const profile = await Profile.create({ contactNumber });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      approved,
      profile: profile._id,
      avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
    });

    // send a notification to user for account creation
    await mailSender(
      email,
      `Admin account created successfully for ${firstName} ${lastName}`,
      adminCreatedTemplate(firstName + " " + lastName)
    );

    res.status(201).json({
      success: true,
      data: "Admin account created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to create admin, Please try again",
      success: false,
    });
  }
};

// @desc      Change Password
// @route     PUT /api/v1/auth/changepassword
// @access    Private  // VERIFIED
const changePassword = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json({
        message: "Password is incorrect",
        error: "Incorrect Password",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    // console.log(
    //   "user",
    //   user.email,
    //   " ",
    //   user.firstName,
    //   `${user.firstName} ${user.lastName}`
    // );

    // Send password change email to user
    try {
      await mailSender(
        user.email,
        `Password updated successfully for ${user.firstName} ${user.lastName}`,
        passwordUpdateTemplate(user.email, `${user.firstName} ${user.lastName}`)
      );
    } catch (err) {
      return res.status(500).json({
        message: "Error occurred while sending email",
        success: false,
        status: 500,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to change password. Please try again",
      success: false,
      status: 500,
      errror: err.message,
    });
  }
};

// @desc      Forgot Password - send rest url to user
// @route     POST /api/v1/auth/forgotpassword
// @access    Public  // VERIFIED
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(401).json({
      message: "Input Fields are Missing",
      success: false,
      status: 401,
    });
  }

  // Check for user is exist
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      error: "User is not register.Please Register first",
      status: 400,
    });
  }

  // Generate Reset Password Token
  await resetPasswordToken(res, email, user);
};

// First create ResetToken
const resetPasswordToken = async (res, email, user) => {
  try {
    const resetToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: Date.now() + 10 * 60 * 1000,
      },
      { new: true }
    );

    const resetUrl = `${process.env.STUDY_NOTION_FRONTEND_SITE}/reset-password?reset-token=${resetToken}`;

    // Send Email to the user
    try {
      const mailResponse = await mailSender(
        user.email,
        `Password reset for ${user.firstName} ${user.lastName}`,
        `You are receiving this email because you (or someone else) has requested the reset of your Study Notion account password. 
        Please click below to reset your password : \n\n <a href="${resetUrl}" target="_blank" style="color: blue; text-decoration: underline;">Reset your password</a>
        `
      );
    } catch (error) {
      return res.status(500).json({
        error,
        success: false,
        message:
          "Something went wrong during sent email during forget password",
      });
    }

    return res.status(200).json({
      message:
        "Reset email sent successfully. Please check your email to reset password",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong during forgot password",
    });
  }
};

// @desc      Reset Password
// @route     PUT /api/v1/auth/resetpassword
// @access    Public  // VERIFIED
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

    // Sent mail for reset password

    try {
      const mailResponse = await mailSender(
        userDetails.email,
        `Password has been reset successfully for ${userDetails.firstName} ${userDetails.lastName}`,
        `Your password has been reset successfully. Thanks for being with us.
        To visit our site : ${process.env.STUDY_NOTION_FRONTEND_SITE}
        `
      );
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
    { expiresIn: process.env.JWT_COOKIE_EXPIRE + "d" }
  );

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.cookie("token", token, options).status(statusCode).json({
    success: true,
    userDetails,
    token,
  });
};

module.exports = {
  sendOTP,
  signup,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
  createAdmin,
};
