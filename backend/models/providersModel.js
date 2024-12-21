const pool = require("../config/database");

const getProvidersByService = async (service) => {
  const query = "SELECT * FROM providers WHERE LOWER(service) = LOWER($1)";
  const values = [service];
  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = {
  getProvidersByService,
};
