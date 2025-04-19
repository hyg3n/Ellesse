// models/serviceCategoriesModel.js
const pool = require("../config/database");

const getAllCategories = async () => {
  const query = `
    SELECT * FROM service_categories
    ORDER BY name ASC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

module.exports = { getAllCategories };
