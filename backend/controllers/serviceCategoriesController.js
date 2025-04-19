// controllers/serviceCategoriesController.js
const { getAllCategories } = require("../models/serviceCategoriesModel");

const fetchCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { fetchCategories };
