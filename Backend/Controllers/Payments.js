const { mongoose } = require("mongoose");
const { Course } = require("../DB/Modals/Course");
const { instance } = require("../Config/rozorpay");
const { User } = require("../DB/Modals/User");
const { CourseProgress } = require("../DB/Modals/CourseProgress");
const { mailSender } = require("../utils/mailSender");
const courseEnrollmentEmailTemplate = require("../mail/templates/courseEnrollmentEmailTemplate");
const {
  paymentSuccessEmailTemplate,
} = require("../mail/templates/paymentSuccessEmailTemplate");
const crypto = require("crypto")

// This handler function for multiple courses if we have multiple courses in cart
// @desc      Create an Razorpay order and capture payment automatically
// @route     POST /api/v1/payments/createorder
// @access    Private/Student
const createOrder = async (req, res) => {
  try {
    // Get all Courses
    const { courses } = req.body;

    // Find user Id
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validation on selectedCourses
    if (!courses || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty or you did not select any course",
      });
    }

    let totalAmount = 0;
    const availableCourses = [];

    for (let course_id of courses) {
      // Check course is available for this courseId
      const course = await Course.findOne({
        _id: course_id,
        status: "Published",
      });

      if (!course) {
        return res.status(402).json({
          success: false,
          message: "Course is not available",
        });
      }

      // Check that user hasn't already purchased the course
      if (course.studentsEnrolled.includes(user._id)) {
        return res.status(400).json({
          success: false,
          message: `User has already purchased the course with ID: ${course_id}`,
        });
      }

      totalAmount += course.price;
      availableCourses.push(course);
    }

    // Initiate the payment and create an order on the server
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `R${userId}-${Date.now()}`,
      notes: {
        userId: userId,
      },
    };

    const initiatedPaymentResponse = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      data: initiatedPaymentResponse,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({
      success: false,
      error: error.message || error,
      message:
        "Something went wrong during payment initiation. Please try again.",
    });
  }
};

// @desc      Verify signature of Razorpay and server
// @route     POST /api/v1/payments/verifypaymentsignature
// @access    Private/Student
const verifyPaymentSignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body;
    const userId = req.user.id;

    
    if (!(razorpay_order_id && razorpay_payment_id && razorpay_signature && courses && userId)) {
      return res.status(400).json({
        success : false , message : "Some fields are missing"
      })
    }
    
    // Retrieve the order_id from your server. Do not use the razorpay_order_id returned by Checkout.
    const orderId = razorpay_order_id;
    const body = orderId + '|' + razorpay_payment_id;
    console.log("Verify Payment signature is called")

    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_PAY_KEY_SECRET).update(body.toString()).digest('hex');

    // verify signature
    if (generated_signature !== razorpay_signature) {
      return res.status(401).json({
        success : false , message : "Invalid request"
      })
    }

    console.log("Alright")


    // Fulfill the action - Enroll in courses
    await enrollStudent(courses, userId);

    return res.status(200).json({
      success: true,
      data: 'Payment Verified and Student enrolled in Courses',
    });
  } catch (err) {
    return res.status(500).json({
      success : false , message : "Failed to verify signature" , error : err
    })
  }
};

// @desc      Send an email to Student for successful payment
// @route     POST /api/v1/payments/sendpaymentsuccessemail
// @access    Private/Student
const sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;

    if (!(orderId && paymentId && amount)) {
      return res.status(400).json({
        success : false , message : "Failed to send payment success email, some fields are missing"
      })
    }

    const user = await User.findById(req.user.id);
    const emailResponse = await mailSender(user.email, 'Payment Received', paymentSuccessEmailTemplate(`${user.firstName} ${user.lastName}`, amount / 100, orderId, paymentId));

    res.status(200).json({
      success: true,
      data: 'Payment success email sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success : false , message : "Failed to send payment success email"
    })
  }
};

