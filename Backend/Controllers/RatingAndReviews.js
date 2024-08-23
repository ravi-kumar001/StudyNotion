const { RatingAndReviews } = require("../DB/Modals/RatingAndReviews");
const { Course } = require("../DB/Modals/Course");
const { mongoose } = require("mongoose");

// Create Rating
const createRating = async (req, res) => {
  try {
    // Fetch User Id
    const { userId } = req.user.id;

    // Fetch Rating and reviews
    const { rating, review, courseId } = req.body;

    // check if user is enrolled or not
    const enrolledOrNotResponse = await Course.findOne({
      _id: courseId,
      studentsEnrolled: {
        $elMatch: {
          $eq: userId,
        },
      },
    });
    console.log(enrolledOrNotResponse);

    // Validation on enrolledOrNotResponse
    if (!enrolledOrNotResponse) {
      return res.status(400).json({
        success: false,
        message: "User is not enrolled the course",
        status: 400,
      });
    }

    // Check that user already reviewed this course or not
    const alreadyReviewedResponse = await RatingAndReviews.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewedResponse) {
      return res.status(401).json({
        status: 401,
        message: "User already reviewed this course",
        success: false,
      });
    }

    // Create Rating and reviews
    const createRatingAndReviewsResponse = await RatingAndReviews.create({
      rating,
      review,
      user: userId,
      course: courseId,
    });
    console.log(createRatingAndReviewsResponse);

    // Update course schema with this rating and reviews
    const updatedCourseResponse = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: createRatingAndReviewsResponse._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseResponse);

    // Return response
    return res.status(200).json({
      status: 200,
      message: "Rating and reviews created successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during create rating and reviews . Please try again",
    });
  }
};

// Get Average Rating
const getAverageRating = async (req, res) => {
  try {
    // fetch courseId
    const { courseId } = req.body;

    // calculate average rating
    const result = await RatingAndReviews.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    console.log(result);

    // Return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // if no rating and review exist
    return res.status(200).json({
      message: "Average rating is 0 , no rating given till now",
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during calculate average rating . Please try again",
    });
  }
};

// Get All Rating and Reviews
const getAllRatingAndReviews = async (req, res) => {
  try {
    const allRatingAndReviews = await RatingAndReviews.find({})
      .sort({
        rating: "desc",
      })
      .populate({ path: "user", select: "firstName lastName email avatar" })
      .populate({ path: "course", select: "courseName" })
      .exec();
    console.log(allRatingAndReviews);

    // Return Response
    return res.status(200).json({
      message: "All Rating and reviews fetched successfully",
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during Get All Rating and Reviews . Please try again",
    });
  }
};

module.exports = { createRating, getAverageRating, getAllRatingAndReviews };
