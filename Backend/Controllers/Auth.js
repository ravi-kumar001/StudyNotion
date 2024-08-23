const { User } = require("../DB/Modals/User");
const { OTP } = require("../DB/Modals/OTP");
const { Profile } = require("../DB/Modals/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const { mailSender } = require("../utils/mailSender");
const {
  passwordUpdateTemplate,
} = require("../mail/templates/passwordUpdateTemplate");
const accountCreationTemplate = require("../mail/templates/accountCreationTemplate");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// sendOTP
const sendOTP = async (req, res) => {
  try {
    // Fetch Data
    const { email } = req.body;

    // Check user already register or not
    const user = await User.findOne({ email });
    console.log("User Details => ", user);

    if (user) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "User already exists",
      });
    }

    // OTP Generate
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Our otp => ", otp);

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
    console.log("Our OTP Info =>", otpInfo);

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

// register
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
        status: 404,
        message: "User already exists.Please Login",
        error: "User already exists.Please Login",
      });
    }

    // Find most recent otp
    const recentOTP = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("Recent OTP Response => ", recentOTP);

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
    console.log("Our Hashed Password => ", hashedPassword);

    const profileDetails = await Profile.create({
      gender: null,
      dob: null,
      about: null,
      contactNumber: null,
    });
    console.log("Profile Details => ", profileDetails);

    try {
      var user = await User.create({
        // if Modal.create not showing error then must use in try-catch block we also use new instance mehtod
        // Here we want to create a document in db with new modal instance
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        additionalDetails: profileDetails._id,
        avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
      });
      console.log("User Details => ", user);
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

// Login
const login = async (req, res) => {
  try {
    // fetch data
    const { email, password } = req.body;

    // Validate data
    if (!email || !password) {
      res.status(407).json({
        status: 407,
        success: false,
        message: "All Fields are required",
      });
    }

    // check user exists or not
    let user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      res.json({
        status: 402,
        success: false,
        message: "User can't register . Please register first",
      });
    }

    // Generate jwt after comparing password
    const payload = {
      email: user?.email,
      role: user?.role,
      id: user?._id,
    };

    if (await bcrypt.compare(password, user.password)) {
      var token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      console.log("Our Token => ", token);

      // console.log(typeof user);
      // user = user.toObject();
      user.token = token;
      user.password = undefined;
      console.log("User Details ", user);

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        token,
        user,
        status: 200,
        message: "User logged In successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Login Failed.Please try again later",
    });
  }
};

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

// ChangePassword
const changePassword = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json({
        message: "Password is incorrect",
        status: 401,
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    // Send password change email to user
    try {
      const response = await mailSender(
        user.email,
        `Password updated successfully for ${user.firstName} ${user.lastName}`,
        passwordUpdateTemplate(user.email, `${user.firstName} ${user.lastName}`)
      );
    } catch (err) {
      res.status(500).json({
        message: "Error occurred while sending email",
        success: false,
        status: 500,
      });
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
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
  try {
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
        message: "User is not register.Please register first",
        error: "User is not register.Please Register first",
        status: 400,
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    console.log("Reset Token => ", resetToken);
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log("Hashed Token => ", hashedToken);
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
        Please click below to reset your password : \n\n ${resetUrl}
        `
      );
      console.log("Mail Response => ", mailResponse);
    } catch (error) {
      return res.status(500).json({
        error,
        success: false,
        status: 500,
        message:
          "Something went wrong during sent email during forget password",
      });
    }

    return res.status(200).json({
      message:
        "Reset email sent successfully. Please check your email to reset password",
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong during forgot password",
      error: "Something went wrong during forgot password",
    });
  }
};

// Function to send token in cookies  // VERIFIED
const sendTokenResponse = (res, user, statusCode) => {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const options = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === "production") {
  //   options.secure = true;
  // }

  // Setting custom headers
  res.set("X-Custom-Header", "CustomValue");
  res.set("X-Powered-By", "Express");

  res.cookie("token", token, options).status(statusCode).json({
    success: true,
    user,
    token,
    message: "User Created Successfully",
  });
};

module.exports = {
  sendOTP,
  signup,
  login,
  logout,
  changePassword,
  forgotPassword,
};
