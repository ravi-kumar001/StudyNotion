const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingAndReviewsSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: [1, "Please give rating between 1 and 5"],
    max: [5, "Please give rating between 1 and 5"],
    required: true,
  },
  review: {
    type: String,
    trim: true,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ratingAndReviewsSchema.statics.getAverageRating = async function (courseId) {
  try {
    const obj = await this.aggregate([
      {
        $match: { course: courseId },
      },
      {
        $group: {
          _id: '$course',
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    try {
      await this.model('Course').findByIdAndUpdate(courseId, {
        averageRating: obj.length ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      });
    } catch (err) {
      throw err;
    }
  } catch (err) {
    throw err;
  }
};

ratingAndReviewsSchema.post('save', async function (doc) {
  await this.constructor.getAverageRating(this.course);
});

ratingAndReviewsSchema.post('deleteOne', { document: true, query: false }, async function (next) {
  await this.constructor.getAverageRating(this.course);
});

const RatingAndReviews = mongoose.model(
  "RatingAndReviews",
  ratingAndReviewsSchema
);

module.exports = { RatingAndReviews };
