const mongoose = require("mongoose");
const { categorySchema } = require("../Schema/schema");

const Category = mongoose.model("Category", categorySchema);
module.exports = { Category };
