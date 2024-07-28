const mongoose = require("mongoose");
const { otpSchema } = require("../Schema/schema");

const OTP = mongoose.model("OTP", otpSchema);
module.exports = { OTP };
