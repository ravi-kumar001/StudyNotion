const Razorpay = require("razorpay");
require("dotenv").config();

// Instantiate the Razorpay Instance
var instance = new Razorpay({
  key_id: process.env.ROZORPAY_KEY_ID,
  key_secret: process.env.ROZORPAY_KEY_SECRET,
});

module.exports = { instance };
