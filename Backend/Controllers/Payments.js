const { mongoose } = require("mongoose");
const { Course } = require("../DB/Modals/Course");
const { instance } = require("../Config/rozorpay");
const { User } = require("../DB/Modals/User");
const { mailSender } = require("../utils/mailSender");
const courseEnrollmentEmailTemplate = require("../mail/templates/courseEnrollmentEmailTemplate");
const {
  paymentSuccessEmailTemplate,
} = require("../mail/templates/paymentSuccessEmailTemplate");

//first capture Payment and initiate the rozorpay order this handler function only for single course
// const capturePayment = async (req, res) => {
//   // find courseId and userId
//   const { courseId } = req.body;
//   const userId = req.user.id;

//   // Validation on courseId
//   if (!courseId) {
//     return res.status(400).json({
//       message: "Please provide valid courseId",
//       status: 400,
//       success: false,
//     });
//   }

//   try {
//     // check course is available for this courseId
//     var availableCourseResponse = await Course.findById(courseId);
//     if (!availableCourseResponse) {
//       return res.status(402).json({
//         message: "Course is n't available",
//         success: false,
//         status: 402,
//       });
//     }

//     // Now check that user already pay for the same course
//     const convertedUserId = new mongoose.Types.ObjectId(userId);
//     if (availableCourseResponse.studentsEnrolled.includes(convertedUserId)) {
//       return res.status(201).json({
//         status: 201,
//         success: false,
//         message: "User is already purchase this course",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       status: 500,
//       error: error,
//       message: "Something went wrong during capture payment . Please try again",
//     });
//   }

//   // Initiate the payment and  Create an order in server
//   var options = {
//     amount: availableCourseResponse.price * 100,
//     currency: "INR",
//     receipt: Math.random(Date.now()).toString(),
//     notes: {
//       courseId, // here courseId and availableCourseResponse._id is same ?
//       userId,
//     },
//   };

//   try {
//     const initiatedPaymentResponse = instance.orders.create(options);
//     console.log(initiatedPaymentResponse);

//     // Return response
//     return res.json(200).json({
//       success: true,
//       message: "Order create successfully",
//       courseName: availableCourseResponse.courseName,
//       description: availableCourseResponse.description,
//       thumbnail: availableCourseResponse.thumbnail,
//       orderId: initiatedPaymentResponse.id,
//       amount: initiatedPaymentResponse.amount,
//       currency: initiatedPaymentResponse.currency,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       status: 500,
//       error: error,
//       message:
//         "Something went wrong during Initiate payment . Please try again",
//     });
//   }
// };

