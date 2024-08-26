const { Category } = require("../DB/Modals/Category");

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

// Get All Category
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

// CategoryPage Details
const getAllCategoryCourses = async (req, res) => {
  try {
    // Fetch category Id
    const { categoryId } = req.body;

    // Get course for specified category
    const selectedCategoryResponse = await Category.findById(categoryId)
      .populate("course")
      .exec();
    console.log(selectedCategoryResponse);

    // validation if No Category Response
    if (!selectedCategoryResponse) {
      console.log("categroy not found");
      return res.status(404).json({
        success: false,
        message: "categroy not found",
        status: 404,
      });
    }

    // Handle the case there is no course available in selectedCategory
    if (!selectedCategoryResponse.course.length == 0) {
      return res.status(405).json({
        status: 405,
        message: "No course found for this selected category",
        success: false,
      });
    }

    // find selected Course
    const selectedCourseResponse = selectedCategoryResponse.course;
    console.log(selectedCourseResponse);

    // get course for different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("course")
      .exec();
    console.log(differentCategories);

    // Get top selling course
    // HW

    // Return respons
    return res.status(200).json({
      status: 200,
      message: "Category Page Details find successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message:
        "Something went wrong during finding Category Page Details. Please try again",
    });
  }
};

module.exports = { createCategory, getAllCategories, getAllCategoryCourses };
