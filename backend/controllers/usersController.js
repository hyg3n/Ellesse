// controllers/usersController.js
const { getProvidersByService } = require("../models/usersModel");
const { validationResult } = require("express-validator");

const getProviders = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation failed:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { service_name } = req.query;
  console.log('🔍 Received service_name:', service_name);

  try {
    const users = await getProvidersByService(service_name);
    console.log('✅ Users fetched:', users);
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  getProviders,
};
