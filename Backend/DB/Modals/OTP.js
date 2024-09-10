const mongoose = require("mongoose");
const { mailSender } = require("../../utils/mailSender");
const emailOtpTemplate = require("../../mail/templates/emailOtpTemplate");

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
      emailOtpTemplate(otp)
    );
  } catch (error) {
    console.log("Error occured while sending email", error);
  }
};

// for create pre middleware we need to perform otp verification before create data in otp modal
otpSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp); // here this.email and this.otp shows that current schema object data that means otpSchema
  next();
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = { OTP };
