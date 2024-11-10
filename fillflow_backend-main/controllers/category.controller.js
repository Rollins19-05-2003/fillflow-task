const Category = require("../models/category.model");

exports.createCategory = async (req, res) => {
  const data = req.body;
  try {
    const newCategory = await Category.create({
      category_name: data.category_name,
      category_description: data.category_description,
    });
    if (!newCategory) {
      return res.status(404).json({
        success: false,
        message: "Category is not created.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "SuccessFully created the Category",
      data: newCategory,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    // Fetch all categories from the database
    const allCategories = await Category.find();

    // Check if categories exist
    if (!allCategories || allCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found.",
      });
    }

    // Return success response with categories data
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved all categories",
      data: allCategories,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