// Enroll student in courses
const enrollStudent = async (courses, userId) => {
  if (!(courses && courses.length && userId)) {
    return res.status(400).json({
      success : false , message : "Please provide course and user details"
    })
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({
      success : false , message : "No such user found"
    })
  }

  // Enroll in courses
  for (const courseId of courses) {
    const course = await Course.findOneAndUpdate(
      {
        _id: courseId,
        status: 'Published',
      },
      { $push: { studentsEnrolled: user._id }, $inc: { numberOfEnrolledStudents: 1 } },
      { new: true }
    );

    if (!course) {
      return res.status(401).json({
        success : false , message : "Course not found"
      })
    }

    const courseProgress = await CourseProgress.create({
      courseId,
      userId,
    });

    const student = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          courses: course._id,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    if (!student) {
      return res.status(500).json({
        success : false , message : "Student not found"
      })
    }

    // Send an enrollment email to enrolled student
    const emailResponse = await mailSender(user.email, `Successfully enroll into ${course.title}`, courseEnrollmentEmailTemplate(course.title, `${user.firstName} ${user.lastName}`));
  }
};

/**
 * 
 * Below Code uses Razorpay webhook and used to buy only one course
 * 
 * 

// @desc      Capture the payment and create the Razorpay order
// @route     POST /api/v1/payments/capturepayment
// @access    Private/Student
exports.capturePayment = async (req, res, next) => {
  try {
    const { courseId } = req.user.id;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!courseId) {
      return next(new ErrorResponse('Please enter a valid course ID', 404));
    }

    // check if course exist or not
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorResponse('Could not find the course, please enter vaild course details', 404));
    }

    // check if user already paid for this course
    if (course.studentsEnrolled.includes(userId)) {
      return next(new ErrorResponse('Student is already enrolled', 404));
    }

    // Create order
    try {
      const options = {
        amount: course.price * 100,
        currency: 'INR',
        receipt: `${userId}.${Date.now()}`,
        notes: {
          courseId,
          userId,
        },
      };

      // Initiate the payment using razorpay
      const paymentResponse = await razorpayInstance.orders.create(options);

      return res.status(200).json({
        success: true,
        courseTitle: course.title,
        courseDescription: course.description,
        courseThumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (err) {
      return next(new ErrorResponse('Could not create order. Please try again', 500));
    }
  } catch (err) {
    next(new ErrorResponse('Failed to create order. Please try again', 500));
  }
};

// @desc      Verify signature of Razorpay and server
// @route     POST /api/v1/payments/verifysignature
// @access    Private/Student
exports.verifySignature = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return next(new ErrorResponse('Some fields are missing', 404));
    }

    const shasum = crypto.createHmace('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    // verify signature
    if (signature !== digest) {
      return next(new ErrorResponse('Invalid request', 400));
    }

    // Fulfill the action
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    addCourse(res, courseId, userId);
  } catch (err) {
    next(new ErrorResponse('Failed to verify signature', 500));
  }
};


// Add a course to Student courses array
const addCourse = async (res, courseId, userId) => {
  // Find the course and enroll the student in it
  if (!(courseId && userId)) {
    return next(new ErrorResponse('Invalid request', 404));
  }

  // update course
  const enrolledCourse = await Course.findOneAndUpdate(
    { _id: courseId },
    {
      $push: { studentsEnrolled: userId },
      $inc: { numberOfEnrolledStudents: 1 },
    },
    { new: true }
  );

  if (!enrolledCourse) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // update student - enroll the student
  const enrolledUser = await User.findOneAndUpdate(
    { _id: userId },
    {
      $push: { courses: courseId },
    },
    { new: true }
  );

  if (!enrolledUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Create a courseProgress 
  const courseProgress = await CourseProgress.create({
    courseId,
    userId
  })

  // Send course enrollment mail to user
  try {
    const emailResponse = await emailSender(enrolledUser.email, 'Congratulations for buying new course from StudyNotion', courseEnrollmentEmailTemplate(enrolledCourse.title, enrolledUser.firstName));

    res.status(200).json({
      success: true,
      data: 'Course added to user',
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      data: 'Course added to user, but failed to send course enrollment email',
    });
  }
};
*/

module.exports = {
  createOrder,
  verifyPaymentSignature,
  sendPaymentSuccessEmail
};
