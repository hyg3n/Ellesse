// controllers/providersByCategoryController.js
const { getProvidersByCategory } = require("../models/providersByCategoryModel");

const fetchProvidersByCategory = async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: "Missing category parameter" });
  }
  try {
    const providers = await getProvidersByCategory(category);
    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers by category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { fetchProvidersByCategory };
