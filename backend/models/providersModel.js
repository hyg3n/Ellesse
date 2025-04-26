// models/providersModel.js
const pool = require("../config/database");

const getProvidersByService = async (service) => {
  const query = `
    SELECT 
      u.id, 
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
    WHERE LOWER(s.name) = LOWER($1) AND u.role LIKE '%provider%';
  `;
  const values = [service];
  const result = await pool.query(query, values);
  return result.rows;
};


module.exports = {
  getProvidersByService,
};
