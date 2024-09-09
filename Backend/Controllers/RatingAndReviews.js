const { RatingAndReviews } = require("../DB/Modals/RatingAndReviews");
const { Course } = require("../DB/Modals/Course");
const { User } = require("../DB/Modals/User");
const { mongoose } = require("mongoose");

// @desc      Create Review
// @route     POST /api/v1/createreview
// @access    Private/Student // VERIFIED
const createReview = async (req, res) => {
  try {
    // Fetch User Id
    const userId = req.user.id;

    // Fetch Rating and reviews
    const { rating, review, courseId } = req.body;

    if (!(rating && review && courseId)) {
      return res.status(400).json({
        message: "Some Fields are required",
        success: false,
      });
    }

    // Check if user is enrolled or not
    const enrolledOrNotResponse = await Course.findOne({
      _id: courseId,
      studentsEnrolled: {
        $elemMatch: {
          $eq: userId,
        },
      },
    });

    // Validation on enrolledOrNotResponse
    if (!enrolledOrNotResponse) {
      return res.status(401).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // Check that user already reviewed this course or not
    const alreadyReviewedResponse = await RatingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewedResponse) {
      return res.status(409).json({
        message: "Course is already reviewed by the student",
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

    // Update course schema with this rating and reviews
    const updatedCourseResponse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: createRatingAndReviewsResponse._id,
        },
      },
      { new: true }
    );

    // Update user schema with this rating and reviews
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          reviews: createRatingAndReviewsResponse._id,
        },
      },
      { new: true }
    );

    // Return response
    return res.status(200).json({
      data: createRatingAndReviewsResponse,
      message: "Rating and reviews created successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to create rating and reviews.Please try again",
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

// @desc      Get all reviews
// @route     GET /api/v1/reviews/getallreviews
// @access    Public // VERIFIED
const getAllReviews = async (req, res) => {
  try {
    const allRatingAndReviews = await RatingAndReviews.find({})
      .sort({
        rating: "desc",
      })
      .populate({ path: "user", select: "firstName lastName email avatar" })
      .populate({ path: "course", select: "courseName" })
      .exec();
    console.log("All Rating and Reviews Response => ", allRatingAndReviews);

    // Return Response
    return res.status(200).json({
      message: "All Rating and reviews fetched successfully",
      success: true,
      data: allRatingAndReviews,
      count: allRatingAndReviews.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong during Get All Rating and Reviews . Please try again",
    });
  }
};

// @desc      Get all reviews of a course
// @route     POST /api/v1/reviews/getreviewsofcourse
// @access    Public // VERIFIED
const getReviewsOfCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res
        .status(400)
        .json({ message: "Invalid request", success: false });
    }

    const course = await Course.findById(courseId)
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName email avatar",
        },
      })
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "course",
          select: "title _id",
        },
      });

    if (!course) {
      return res.json({
        success: false,
        message: "No such course found",
      });
    }

    return res.status(200).json({
      success: true,
      count: course.ratingAndReviews.length,
      data: course.ratingAndReviews,
    });
  } catch (err) {
    console.log("Error in GetReviewOfCourse", err);
    return res.status(500).json({
      message: "Failed to fetching Reviews. Please try again",
      success: false,
    });
  }
};

// @desc      Delete a review
// @route     DELETE /api/v1/deletereview
// @access    Private/Student+Admin // VERIFIED
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    if (!reviewId) {
      return res
        .status(400)
        .json({ message: "Invalid request", success: false });
    }

    const review = await RatingAndReviews.findById(reviewId);

    if (!review) {
      return res.status(401).json({
        message: "No such review found",
        success: false,
      });
    }

    // Make sure user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(402).json({
        success: false,
        message: "Not authorized for this task",
      });
    }

    // update course and user
    await User.findByIdAndUpdate(
      review.user,
      {
        $pull: {
          reviews: review._id,
        },
      },
      {
        new: true,
      }
    );

    await Course.findOneAndUpdate(
      review.course,
      {
        $pull: {
          ratingAndReviews: review._id,
        },
      },
      { new: true }
    );

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      data: "Review deleted successfully",
    });
  } catch (error) {
    console.log("Error in Delete Review", err);
    return res.status(500).json({
      message: "Failed to delete Reviews. Please try again",
      success: false,
    });
  }
};

// @desc      Get a review
// @route     POST /api/v1/reviews/getreview
// @access    Public // VERIFIED
const getReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    if (!reviewId) {
      return res
        .status(400)
        .json({ message: "Invalid request", success: false });
    }

    const review = await RatingAndReviews.findById(reviewId)
      .populate({
        path: "user",
        select: "firstName lastName email avatar",
      })
      .populate({
        path: "course",
        select: "title _id",
      });
    console.log("Review Details => ", review);

    if (!review) {
      return res.json({
        success: false,
        message: "No such course found",
      });
    }

    return res.status(200).json({
      data: review,
      success: true,
    });
  } catch (error) {}
};

module.exports = {
  createReview,
  getReviewsOfCourse,
  deleteReview,
  getReview,
  getAllReviews,
};
