const Category = require("../models/Categories"); // Import the Category model
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    // Extract name and description from the request body
    const { name, description } = req.body;

    // Check if name or description is missing
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields required", // Return a 400 error if fields are missing
      });
    }

    // Create a new category with the provided name and description
    const categoryDetails = await Category.create({ name, description });
    console.log(categoryDetails); // Log the created category details

    // Return a success response with the created category details
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      categoryDetails,
    });
  } catch (error) {
    console.log(error); // Log the error
    // Return a 500 error response with a failure message
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// Show all categories
exports.showAllCategories = async (req, res) => {
  try {
    // Fetch all categories with only name and description fields
    const allCategories = await Category.find({});

    // Return a success response with all categories
    return res.status(200).json({
      success: true,
      message: "All categories returned successfully",
      data: allCategories,
    });
  } catch (error) {
    console.log(error); // Log the error
    // Return a 500 error response with a failure message
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};


// Get details for a specific category and different categories
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body
    console.log("PRINTING CATEGORY ID: ", categoryId);
    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

    //console.log("SELECTED COURSE", selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" })
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
      //console.log("Different COURSE", differentCategory)
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
      },
      })
      .exec()
    const allCourses = allCategories.flatMap((category) => category.courses)
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)
     // console.log("mostSellingCourses COURSE", mostSellingCourses)
    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}