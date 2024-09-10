const { Category } = require("../DB/Modals/Category");
const { Course } = require("../DB/Modals/Course");

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

// Create Category   hame course schema ko bhi update karna hai
// @desc      Create a category
// @route     POST /api/v1/categories
// @access    Private/Admin // VERIFIED
const createCategory = async (req, res) => {
  try {
    // Fetch Data
    const { name, description } = req.body;

    // Validate data
    if (!name || !description) {
      return res.status(401).json({
        status: 401,
        message: "All field are required",
        success: false,
      });
    }

    // Create entry in db
    const createCategoryResponse = await Category.create({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Category create successfully",
      data: createCategoryResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during creating category . Please try again",
    });
  }
};

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public // VERIFIED
const getAllCategories = async (req, res) => {
  try {
    // const getAllCategoryResponse = await Category.find(
    //   {},
    //   { name: true }, // Here getAllCategory Variable return this value
    //   { description: true } // Here getAllCategory Variable return this value
    // );
    const getAllCategoryResponse = await Category.find({}, "name description");

    return res.status(200).json({
      success: true,
      data: getAllCategoryResponse,
      count: getAllCategoryResponse.length,
      message: "All Category find successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during finding Category . Please try again",
    });
  }
};

// @desc      Get all courses of a category [+ other courses + top 10 selling courses]
// @route     GET /api/v1/categories/getcategorycourses/:categoryId
// @access    Public // VERIFIED
const getAllCategoryCourses = async (req, res) => {
  try {
    // Get requested category courses - If selected category is not found, return null for only selected
    const { categoryId } = req.body;
    let requestedCategory = null;
    let requestedCategoryCoursesMost = null;
    let requestedCategoryCoursesNew = null;

    if (categoryId) {
      const reqCat = await Category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: {
            path: "instructor",
          },
        })
        .exec();

      requestedCategory = {
        name: reqCat.name,
        description: reqCat.description,
        _id: reqCat._id,
      };

      if (reqCat.course.length) {
        requestedCategoryCoursesMost = reqCat.course.sort(
          (a, b) => b.numberOfEnrolledStudents - a.numberOfEnrolledStudents
        );

        requestedCategoryCoursesNew = reqCat.course.sort(
          (a, b) => b.createdAt - a.createdAt
        );
      }
    }

    // // Handle the case there is no course available in selectedCategory
    // if (!selectedCategoryResponse.course.length == 0) {
    //   return res.status(405).json({
    //     status: 405,
    //     message: "No course found for this selected category",
    //     success: false,
    //   });
    // }

    // // find selected Course
    // const selectedCourseResponse = selectedCategoryResponse.course;
    // console.log(selectedCourseResponse);

    // Get courses for other categories
    const categoriesExceptRequested = await Category.find({
      _id: { $ne: categoryId },
    });

    const otherCategoryCourses = await Category.findById(
      categoriesExceptRequested[getRandomInt(categoriesExceptRequested.length)]
        ._id
    ).populate({
      path: "course",
      match: { status: "Published" },
      populate: {
        path: "instructor",
      },
    });

    // Get top 10 selling courses
    const topSellingCourses = await Course.find({
      status: "Published",
    })
      .sort({
        numberOfEnrolledStudents: "desc",
      })
      .populate({
        path: "category",
        match: { status: "Published" },
        select: "name",
      })
      .populate("instructor")
      .limit(10);

    return res.status(200).json({
      data: {
        requestedCategory,
        requestedCategoryCoursesMost,
        requestedCategoryCoursesNew,
        otherCategoryCourses,
        topSellingCourses,
      },
      message: "Category Page Details find successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error in Get All Category Courses", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong during finding Category Page Details. Please try again",
    });
  }
};

module.exports = { createCategory, getAllCategories, getAllCategoryCourses };
