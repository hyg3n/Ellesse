// controllers/providersController.js
const { getProvidersByService } = require("../models/providersModel");
const { validationResult } = require("express-validator");

const getProviders = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation failed:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { service_name } = req.query;
  console.log('Received service_name:', service_name);

  try {
    const providers = await getProvidersByService(service_name);
    console.log('Providers fetched:', providers);
    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  getProviders,
};
