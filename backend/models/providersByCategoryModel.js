// models/providersByCategoryModel.js
const pool = require("../config/database");

const getProvidersByCategory = async (category) => {
  const query = `
    SELECT 
      ps.id    AS ps_id,  
      u.id     AS user_id,
      u.name, 
      u.email, 
      u.phone_number, 
      u.rating, 
      u.latitude, 
      u.longitude, 
      s.name AS service_name, 
      ps.price
    FROM provider_services ps
    JOIN users u ON ps.user_id = u.id
    JOIN services s ON ps.service_id = s.id
    JOIN service_categories sc ON s.category_id = sc.id
    WHERE LOWER(sc.name) = LOWER($1) AND u.role LIKE '%provider%';
  `;
  const values = [category];
  const { rows } = await pool.query(query, values);
  return rows;
};

module.exports = { getProvidersByCategory };
