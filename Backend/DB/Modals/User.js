const mongoose = require("mongoose");
const { userSchema } = require("../Schema/schema");

const User = mongoose.model("User", userSchema);
module.exports = { User };
