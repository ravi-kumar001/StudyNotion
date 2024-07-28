const mongoose = require("mongoose");
const { profileSchema } = require("../Schema/schema");

const Profile = mongoose.model("Profile", profileSchema);
module.exports = { Profile };
