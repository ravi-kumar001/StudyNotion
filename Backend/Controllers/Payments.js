const { mongoose } = require("mongoose");
const { Course } = require("../DB/Modals/Course");
const { instance } = require("../Config/rozorpay");
const { User } = require("../DB/Modals/User");
const { mailSender } = require("../utils/mailSender");

//first capture Payment and initiate the rozorpay order
const capturePament = async (req, res) => {
  // find courseId and userId
  const { courseId } = req.body;
  const userId = req.user.id;

  // Validation on courseId
  if (!courseId) {
    return res.status(400).json({
      message: "Please provide valid courseId",
      status: 400,
      success: false,
    });
  }

  try {
    // check course is available for this courseId
    var availableCourseResponse = await Course.findById(courseId);
    if (!availableCourseResponse) {
      return res.status(402).json({
        message: "Course is n't available",
        success: false,
        status: 402,
      });
    }

    // Now check that user already pay for the same course
    const convertedUserId = new mongoose.Types.ObjectId(userId);
    if (availableCourseResponse.studentsEnrolled.includes(convertedUserId)) {
      return res.status(201).json({
        status: 201,
        success: false,
        message: "User is already purchase this course",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error,
      message: "Something went wrong during capture payment . Please try again",
    });
  }

  // Initiate the payment and  Create an order in server
  var options = {
    amount: availableCourseResponse.price * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString,
    notes: {
      courseId, // here courseId and availableCourseResponse._id is same ?
      userId,
    },
  };

  try {
    const initiatedPaymentResponse = instance.orders.create(options);
    console.log(initiatedPaymentResponse);

    // Return response
    return res.json(200).json({
      success: true,
      message: "Order create successfully",
      courseName: availableCourseResponse.courseName,
      description: availableCourseResponse.description,
      thumbnail: availableCourseResponse.thumbnail,
      orderId: initiatedPaymentResponse.id,
      amount: initiatedPaymentResponse.amount,
      currency: initiatedPaymentResponse.currency,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error,
      message:
        "Something went wrong during Initiate payment . Please try again",
    });
  }
};

// Verify signature of Rozonpay and server
const verifySignature = async (req, res) => {
  try {
    const webhookSecret = "123456789";

    // extracting signature from rozorpay
    const signature = req.headers["x-rozorpay-signature"]; // this signature is encrypted form we can't decript this so

    // we use this method for encrypt out webhookSecret
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
      console.log("Payment is Authorised");

      const { courseId, userId } = req.body.payload.entity.notes;

      // full fill the all requirements
      const enrolledCourseResponse = await Course.findByIdAndUpdate(
        {
          _id: courseId,
        },
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        {
          new: true,
        }
      );
      console.log(enrolledCourseResponse);

      // if enrolledCourseResponse has no return response
      if (!enrolledCourseResponse) {
        return res.status(400).json({
          message: "Course is n't available",
          success: false,
          status: 400,
        });
      }

      const enrolledUserResponse = await User.findByIdAndUpdate(
        {
          _id: userId,
        },
        {
          $push: {
            courses: courseId,
          },
        },
        {
          new: true,
        }
      );
      console.log(enrolledUserResponse);

      // if enrolledCourseResponse has no return response
      if (!enrolledUserResponse) {
        return res.status(400).json({
          message: "User is n't available",
          success: false,
          status: 400,
        });
      }

      // Send mail regarding course purchase
      const sentEmailResponse = await mailSender(
        enrolledUserResponse.email,
        "Congratulation for purchase our course",
        "Congratulation for purchase our course"
      );

      return res.status(200).json({
        message: "Signature verified and course added",
        success: true,
        status: 200,
      });
    } else {
      return res.status(402).json({
        success: false,
        message: "invalid request",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
      message:
        "Something went wrong during verify the signature . Please try again",
    });
  }
};

module.exports = { capturePament, verifySignature };
