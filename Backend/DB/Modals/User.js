const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password should be greater than 6 characters"],
  },

  // Here confirm password is not required because we don't need store in db we only validate this from req.body
  role: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
  },
  // additionalDetails: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Profile",
  // },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  avatar: {
    type: String,
    required: true,
  },
  courseProgress: [
    {
      type: Schema.Types.ObjectId,
      ref: "CourseProgress",
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  token: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
