// controllers/servicesByCategoryController.js
const { getAllCategories } = require("../models/serviceCategoriesModel");
const { getServicesGroupedByCategory } = require("../models/servicesByCategoryModel");

const getServicesByCategory = async (req, res) => {
  try {
    const categories = await getAllCategories();
    const servicesMap = await getServicesGroupedByCategory();

    const enriched = categories.map(category => ({
      ...category,
      services: servicesMap[category.id] || [],
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching services by category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getServicesByCategory };