// This handler function for multiple courses if we have multiple courses in cart
const capturePayment = async (req, res) => {
  // Get all Courses
  const { selectedCourses } = req.body;

  // Find user Id
  const userId = req.user.id;

  // Validation on selectedCourses
  if (selectedCourses.length == 0) {
    return res.json(400).json({
      success: false,
      message: "Your cart is empty or You not select any course",
      status: 400,
    });
  }

  let totalAmount = 0;
  try {
    for (let course_id of selectedCourses) {
      // check course is available for this courseId
      var availableCourseResponse = await Course.findById(course_id);
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

      totalAmount += availableCourseResponse.price;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
      message: "Something went wrong during capture payment . Please try again",
    });
  }

  // Initiate the payment and  Create an order in server
  var options = {
    amount: availableCourseResponse.price * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    const initiatedPaymentResponse = instance.orders.create(options);
    console.log(initiatedPaymentResponse);

    // Return response
    return res.json(200).json({
      success: true,
      message: "Order create successfully",
      status: 200,
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
// const verifySignature = async (req, res) => {
//   try {
//     const webhookSecret = "123456789";

//     // extracting signature from rozorpay
//     const signature = req.headers["x-rozorpay-signature"]; // this signature is encrypted form we can't decript this so

//     // we use this method for encrypt out webhookSecret
//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if (signature === digest) {
//       console.log("Payment is Authorised");

//       const { courseId, userId } = req.body.payload.entity.notes;

//       // full fill the all requirements
//       const enrolledCourseResponse = await Course.findByIdAndUpdate(
//         {
//           _id: courseId,
//         },
//         {
//           $push: {
//             studentsEnrolled: userId,
//           },
//         },
//         {
//           new: true,
//         }
//       );
//       console.log(enrolledCourseResponse);

//       // if enrolledCourseResponse has no return response
//       if (!enrolledCourseResponse) {
//         return res.status(400).json({
//           message: "Course is n't available",
//           success: false,
//           status: 400,
//         });
//       }

// find the user and add this course and add this
//       const enrolledUserResponse = await User.findByIdAndUpdate(
//         {
//           _id: userId,
//         },
//         {
//           $push: {
//             courses: courseId,
//           },
//         },
//         {
//           new: true,
//         }
//       );
//       console.log(enrolledUserResponse);

//       // if enrolledCourseResponse has no return response
//       if (!enrolledUserResponse) {
//         return res.status(400).json({
//           message: "User is n't available",
//           success: false,
//           status: 400,
//         });
//       }

//       // Send mail regarding course purchase
//       const sentEmailResponse = await mailSender(
//         enrolledUserResponse.email,
//         "Congratulation for purchase our course",
//         "Congratulation for purchase our course"
//       );

//       return res.status(200).json({
//         message: "Signature verified and course added",
//         success: true,
//         status: 200,
//       });
//     } else {
//       return res.status(402).json({
//         success: false,
//         message: "invalid request",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       status: 500,
//       error: error.message,
//       message:
//         "Something went wrong during verify the signature . Please try again",
//     });
//   }
// };

// Verify Payments
const verifyPayment = async (req, res) => {
  try {
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const userId = res.user.id;
    const courses = req.body?.courses;

    // Some Validation
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !courses
    ) {
      return res.status(400).json({
        message: "Payments failed",
        success: false,
        status: 400,
      });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.ROZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature == razorpay_signature) {
      // Enrolled Student in course
      await enrolledStudent(courses, userId, res);

      // Return Response
      return res.status(200).json({
        message: "Payment Verified",
        success: true,
        status: 200,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Payment Failed",
      status: 500,
    });
  }
};

const enrolledStudent = async (courses, userId, res) => {
  // Some Validation
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please Provide courses and userId for enrolled students",
      status: 400,
    });
  }

  // Enrolled Students
  try {
    for (const course_id of courses) {
      const enrolledCourseResponse = await Course.findByIdAndUpdate(
        {
          _id: course_id,
        },
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        { new: true }
      );

      console.log(enrolledCourseResponse);

      // Validation on Response
      if (!enrolledCourseResponse) {
        return res.status(401).json({
          message: "Course Not Found",
        });
      }

      // find the user and add this course and add this
      const enrolledUserResponse = await User.findByIdAndUpdate(
        {
          _id: userId,
        },
        {
          $push: {
            courses: course_id,
          },
        },
        {
          new: true,
        }
      );
      console.log(enrolledUserResponse);

      // if enrolledCourseResponse has no return response
      if (!enrolledUserResponse) {
        return res.status(402).json({
          message: "User is n't available",
          success: false,
          status: 402,
        });
      }

      // Send the a mail ragarding this purchase
      const sentEmailResponse = await mailSender(
        enrolledUserResponse.email,
        `Successfully enrolled into ${enrolledCourseResponse.courseName}`,
        courseEnrollmentEmailTemplate(
          enrolledCourseResponse.courseName,
          enrolledUserResponse.firstName
        )
      );

      if (!sentEmailResponse) {
        return res.status(403).json({
          message:
            "Something went Wrong during email sent . Please try again Later",
        });
      }
      return res.status(200).json({
        success: true,
        message: "User enrolled the course successfully",
        status: 200,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      error: error.message,
      message:
        "Something went wrong during enrolled the course . Please try again",
    });
  }
};

const sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;

    if (!(orderId && paymentId && amount)) {
      return res.status(400).json({
        success: false,
        message:
          "Failed to send payment success email, some fields are missing",
        status: 404,
      });
    }

    const user = await User.findById(req.user.id);
    const emailResponse = await mailSender(
      user.email,
      "Payment Received",
      paymentSuccessEmailTemplate(
        `${user.firstName} ${user.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );

    res.status(200).json({
      success: true,
      data: "Payment success email sent successfully",
      emailResponse,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send payment success email",
      status: 500,
      success: false,
    });
  }
};

module.exports = { capturePayment, verifyPayment, sendPaymentSuccessEmail };
