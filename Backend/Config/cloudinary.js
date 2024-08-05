// Require the Cloudinary library
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { cloudinaryConnect };
