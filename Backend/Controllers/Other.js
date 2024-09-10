const {contactUsEmail} = require("../mail/templates/contactFormRes");
const { Other } = require("../DB/Modals/Other");
const { mailSender } = require("../utils/mailSender");
require("dotenv").config();

//@desc       Contact Us
//@route      POST /api/v1/other/contactus
//@access     PUBLIC
const contactUs = async (req, res) => {
  const { firstName, lastName, email, countryCode, phoneNo, message } =
    req.body;

  if (!(firstName && lastName && email && countryCode && phoneNo && message)) {
    return res.status(400).json({
      error: "Some Field are Missing",
      success: false,
    });
  }

  // Create Document in Others
  const createDocumentResponse = await Other.create({
    firstName,
    lastName,
    email,
    countryCode,
    phoneNo,
    message,
  });

  try {
    const mailResponse1 = await mailSender(
      process.env.SITE_OWNER_EMAIL,
      `Contact Me - ${message.substring(0, 10)} ...`,
      `
    <h1>Someone requested to contact you</h1>
    <h2>Contact Details</h2>
    <h1></h1>
    <p> Name : ${firstName} ${lastName}</p>
    <p> Email : ${email}</p>
    <p> Phone No : ${countryCode} ${phoneNo}</p>
    <p> Message : ${message}</p>
    <h1></h1>
    <h2>Kindly contact them, and solve their problem as soon as possible.</h2>
    <h1>Thank You !</h1>
    `
    );

    await mailSender(
      email,
      "Your Data sent to us successfully",
      contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
    );

    return res.status(200).json({
      success: true,
      data: "Details sent successfully",
    });
  } catch (err) {
    console.log("Error", err);
    return res.status(500).json({
      error: "Something went wrong.Try Again",
      success: false,
      message: "Something went wrong during Contacting",
    });
  }
};

module.exports = { contactUs };
