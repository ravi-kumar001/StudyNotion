const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: [true, "All Category name must be unique"],
  },
  description: {
    type: String,
    required: true,
  },
  course: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const Category = mongoose.model("Category", categorySchema);

module.exports = { Category };
