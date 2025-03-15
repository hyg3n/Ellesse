const { getProvidersByService } = require("../models/usersModel");
const { validationResult } = require("express-validator");

const getProviders = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { service_name } = req.query; // Updated from `services_offered`

  try {
    const users = await getProvidersByService(service_name);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getProviders,
};
