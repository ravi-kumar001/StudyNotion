const mongoose = require("mongoose");
const { otherSchema } = require("../Schema/schema");

const Other = mongoose.model("Other", otherSchema);

module.exports = { Other };
