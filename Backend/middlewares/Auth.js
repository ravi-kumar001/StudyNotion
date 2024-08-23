const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  try {
    // Find token
    const token =
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "") ||
      req.cookies.token; // const {token} = req.body;
    // console.log("Token of Authentication => ", token);

    // if token is missting
    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token is missing",
        status: 400,
      });
    }

    // if token exist then verify first decode token in object form
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decodedToken);
      req.user = decodedToken; // we create a user object with decodeToken value in req object  iska matlab hum apne req and res ko dusre middleware me aise bhej sakte hai
    } catch (error) {
      res.json({
        staus: 401,
        message: "Token is invalid",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong during token verification",
    });
  }
};

const isStudent = (req, res, next) => {
  //   console.log(req.user.role);
  try {
    if (req.user.role != "Student") {
      // Here i am use user object who seved in above line  we can also find role on db call and fetch role
      return res.status(401).json({
        success: false,
        status: 401,
        message: "This is route for only student",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "User role can't be verified . Please try again later",
    });
  }
  next();
};

const isInstructor = (req, res, next) => {
  //   console.log(req.user.role);
  try {
    if (req.user.role != "Instructor") {
      // Here i am use user object who seved in above line  we can also find role on db call and fetch role
      return res.status(401).json({
        success: false,
        status: 401,
        message: "This is route for only Instructor",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "User role can't be verified . Please try again later",
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  //   console.log(req.user.role);
  try {
    if (req.user.role !== "Admin") {
      // Here i am use user object who seved in above line  we can also find role on db call and fetch role
      return res.json({
        staus: 500,
        message: "This is protected route for Admin",
      });
    }
  } catch (error) {
    res.json({
      status: 501,
      message: "User role is not matching",
    });
  }
  next();
};

module.exports = { auth, isAdmin, isStudent, isInstructor };
