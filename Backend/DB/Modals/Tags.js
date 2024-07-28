const mongoose = require("mongoose");
const { tagSchema } = require("../Schema/schema");

const Tags = mongoose.model("Tags", tagSchema);
module.exports = { Tags };
