const mongoose = require("mongoose");
const { mailSender } = require("../../utils/mailSender");

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
    min: [6, "Password should be greater than 6 charactor"],
  },
  // Here confirm password is not required because we don't need store in db we only validate this from req.body
  role: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
  },
  token: {
    type: String,
  },
  tokenExpires: {
    type: Date,
  },
  additionalDetails: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
  },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  avtar: {
    type: String,
    required: true,
  },
  courseProgress: [
    {
      type: Schema.Types.ObjectId,
      ref: "CourseProgress",
    },
  ],
});

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ["Male", "Female", "Non-Binary", "Prefer not to say", "Other", null],
    default: null,
  },
  dob: {
    type: String,
    default: null,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
    min: [10, "Mobile no. should be 10 digits"],
  },
});

const courseProgress = new mongoose.Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  completedVideos: {
    type: Schema.Types.ObjectId,
    ref: "SubSection",
  },
});

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  timeDuration: {
    type: String,
    default: "0",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  section: {
    type: Schema.Types.ObjectId,
    ref: "Section",
  },
});

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
    required: true,
  },
  courseContent: {
    type: Schema.Types.ObjectId,
    ref: "Section",
  },
  ratingAndReviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "RatingAndReviews",
    },
  ],
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  thumbnail: {
    type: String,
    trim: true,
    required: true,
  },
  tags: {
    type: Schema.Types.ObjectId,
    ref: "Tags",
  },
  numberOfEnrolledStudents: {
    type: Number,
    default: 0,
  },
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subSection: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
});

const ratingAndReviewsSchema = new mongoose.Schema({
  review: {
    type: String,
    trim: true,
    required: true,
  },
  rating: {
    type: Number,
    min: [1, "Please give rating between 1 and 5"],
    max: [5, "Please give rating between 1 and 5"],
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  course: [{
    type: Schema.Types.ObjectId,
    ref: "Course",
  }],
});

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
  },
  otp: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "5m", // This will be automatically deleted after 5 minute
  },
});

// A function to send email for verification
const sendVerificationEmail = async (email, otp) => {
  try {
    const mailResponse = await mailSender(
      email,
      "OTP Verification by StudyNotion",
      otp
    );
    console.log("Mail Response", mailResponse);
  } catch (error) {
    console.log("Error occured while sending email", error);
  }
};

// for create pre middleware we need to perform otp verification before create data in otp modal
otpSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp); // here this.email and this.otp shows that current schema object data that means otpSchema
  next();
});

module.exports = {
  userSchema,
  profileSchema,
  courseProgress,
  subSectionSchema,
  courseSchema,
  sectionSchema,
  ratingAndReviewsSchema,
  tagSchema,
  otpSchema,
};
