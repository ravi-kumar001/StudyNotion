const { User } = require("../DB/Modals/User");
const { OTP } = require("../DB/Modals/OTP");
const { Profile } = require("../DB/Modals/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");

// sendOTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

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
    console.log(otpInfo);

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
const register = async (req, res) => {
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
        status: 401,
      });
    }

    // Check both password is matching
    if (password != confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Password doesn't match",
        status: 403,
      });
    }

    // Check user already exist
    const user = await User.findOne({ email });

    if (user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User already exists",
      });
    }

    // Find most recent otp
    const recentOTP = await OTP.findOne({ otp })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOTP);

    // Validate OTP
    if (recentOTP.length == 0) {
      res.status(405).json({
        success: false,
        message: "OTP not found",
        status: 405,
      });
    } else if (otp != recentOTP.otp) {
      res.status(406).json({
        success: false,
        message: "Wrong OTP",
        status: 406,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const profileDetails = await Profile.create({
      gender: null,
      dob: null,
      about: null,
      contactNumber: null,
    });
    user = new User({
      // Here we want to create a document in db with new modal instance
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      role,
      additionalDetails: profileDetails._id,
      avtar: `https://api.dicebear.com/5.x/initials/svg?spped=${firstName}  ${lastName}`,
    });
    await user.save();

    res.status(200).json({
      success: true,
      message: "User created successfully",
      status: 200,
    });
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
      var token = jwt.sign(payload, process.env.JWT_TOKEN, {
        expiresIn: "2h",
      });

      // console.log(typeof user);
      user = user.toObject();
      user.token = token;
      user.password = undefined;

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

// ChangePassword
const changePassword = (req, res) =>{
    
}
