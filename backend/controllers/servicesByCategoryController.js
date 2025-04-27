// controllers/servicesByCategoryController.js
const { getAllCategories } = require("../models/serviceCategoriesModel");
const { getServicesGroupedByCategory } = require("../models/servicesByCategoryModel");
const pool = require("../config/database");        

const getServicesByCategory = async (req, res) => {
  try {
    const userId = req.user.id;                    // the logged-in provider

    // load categories + full service map
    const categories = await getAllCategories();
    const servicesMap = await getServicesGroupedByCategory();

    // load any existing provider_services rows
    const { rows: existing } = await pool.query(
      "SELECT service_id FROM provider_services WHERE user_id = $1",
      [userId]
    );
    const have = new Set(existing.map(r => r.service_id));

    // build the payload, filtering out services the user already has
    const enriched = categories.map(category => ({
      ...category,
      services: (servicesMap[category.id] || []).filter(
        svc => !have.has(svc.id)
      ),
    }));

    return res.json(enriched);
  } catch (err) {
    console.error("Error fetching services by category:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getServicesByCategory };
