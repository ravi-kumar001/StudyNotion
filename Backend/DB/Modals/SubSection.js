const mongoose = require("mongoose");
const { subSectionSchema } = require("../Schema/schema");

const SubSection = mongoose.model("SubSection", subSectionSchema);
module.exports = { SubSection };
