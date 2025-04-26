// models/servicesByCategoryModel.js
const pool = require("../config/database");

const getServicesGroupedByCategory = async () => {
  const query = `
    SELECT s.id, s.name, s.category_id
    FROM services s
    ORDER BY s.name;
  `;
  const { rows } = await pool.query(query);

  // Group services under their category_id
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.category_id]) grouped[row.category_id] = [];
    grouped[row.category_id].push({
      id: row.id,
      name: row.name,
    });
  }

  return grouped;
};

module.exports = { getServicesGroupedByCategory };
