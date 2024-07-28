const { Tags } = require("../DB/Modals/Tags");

const createTags = async (req, res) => {
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
    const createTagsResponse = await Tags.create({
      name,
      description,
    });
    console.log(createTagsResponse);

    res.status(200).json({
      success: true,
      message: "Tag create successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during creating tag . Please try again",
    });
  }
};

const getAllTags = async (req, res) => {
  try {
    const getAllTagsResponse = await Tags.find(
      {},
      { name: true }, // Here getAllTags Variable return this value
      { description: true } // Here getAllTags Variable return this value
    );
    console.log(getAllTagsResponse);

    res.status(200).json({
      success: true,
      message: "All Tag find successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong during finding tag . Please try again",
    });
  }
};
